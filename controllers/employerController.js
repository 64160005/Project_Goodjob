const EmployerModel = require("../models/employerModel");
const { validationResult } = require("express-validator");

exports.showRegistrationForm = (req, res) => {
  res.render("register-employer", { errors: [] });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("register-employer", {
      errors: errors.array(),
      ...req.body,
    });
  }

  try {
    const employerId = await EmployerModel.create(req.body);
    req.session.isLoggedIn = true;
    req.session.employerID = employerId;
    res.redirect("/employer/home");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.showHome = (req, res) => {
  if (req.session.isLoggedIn) {
    res.render("home-employer", { employerID: req.session.employerID });
  } else {
    res.redirect("/login");
  }
};
