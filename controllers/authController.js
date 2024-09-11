const UserModel = require("../models/usermodel");
const EmployerModel = require("../models/employerModel");
const { validationResult } = require("express-validator");

exports.showLoginForm = (req, res) => {
  res.render("login", { errors: [] });
};

exports.login = async (req, res) => {
  const { user_email, user_pass } = req.body;
  const errors = validationResult(req);

  console.log(`Login attempt for email: ${user_email}`);

  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.render("login", { errors: errors.array() });
  }

  try {
    const user = await UserModel.findByEmail(user_email);
    if (user && (await UserModel.verifyPassword(user_pass, user.password))) {
      console.log(`User login successful. User ID: ${user.id}`);
      req.session.isLoggedIn = true;
      req.session.userID = user.id;
      req.session.userType = "user";
      return res.redirect("/user/home");
    }

    const employer = await EmployerModel.findByEmail(user_email);
    if (
      employer &&
      (await EmployerModel.verifyPassword(user_pass, employer.PASSWORD)) // ใน db ใช้ column PASSWORD ตัวพิมพิ์ใหญ่
    ) {
      console.log(`Employer login successful. Employer ID: ${employer.id}`);
      req.session.isLoggedIn = true;
      req.session.employerID = employer.id;
      req.session.userType = "employer";
      return res.redirect("/employer/home");
    }

    console.log(`Login failed for email: ${user_email}`);
    res.render("login", { errors: [{ msg: "Invalid email or password" }] });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Session destruction error:", err);
    res.redirect("/");
  });
};
