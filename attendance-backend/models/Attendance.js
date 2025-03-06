class Attendance {
    constructor(class_name, subject, date, student_name, system_id, roll_no, status) {
        this.class_name = class_name;
        this.subject = subject;
        this.date = date;
        this.student_name = student_name;
        this.system_id = system_id;
        this.roll_no = roll_no;
        this.status = status;
    }
}

module.exports = Attendance;
