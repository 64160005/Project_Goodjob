const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const registerController = require("../controllers/registerController");
const userController = require("../controllers/userController");
const db = require("../config/database");

router.get("/login", authController.showLoginForm);

router.post(
  "/loginPost",
  [
    body("user_email").isEmail().withMessage("Invalid email address"),
    body("user_pass").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

router.get("/logout", authController.logout);

router.get("/register-user", userController.showRegistrationForm);

router.post(
  "/register-user",
  [
    body("user_email", "Invalid email address!")
      .isEmail()
      .custom((value) => {
        return db
          .query("SELECT `email` FROM `users` WHERE `email`=?", [value])
          .then(([rows]) => {
            if (rows.length > 0) {
              return Promise.reject("This E-mail already in use!");
            }
            return true;
          });
      }),
    body("user_pass", "The password must be of minimum length 6 characters")
      .trim()
      .isLength({ min: 6 }),
    body("user_name", "Username is Empty!").trim().not().isEmpty(),
    body("introduce").optional({ nullable: true }),
    body("gender").optional({ nullable: true }),
    body("birthday").optional({ nullable: true }),
    body("address").optional({ nullable: true }),
    body("identification").optional({ nullable: true }),
    body("user_phonenumber").optional({ nullable: true }),
    body("picture_url").optional({ nullable: true }),
  ],
  registerController.registerUser
);

router.get(
  "/register-employer",
  registerController.showEmployerRegistrationForm
);

router.post(
  "/register-employer",
  [
    body("user_email", "Invalid email address!")
      .isEmail()
      .custom((value) => {
        return db
          .query("SELECT `email` FROM `employers` WHERE `email`=?", [value])
          .then(([rows]) => {
            if (rows.length > 0) {
              return Promise.reject("This E-mail is already in use!");
            }
            return true;
          });
      }),
    body("user_pass", "The password must be at least 6 characters long")
      .trim()
      .isLength({ min: 6 }),
    body("shop_name", "Shop name is required").notEmpty(),
    body("shop_address", "Shop address is required").notEmpty(),
    body("shop_phonenumber", "Shop phone number is required").notEmpty(),
    body("shop_type", "Shop type is required").notEmpty(),
  ],
  registerController.registerEmployer
);

module.exports = router;
