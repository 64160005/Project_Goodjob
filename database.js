// const mysql = require('mysql2');
// const dbConnection = mysql.createPool({
//     host     : 'localhost', // MYSQL HOST NAME
//     user     : 'root', // MYSQL USERNAME
//     password : '', // MYSQL PASSWORD
//     database : 'nodejs_login' // MYSQL DB NAME
// }).promise();

// // Function to check database connection
// const checkDatabaseConnection = async () => {
//     try {
//         await dbConnection.query('SELECT 1');
//         console.log('Database connection successful');
//     } catch (err) {
//         console.error('Database connection failed:', err);
//     }
// };

// // Check the database connection when the module is loaded
// checkDatabaseConnection();

// module.exports = dbConnection;