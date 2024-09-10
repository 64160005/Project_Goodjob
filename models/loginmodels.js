const Usermodel = require('../models/usermodel.js');
const bcrypt = require('bcrypt');

module.exports = {
    login: function (username, password, callback) {
        Usermodel.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },

    findByEmail: function (email, password, callback) {
        Usermodel.query('SELECT * FROM users WHERE email = ?', [email], function (err, result) {
            if (err) {
                return callback(err, null);
            }
            if (result && result.length > 0) {
                const user = result[0];
                const isPasswordMatch = bcrypt.compareSync(password, user.password);
                console.log("Password match:", isPasswordMatch);
                if (isPasswordMatch) {
                    return callback(null, user);
                }
            }
            return callback(null, null);
        });
    }
};