const { validationResult } = require('express-validator');
const loginModel = require('../models/loginmodels.js');

module.exports = {
    login: function(req, res) {
        res.render('login');
    },

    loginPost: async function(req, res) {
        const validation_result = validationResult(req);
        const { user_pass, user_email } = req.body;
        console.log("User data:", { user_pass, user_email });

        if (!validation_result.isEmpty()) {
            const allErrors = validation_result.errors.map(error => error.msg);
            console.error("Validation errors:", allErrors);
            return res.render('login', {
                login_errors: allErrors
            });
        }

        try {
            console.log("User data:", { user_pass, user_email });

            loginModel.findByEmail(user_email, user_pass, (err, user) => {

                if (err) {
                    console.error("Database query error:", err);
                    return res.status(500).send('Internal Server Error');
                }
                if (user) {
                    console.log("Login result:", user);
                    req.session.isLoggedIn = true;
                    req.session.userID = user.id;
                    req.session.userName = user.name;
                    req.session.userEmail = user.email;
                    req.session.userIntroduce = user.introduce;
                    req.session.userGender = user.gender;
                    req.session.userBirthday = user.birthday;
                    req.session.userAddress = user.address;
                    req.session.userIdentification = user.identification;
                    req.session.userPhoneNumber = user.user_phonenumber;
                    req.session.userPictureUrl = user.picture_url;
                    req.session.userCreatedAt = user.created_at;
                    return res.redirect('/home-user');
                } else {
                    return res.render('login', {
                        login_errors: ['Invalid Email Address or Password!']
                    });
                }
            });
        } catch (err) {
            console.error("Database query error:", err);
            return res.status(500).send('Internal Server Error');
        }
    }
};