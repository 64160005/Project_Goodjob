const UserModel = require("../models/usermodel");
const EmployerModel = require("../models/employerModel");
const { validationResult } = require("express-validator");

exports.showEmployerRegistrationForm = (req, res) => {
  res.render("register-employer", { errors: [] });
};

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors found:", errors.array());
    return res.render("register-user", { errors: errors.array(), ...req.body });
  }

  try {
    console.log("Attempting to register user with data:", req.body);
    const userId = await UserModel.registerUser(req.body);
    console.log("User registered successfully with ID:", userId);

    console.log("Setting up user session");
    req.session.isLoggedIn = true;
    req.session.userID = userId;
    req.session.userType = "user";

    console.log("Redirecting to user home page");
    res.redirect("/user/home");
  } catch (error) {
    console.error("Registration error:", error);
    console.log("Rendering registration page with error message");
    res.status(500).render("register-user", {
      errors: [{ msg: "Registration failed. Please try again." }],
      ...req.body,
    });
  }
};

exports.registerEmployer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("register-employer", {
      errors: errors.array(),
      ...req.body,
    });
  }

  try {
    const employerId = await EmployerModel.registerEmployer(req.body);
    req.session.isLoggedIn = true;
    req.session.employerID = employerId;
    res.redirect("/employer/home");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
