document.addEventListener("DOMContentLoaded", function () {
    // Handle user type selection (Faculty or Student)
    document.getElementById("faculty-login-btn").addEventListener("click", function () {
        document.getElementById("login-options").style.display = "none";
        document.getElementById("faculty-login-form").style.display = "block";
    });

    document.getElementById("student-login-btn").addEventListener("click", function () {
        document.getElementById("login-options").style.display = "none";
        document.getElementById("student-login-form").style.display = "block";
    });

    // Handle Faculty Login
    document.getElementById("faculty-submit-btn").addEventListener("click", async function () {
        const username = document.getElementById("faculty-username").value;
        const password = document.getElementById("faculty-password").value;

        const response = await fetch("http://localhost:5001/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success && data.role === "faculty") {
            // Store faculty credentials in sessionStorage
            sessionStorage.setItem("facultyUsername", username);
            sessionStorage.setItem("facultyPassword", password); 

            window.location.href = "faculty-dashboard.html";
        } else {
            document.getElementById("faculty-error").style.display = "block";
        }
    });

    // Handle Student Login
    document.getElementById("student-submit-btn").addEventListener("click", async function () {
        const studentID = document.getElementById("student-id").value;
        const password = document.getElementById("student-password").value;

        const response = await fetch("http://localhost:5001/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: studentID, password })
        });

        const data = await response.json();

        if (data.success && data.role === "student") {
            window.location.href = "student-dashboard.html";
        } else {
            document.getElementById("student-error").style.display = "block";
        }
    });

    // Handle Logout (Clear Stored Credentials)
    const logoutButton = document.getElementById("logout-btn");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            sessionStorage.removeItem("facultyUsername");
            sessionStorage.removeItem("facultyPassword");
            window.location.href = "index.html";
        });
    }
});
