const express = require("express");
const db = require("../config/database");
const router = express.Router();

// 📌 POST: Add Attendance Record
router.post("/add", (req, res) => {
    console.log("Received Request Body:", req.body); // Debugging Log

    const { class_name, subject, date, students } = req.body;

    // 📌 Validation: Ensure all required fields are provided
    if (!class_name || !subject || !date || !students || students.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // 📌 Insert each student's attendance into MySQL
    students.forEach(student => {
        const sql = "INSERT INTO attendance (class_name, subject, date, student_name, system_id, roll_no, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(sql, [class_name, subject, date, student.student_name, student.system_id, student.roll_no, student.status], (err, result) => {
            if (err) {
                console.error("Database Insert Error:", err);
                return res.status(500).json({ message: "Database error", error: err.message });
            }
        });
    });

    res.status(201).json({ message: "Attendance added successfully." });
});

// 📌 GET: Retrieve Attendance for a Specific Class, Subject, and Date
router.get("/:class_name/:subject/:date", (req, res) => {
    const { class_name, subject, date } = req.params;

    const sql = "SELECT * FROM attendance WHERE class_name = ? AND subject = ? AND date = ?";
    db.query(sql, [class_name, subject, date], (err, results) => {
        if (err) {
            console.error("Database Fetch Error:", err);
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        // 📌 Return attendance records as JSON
        res.json(results);
    });
});

module.exports = router;
