document.addEventListener("DOMContentLoaded", function () {
    const chooseClassSelect = document.getElementById("choose-class");
    const newClassInput = document.getElementById("new-class");
    const addClassButton = document.getElementById("add-class-btn");
    const chooseSubjectSelect = document.getElementById("choose-subject");
    const passwordInput = document.getElementById("password");
    const openAttendanceButton = document.getElementById("open-attendance-btn");
    const attendanceTypeSelect = document.getElementById("attendance-type");
    const messageDiv = document.getElementById("message");

    let classes = JSON.parse(localStorage.getItem("classes")) || [];

    // Load faculty password from sessionStorage
    const facultyPassword = sessionStorage.getItem("facultyPassword");

    // Load classes into the dropdown
    function loadClasses() {
        chooseClassSelect.innerHTML = '<option value="">Select a class</option>';
        classes.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls;
            option.textContent = cls;
            chooseClassSelect.appendChild(option);
        });

        // Load selected class and subject from memory for the current combination
        loadSavedCombination();
    }

    // Save data for a specific class and subject combination
    function saveClassAndSubjectMemory(className, subjectName, data) {
        const key = `${className}-${subjectName}`; // Unique key for each class-subject combination
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Load data for a specific class and subject combination
    function loadClassAndSubjectMemory(className, subjectName) {
        const key = `${className}-${subjectName}`;
        return JSON.parse(localStorage.getItem(key)) || {};
    }

    // Save selected class and subject separately for each combination
    function saveSelectedCombination(className, subjectName) {
        const savedData = { className, subjectName };
        saveClassAndSubjectMemory(className, subjectName, savedData);
    }

    // Load the saved class and subject from memory if they exist for this combination
    function loadSavedCombination() {
        const selectedClass = chooseClassSelect.value;
        const selectedSubject = chooseSubjectSelect.value;

        if (selectedClass && selectedSubject) {
            const savedData = loadClassAndSubjectMemory(selectedClass, selectedSubject);
            if (savedData.className) {
                chooseClassSelect.value = savedData.className;
            }
            if (savedData.subjectName) {
                chooseSubjectSelect.value = savedData.subjectName;
            }
        }
    }

    // Add class
    addClassButton.addEventListener("click", function () {
        const newClass = newClassInput.value.trim();
        if (newClass) {
            classes.push(newClass);
            localStorage.setItem("classes", JSON.stringify(classes));
            loadClasses();
            newClassInput.value = ""; // Clear input field
            messageDiv.textContent = "Class added successfully.";
        } else {
            messageDiv.textContent = "Please enter a class name.";
        }
    });

    // Enable "Open Attendance Sheet" button only for "Manual Attendance"
    attendanceTypeSelect.addEventListener("change", function () {
        if (attendanceTypeSelect.value === "manual") {
            openAttendanceButton.classList.remove("disabled");
            openAttendanceButton.removeAttribute("disabled");
        } else {
            openAttendanceButton.classList.add("disabled");
            openAttendanceButton.setAttribute("disabled", "true");
        }
    });

    // Open attendance sheet only if "Manual Attendance" is selected
    openAttendanceButton.addEventListener("click", function () {
        const selectedClass = chooseClassSelect.value;
        const selectedSubject = chooseSubjectSelect.value;
        const enteredPassword = passwordInput.value.trim();

        if (selectedClass && selectedSubject && enteredPassword) {
            if (enteredPassword === facultyPassword) {
                if (attendanceTypeSelect.value === "manual") {
                    // Save the current class-subject combination to memory
                    saveSelectedCombination(selectedClass, selectedSubject);

                    // Redirect to attendance.html with selected class and subject as query parameters
                    window.location.href = `attendance.html?class=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}`;
                } else {
                    messageDiv.textContent = "Please select 'Manual Attendance' to proceed.";
                }
            } else {
                messageDiv.textContent = "Incorrect password.";
            }
        } else {
            messageDiv.textContent = "Please fill all fields.";
        }
    });

    // Load classes on page load
    loadClasses();

    // Load the current selection from memory on page load
    chooseClassSelect.addEventListener("change", loadSavedCombination);
    chooseSubjectSelect.addEventListener("change", loadSavedCombination);
});
