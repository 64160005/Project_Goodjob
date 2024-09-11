const express = require("express");
const path = require("path");
const flash = require("express-flash");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();

// Middleware setup
app.use(
  session({
    secret: "keyboard",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);
app.use(flash());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const employerRoutes = require("./routes/employerRoutes");

// Use routes
app.use("/", authRoutes);
app.use("/user", userRoutes);
app.use("/employer", employerRoutes);

// Root route
app.get("/", (req, res) => {
  if (req.session.isLoggedIn) {
    if (req.session.userType === "user") {
      res.redirect("/user/home");
    } else if (req.session.userType === "employer") {
      res.redirect("/employer/home");
    }
  } else {
    res.render("index");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Session destruction error:", err);
    res.redirect("/");
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

module.exports = app;
