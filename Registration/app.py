import cv2
import os
import numpy as np
import mysql.connector
from flask import Flask, render_template, request, redirect, url_for
import threading
from datetime import datetime

app = Flask(__name__)

# 🔹 MySQL Configuration
db = mysql.connector.connect(
    host="localhost",
    user="root",  
    password="Anusha@_2003",
    database="face_recognition"
)
cursor = db.cursor()

# 🔹 Load OpenCV Face Detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
recognizer = cv2.face.LBPHFaceRecognizer_create()

# 🔹 Correct Path for Storing Faces
save_path = os.path.join(os.getcwd(), "static", "faces")
if not os.path.exists(save_path):
    os.makedirs(save_path)

# 📸 Capture & Save Face Function
def capture_face(user_id, name):
    video_capture = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not video_capture.isOpened():
        return "Error: Couldn't access webcam"

    count = 0
    while count < 5:
        ret, frame = video_capture.read()
        if not ret:
            return "Error: Couldn't read webcam frame"

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            count += 1
            filename = os.path.join(save_path, f"{name}_{user_id}_{count}.jpg")

            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, f"{name} - ID: {user_id}", (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)

            cv2.imwrite(filename, frame)

        cv2.imshow("Face Capture", frame)
        cv2.waitKey(500)

        if count >= 5:
            break

    video_capture.release()
    cv2.destroyAllWindows()
    return None



# 🔹 Home Page
@app.route('/')
def home():
    return render_template('index.html')

# 🔹 Registration Page
@app.route('/register_page')
def register_page():
    return render_template('register.html')


# 🔹 Handle Registration Form Submission
@app.route('/register', methods=['POST'])
def register():
    name = request.form.get('name')  # ✅ Fix KeyError

    if not name:
        return "Error: Name field is required", 400  # Handle missing form field

    cursor.execute("INSERT INTO users (name, image_path) VALUES (%s, '')", (name,))
    db.commit()
    user_id = cursor.lastrowid

    error_message = capture_face(user_id, name)
    if error_message:
        return error_message

    image_path = os.path.join(save_path, f"{name}_{user_id}_1.jpg")
    cursor.execute("UPDATE users SET image_path=%s WHERE id=%s", (image_path, user_id))
    db.commit()

    return redirect(url_for('register_page'))

# 🔹 Train the Face Recognition Model
def train_model():
    faces = []
    labels = []

    for filename in os.listdir(save_path):
        if filename.endswith(".jpg"):
            path = os.path.join(save_path, filename)
            gray_image = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
            user_id = int(filename.split("_")[1])  # Extract ID from filename
            faces.append(gray_image)
            labels.append(user_id)

    if faces:
        recognizer.train(faces, np.array(labels))
        recognizer.save(os.path.join(os.getcwd(), "trained_model.yml"))
        print("✅ Face recognition model trained successfully!")
    else:
        print("⚠️ No faces found for training.")


# 🔹 Function to Run Face Recognition
def recognize_and_mark_attendance():
    global present_students
    session_id = 1  

    present_students = set()

    video_capture = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    # 🔹 Load the trained model
    try:
        recognizer.read(os.path.join(os.getcwd(), "trained_model.yml"))
    except:
        print("⚠️ Error: Trained model file not found! Train the model first.")
        return

    while True:
        ret, frame = video_capture.read()
        if not ret:
            print("❌ Error: Couldn't read webcam frame")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            try:
                face_id, confidence = recognizer.predict(gray[y:y + h, x:x + w])
                print(f"🟢 Recognized ID: {face_id}, Confidence: {confidence}")
            except:
                continue

            if confidence < 80:
                cursor.execute("SELECT name FROM users WHERE id=%s", (face_id,))
                result = cursor.fetchone()

                if result:
                    name = result[0]

                    cursor.execute("""
                        SELECT COUNT(*) FROM attendance 
                        WHERE user_id = %s AND DATE(timestamp) = CURDATE()
                    """, (face_id,))
                    attendance_exists = cursor.fetchone()[0]
            
                    if attendance_exists == 0 and name not in present_students:
                        try:
                            cursor.execute(
                              "INSERT INTO attendance (user_id, name, session_id, timestamp) VALUES (%s, %s, %s, NOW())",
                                      (face_id, name, session_id)  # Ensure session_id is defined somewhere
                                    )

                            db.commit()
                            present_students.add(name)
                            print(f"🎉 Attendance successfully marked for {name}!")
                        except mysql.connector.Error as err:
                            print(f"❌ Database Error: {err}")

                cv2.putText(frame, f"Recognized: {name}", (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)

            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        cv2.imshow("Attendance System", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    video_capture.release()
    cv2.destroyAllWindows()
    print("📌 Attendance process completed.")



# 🔹 Attendance Page
@app.route('/attendance_page')
def attendance_page():
    return render_template('attendance_start.html')


# 🔹 Start Attendance
@app.route('/start_attendance', methods=['POST'])
def start_attendance():
    threading.Thread(target=recognize_and_mark_attendance, daemon=True).start()
    return redirect(url_for('attendance_page'))  # Redirect user to results page



@app.route('/attendance_results',methods=['POST'])
def attendance_results():
    # 🔹 Get today's date
    today = datetime.now().date()

    # 🔹 Fetch all registered students
    cursor.execute("SELECT id, name FROM users")
    students = cursor.fetchall()  # List of (id, name)

    # 🔹 Fetch students who are marked present today
    cursor.execute("""
        SELECT user_id FROM attendance 
        WHERE DATE(timestamp) = %s
    """, (today,))
    present_students = {row[0] for row in cursor.fetchall()}  # Set of student IDs

    # 🔹 Prepare the data for rendering
    attendance_data = []
    for student_id, name in students:
        status = "Present ✅" if student_id in present_students else "Absent ❌"
        attendance_data.append((name, status))

    return render_template('attendance_results.html', attendance_data=attendance_data)

# 🔹 Run Flask App
if __name__ == '__main__':
    train_model()
    app.run(debug=True)
