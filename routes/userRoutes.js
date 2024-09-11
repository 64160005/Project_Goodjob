const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");

router.get("/register", userController.showRegistrationForm);

router.get("/home", userController.showHome);

module.exports = router;
