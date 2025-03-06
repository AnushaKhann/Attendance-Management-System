const mysql = require("mysql2");
require("dotenv").config();

// Create MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySQL Database.");
});

db.query("SELECT 1", (err, results) => {
    if (err) {
        console.error("Database test failed:", err);
    } else {
        console.log("Database connection test successful:", results);
    }
});


module.exports = db;
