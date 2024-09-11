const UserModel = require("../models/usermodel");
const { validationResult } = require("express-validator");

exports.showRegistrationForm = (req, res) => {
  res.render("register-user", { errors: [] });
};

exports.showHome = (req, res) => {
  if (req.session.isLoggedIn && req.session.userType === "user") {
    res.render("home-user", { userID: req.session.userID });
  } else {
    res.redirect("/login");
  }
};
