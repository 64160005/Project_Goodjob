const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const employerController = require("../controllers/employerController");

router.get("/register", employerController.showRegistrationForm);

router.post(
  "/register",
  [
    body("user_email").isEmail().withMessage("Invalid email address"),
    body("user_pass")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("shop_name").notEmpty().withMessage("Shop name is required"),
    body("shop_address").notEmpty().withMessage("Shop address is required"),
    body("shop_phonenumber")
      .notEmpty()
      .withMessage("Shop phone number is required"),
    body("shop_type").notEmpty().withMessage("Shop type is required"),
  ],
  employerController.register
);

router.get("/home", employerController.showHome);

module.exports = router;
