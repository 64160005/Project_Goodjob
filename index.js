const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const dbConnection = require('./database');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.urlencoded({ extended: false }));

// SET OUR VIEWS AND VIEW ENGINE
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// APPLY COOKIE SESSION MIDDLEWARE
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  next();
});


// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return next();
  }
  dbConnection.query("SELECT `name` FROM `users` WHERE `id`=?", [req.session.userID], (err, rows) => {
    if (err) {
      console.error("Select query error:", err); // Logging error if select query fails
      if (err) throw err;
    } else {
      res.render('home-user', { // Changed to 'home-user'
        name: rows[0].name
      });
    }
  });
};
const ifLoggedin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/home-user'); // Changed to '/home-user'
  }
  next();
};

// ROOT PAGE (Redirects to Home if logged in)
app.get('/', ifNotLoggedin, (req, res) => {
  res.render('index');
});

// USER REGISTRATION PAGE
app.get('/register-user', ifLoggedin, (req, res) => {
  res.render('register-user', { errors: [] }); // Render the user registration template with an empty errors array
});

app.post('/register-user', ifLoggedin, [
  body('user_email', 'Invalid email address!').isEmail().custom((value) => {
    return dbConnection.query('SELECT `email` FROM `users` WHERE `email`=?', [value])
      .then(([rows]) => {
        if (rows.length > 0) {
          return Promise.reject('This E-mail already in use!');
        }
        return true;
      });
  }),
  body('user_pass', 'The password must be of minimum length 6 characters').trim().isLength({ min: 6 }),
  body('user_name', 'Username is Empty!').trim().not().isEmpty(),
  body('introduce').optional({ nullable: true }),
  body('gender').optional({ nullable: true }),
  body('birthday').optional({ nullable: true }),
  body('address').optional({ nullable: true }),
  body('identification').optional({ nullable: true }),
  body('user_phonenumber').optional({ nullable: true }),
  body('picture_url').optional({ nullable: true })
], (req, res, next) => {
  const validation_result = validationResult(req);
  const { user_name, user_pass, user_email, introduce, gender, birthday, address, identification, user_phonenumber, picture_url } = req.body;

  if (validation_result.isEmpty()) {
    bcrypt.hash(user_pass, 12).then((hash_pass) => {
      console.log("User data:", { user_name, user_email, hash_pass, introduce, gender, birthday, address, identification, user_phonenumber, picture_url }); // Logging user data

      // Remove 'role' from the column list and value list
      dbConnection.query("INSERT INTO `users`(`name`, `email`, `password`, `introduce`, `gender`, `birthday`, `address`, `identification`, `user_phonenumber`, `picture_url`) VALUES(?,?,?,?,?,?,?,?,?,?)", [user_name, user_email, hash_pass, introduce, gender, birthday, address, identification, user_phonenumber, picture_url], (err, result) => {
        if (err) {
          console.error("Insert error:", err); // Logging error if insert query fails
          if (err) throw err;
        } else {
          console.log("Insert result:", result); // Logging the result of insert query
          req.session.isLoggedIn = true; // Log the user in after registration
          req.session.userID = result.insertId; // Store the user ID in the session
          res.redirect('/home-user'); // Redirect to the home-user page
        }
      });
    }).catch(err => {
      console.error("Hashing error:", err); // Logging error if password hashing fails
      if (err) throw err;
    });
  } else {
    console.log("Validation errors:", validation_result.array()); // Logging validation errors
    res.render('register-user', {
      errors: validation_result.array(),
      ...req.body // ส่งข้อมูลฟอร์มกลับเพื่อให้ผู้ใช้ไม่ต้องกรอกใหม่
    });
  }
});

// EMPLOYER REGISTRATION PAGE
app.get('/register-employer', ifLoggedin, (req, res) => {
  res.render('register-employer', { errors: [] }); // Render the employer registration template with an empty errors array
});

app.post('/register-employer', ifLoggedin, [
  body('user_email', 'Invalid email address!').isEmail().custom(value => {
    return dbConnection.query('SELECT `email` FROM `employers` WHERE `email`=?', [value])
      .then(([rows]) => {
        if (rows.length > 0) {
          return Promise.reject('This E-mail is already in use!');
        }
        return true;
      });
  }),
  body('user_pass', 'The password must be at least 6 characters long').trim().isLength({ min: 6 }),
  body('shop_name', 'Shop name is required').notEmpty(),
  body('shop_address', 'Shop address is required').notEmpty(),
  body('shop_phonenumber', 'Shop phone number is required').notEmpty(),
  body('shop_type', 'Shop type is required').notEmpty()
], (req, res, next) => {
  const validation_result = validationResult(req);
  const { user_name, user_pass, user_email, shop_name, shop_address, shop_phonenumber, shop_type } = req.body;

  if (validation_result.isEmpty()) {
    bcrypt.hash(user_pass, 12).then(hash_pass => {
      console.log("Employer data:", { user_name, user_email, hash_pass, shop_name, shop_address, shop_phonenumber, shop_type }); // Logging employer data

      dbConnection.query("INSERT INTO `employers`(`name`, `email`, `password`, `shop_name`, `shop_address`, `shop_phonenumber`, `shop_type`) VALUES(?,?,?,?,?,?,?)", [user_name, user_email, hash_pass, shop_name, shop_address, shop_phonenumber, shop_type], (err, result) => {
        if (err) {
          console.error("Insert error:", err); // Logging error if insert query fails
          if (err) throw err;
        } else {
          console.log("Insert result:", result); // Logging the result of insert query
          req.session.isLoggedIn = true; // Log the user in after registration
          req.session.userID = result.insertId; // Store the user ID in the session
          res.redirect('/home-employer'); // Redirect to the home-employer page
        }
      });
    }).catch(err => {
      console.error("Hashing error:", err); // Logging error if password hashing fails
      if (err) throw err;
    });
  } else {
    console.log("Validation errors:", validation_result.array()); // Logging validation errors
    res.render('register-employer', {
      errors: validation_result.array(),
      ...req.body // ส่งข้อมูลฟอร์มกลับเพื่อให้ผู้ใช้ไม่ต้องกรอกใหม่
    });
  }
});

// Login page route
app.get('/login', (req, res) => {
  res.render('login', { login_errors: [] });
});

app.post('/login_user', [
  // Validate and check if the email exists in the database
  body('user_email').isEmail().withMessage('Invalid Email Address!').custom(async (value) => {
      const [rows] = await dbConnection.query('SELECT email FROM users WHERE email=?', [value]);
      if (rows.length === 1) {
          return true;
      }
      return Promise.reject('Invalid Email Address!');
  }),
  // Validate that the password field is not empty
body('user_pass', 'Password is empty!').trim().not().isEmpty(),
], async (req, res) => {
  const validation_result = validationResult(req);
  const { user_pass, user_email } = req.body;
  console.log("User data:", { user_pass, user_email }); // Logging user data

  // If there are validation errors, render the login page with errors
  if (!validation_result.isEmpty()) {
    const allErrors = validation_result.errors.map(error => error.msg);
    console.error("Validation errors:", allErrors); // Logging validation errors
    return res.render('login', {
      login_errors: allErrors
    });
  }

  try {
    // Query the database to get the user data by email
    const [rows] = await dbConnection.query("SELECT * FROM `users` WHERE `email`=?", [user_email]);
    if (rows.length > 0) {
      // Compare the provided password with the hashed password in the database
      const isPasswordMatch = bcrypt.compareSync(user_pass, rows[0].password);
      if (isPasswordMatch === true) {
        console.log("Login result:", rows[0]);
        req.session.isLoggedIn = true;
        req.session.userID = rows[0].id;
        return res.redirect('/home-user'); // Redirect to the home-user page
      } else {
        return res.render('login', {
          login_errors: ['Invalid Password!']
        });
      }
    } else {
      return res.render('login', {
        login_errors: ['Invalid Email Address!']
      });
    }
  } catch (err) {
    console.error("Database query error:", err); // Logging error if any database query fails
    return res.status(500).send('Internal Server Error');
  }
});

// Home route for logged-in users
app.get('/home-user', (req, res) => {
  if (req.session.isLoggedIn) {
      res.render('home-user', { userID: req.session.userID });
  } else {
      res.redirect('/login');
  }
});

// LOGOUT
app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Server has started with port 3000');
  console.log('http://localhost:3000');
});
