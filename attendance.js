document.addEventListener("DOMContentLoaded", function () {
    const attendanceTableBody = document.querySelector("#attendance-table tbody");
    const addStudentButton = document.getElementById("add-student-btn");
    const studentNameInput = document.getElementById("student-name");
    const studentIdInput = document.getElementById("student-id");
    const studentRollInput = document.getElementById("student-roll");
    const totalStudentsElement = document.getElementById("total-students");
    const submitAttendanceButton = document.getElementById("submit-attendance-btn");
    const updateAttendanceButton = document.getElementById("update-attendance-btn");
    const lockAttendanceButton = document.getElementById("lock-attendance-btn");
    const exportButton = document.getElementById("export-attendance-btn");
    const dateInput = document.getElementById("attendance-date");
    const loadAttendanceButton = document.getElementById("load-attendance-btn");

    let students = [];
    let locked = false;

    // Retrieve class and subject from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedClass = urlParams.get("class");
    const selectedSubject = urlParams.get("subject");

    // Display class and subject names
    document.getElementById("class-name").textContent = selectedClass;
    document.getElementById("subject-name").textContent = selectedSubject;

    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;

    // Load attendance data from MySQL for the selected date
    async function loadAttendanceData(selectedDate) {
        try {
            const response = await fetch(`http://localhost:5001/api/attendance/${selectedClass}/${selectedSubject}/${selectedDate}`);
            const data = await response.json();

            // ❌ Remove duplicate entries
            students = [];

            // Clear table before adding new data
            attendanceTableBody.innerHTML = "";
            students = data.map(entry => ({
                name: entry.student_name,
                systemId: entry.system_id,
                rollNo: entry.roll_no,
                attendance: entry.status
            }));

            students.forEach(student => addStudentToTable(student));
            updateTotalStudents();
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    }

    // Save attendance data to MySQL
    async function saveAttendanceData() {
        try {
            const selectedDate = dateInput.value;
            const response = await fetch("http://localhost:5001/api/attendance/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    class_name: selectedClass,
                    subject: selectedSubject,
                    date: selectedDate,
                    students: students.map(student => ({
                        student_name: student.name,
                        system_id: student.systemId,
                        roll_no: student.rollNo,
                        status: student.attendance || ""
                    }))
                })
            });

            if (response.ok) {
                console.log("Attendance saved successfully.");
            } else {
                console.error("Failed to save attendance.");
            }
        } catch (error) {
            console.error("Error saving attendance:", error);
        }
    }

    // Add a student to the table
    function addStudentToTable(student) {
        const row = document.createElement("tr");
        row.setAttribute("data-student-id", student.systemId);

        row.innerHTML = `
            <td>${attendanceTableBody.children.length + 1}</td>
            <td>${student.name}</td>
            <td>${student.systemId}</td>
            <td>${student.rollNo}</td>
            <td class="attendance-buttons">
                <button class="attendance-btn" data-status="P" style="background-color: ${student.attendance === 'P' ? 'green' : ''}">P</button>
                <button class="attendance-btn" data-status="A" style="background-color: ${student.attendance === 'A' ? 'red' : ''}">A</button>
                <button class="attendance-btn" data-status="L" style="background-color: ${student.attendance === 'L' ? 'grey' : ''}">L</button>
            </td>
            <td><button class="remove-student-btn">X</button></td>
        `;

        // Add event listeners to attendance buttons
        const attendanceBtns = row.querySelectorAll(".attendance-btn");
        attendanceBtns.forEach(btn => {
            btn.addEventListener("click", function () {
                if (locked) return;

                // Reset background colors
                attendanceBtns.forEach(b => b.style.backgroundColor = "");
                this.style.backgroundColor = this.dataset.status === "P" ? "green" : this.dataset.status === "A" ? "red" : "grey";

                student.attendance = this.dataset.status;
                saveAttendanceData();
            });
        });

        // Add event listener to remove student
        row.querySelector(".remove-student-btn").addEventListener("click", function () {
            if (locked) return;

            const studentId = row.getAttribute("data-student-id");
            students = students.filter(s => s.systemId !== studentId);
            row.remove();
            updateTotalStudents();
            saveAttendanceData();
        });

        attendanceTableBody.appendChild(row);
    }

    // Add student event
    addStudentButton.addEventListener("click", function () {
        const name = studentNameInput.value.trim();
        const systemId = studentIdInput.value.trim();
        const rollNo = studentRollInput.value.trim();
    
        if (!name || !systemId || !rollNo) {
            alert("Please fill in all fields.");
            return;
        }
    
        // Check if student already exists (by System ID)
        const isDuplicate = students.some(student => student.systemId === systemId);
        if (isDuplicate) {
            alert("Student already exists in the list.");
            return;
        }
    
        // Add new student if not duplicate
        const student = { name, systemId, rollNo, attendance: "" };
        students.push(student);
        addStudentToTable(student);
        updateTotalStudents();
        saveAttendanceData();
    
        // Clear inputs
        studentNameInput.value = "";
        studentIdInput.value = "";
        studentRollInput.value = "";
    });
    

    // Update total students count
    function updateTotalStudents() {
        totalStudentsElement.textContent = students.length;
    }

    // Submit attendance event
    submitAttendanceButton.addEventListener("click", function () {
        alert("Attendance Submitted!");
        updateAttendanceButton.style.display = "inline-block";
        lockAttendanceButton.style.display = "inline-block";
        saveAttendanceData();
    });

    // Update attendance event
    updateAttendanceButton.addEventListener("click", function () {
        if (locked) return;
        alert("You can now update the attendance.");
        submitAttendanceButton.style.display = "inline-block";
        updateAttendanceButton.style.display = "none";
        lockAttendanceButton.style.display = "inline-block";
    });

    // Lock attendance event
    lockAttendanceButton.addEventListener("click", function () {
        locked = true;
        submitAttendanceButton.style.display = "none";
        updateAttendanceButton.style.display = "none";
        lockAttendanceButton.style.display = "none";
        alert("Attendance locked! No further changes allowed.");
    });

    // Export attendance to Excel
    exportButton.addEventListener("click", async function () {
        try {
            const selectedDate = dateInput.value;
            const response = await fetch(`http://localhost:5001/api/attendance/${selectedClass}/${selectedSubject}/${selectedDate}`);
            const data = await response.json();

            const exportData = data.map((entry, index) => ({
                "Serial No.": index + 1,
                "Student Name": entry.student_name,
                "System ID": entry.system_id,
                "Roll No.": entry.roll_no,
                "Attendance": entry.status || ""
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

            XLSX.writeFile(workbook, `Attendance_${selectedClass}_${selectedSubject}_${selectedDate}.xlsx`);
        } catch (error) {
            console.error("Error exporting attendance:", error);
        }
    });

    // Load attendance for selected date
    loadAttendanceButton.addEventListener("click", function () {
        loadAttendanceData(dateInput.value);
    });

    // Load today's attendance on page load
    loadAttendanceData(today);
});

