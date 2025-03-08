const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "attendance_system"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Connected to MySQL Database.");
});

// **User Authentication Route**
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            res.json({ success: true, role: results[0].role });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    });
});

// **Fetch Submitted Attendance for a Specific Date**
app.get("/api/attendance/:class/:subject/:date", (req, res) => {
    const { class: className, subject, date } = req.params;
    const query = `
        SELECT student_name, system_id, roll_no, status 
        FROM attendance 
        WHERE class_name = ? AND subject = ? AND date = ?`;
    
    db.query(query, [className, subject, date], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(results);
    });
});

// **Save Attendance Data**
app.post("/api/attendance/add", (req, res) => {
    const { class_name, subject, date, students } = req.body;
    
    if (!class_name || !subject || !date || !students.length) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    let query = "INSERT INTO attendance (class_name, subject, date, student_name, system_id, roll_no, status) VALUES ?";
    let values = students.map(s => [class_name, subject, date, s.student_name, s.system_id, s.roll_no, s.status || ""]);

    db.query(query, [values], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "Attendance saved successfully" });
    });
});

// **Update Attendance Status for a Student**
app.put("/api/attendance/update", (req, res) => {
    const { class_name, subject, date, system_id, status } = req.body;

    const query = `
        UPDATE attendance 
        SET status = ? 
        WHERE class_name = ? AND subject = ? AND date = ? AND system_id = ?`;

    db.query(query, [status, class_name, subject, date, system_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: "Attendance updated successfully" });
    });
});

// **Start the Server**
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
