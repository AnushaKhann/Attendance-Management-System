from flask import Flask, render_template, request, redirect, url_for, flash
import os
import base64

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # needed for flash messages

# Hardcoded credentials
USERNAME = 'admin'
PASSWORD = 'sharda123'

@app.route('/')
def home():
    return render_template('landing.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        entered_username = request.form['username']
        entered_password = request.form['password']
        
        if entered_username == USERNAME and entered_password == PASSWORD:
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
            return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/attendance')
def attendance():
    return render_template('attendance.html')

@app.route('/manual')
def manual_attendance():
    return render_template('manual_attendance.html')

@app.route('/facialrecognition')
def facial_recognition():
    return render_template('facialattendance.html')

@app.route('/registerface')
def register_face():
    return render_template('faceregistration.html')

@app.route('/records')
def attendance_records():
    return render_template('attendance_records.html')



# Add at the top
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# After your existing routes
@app.route('/captureface', methods=['POST'])
def capture_face():
    username = request.form.get('username')
    return render_template('capture.html', username=username)

@app.route('/uploadface', methods=['POST'])
def upload_face():
    username = request.form.get('username')
    image_data = request.form.get('image_data')

    if not (username and image_data):
        flash('Missing data!', 'error')
        return redirect(url_for('register_face'))

    # Decode image
    header, encoded = image_data.split(',', 1)
    binary_data = base64.b64decode(encoded)

    # Save
    filename = os.path.join(UPLOAD_FOLDER, f"{username}.png")
    with open(filename, 'wb') as f:
        f.write(binary_data)

    flash(f"Face registered for {username}", 'success')
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    app.run(debug=True)
