const express = require('express');
const Login = require('../controller/logincontroller.js');
const router = express.Router();

router.get('/login', Login.login);
router.post('/loginPost', Login.loginPost);

module.exports = router;