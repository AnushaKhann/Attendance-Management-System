// Handle user type selection
// Handle Faculty Login Button Click
document.getElementById('faculty-login-btn').addEventListener('click', function() {
    document.getElementById('login-options').style.display = 'none';
    document.getElementById('faculty-login-form').style.display = 'block';
});

// Handle Student Login Button Click
document.getElementById('student-login-btn').addEventListener('click', function() {
    document.getElementById('login-options').style.display = 'none';
    document.getElementById('student-login-form').style.display = 'block';
});

// Handle Faculty Login Submission
document.getElementById('faculty-submit-btn').addEventListener('click', function() {
    const username = document.getElementById('faculty-username').value;
    const password = document.getElementById('faculty-password').value;

    if (username === 'faculty' && password === 'correct-password') {
        window.location.href = 'faculty-dashboard.html';
    } else {
        alert('Invalid Faculty credentials. Please try again.');
    }
});

// Handle Student Login Submission
document.getElementById('student-submit-btn').addEventListener('click', function() {
    const studentID = document.getElementById('student-id').value;
    const password = document.getElementById('student-password').value;

    if (studentID === 'student' && password === 'password') {
        window.location.href = 'student-dashboard.html';
    } else {
        alert('Invalid Student credentials. Please try again.');
    }
});
