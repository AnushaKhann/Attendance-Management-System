document.addEventListener('DOMContentLoaded', function () {
    const attendanceDateInput = document.getElementById('attendance-date');
    const attendanceTable = document.getElementById('attendance-record');
    const tableBody = attendanceTable.querySelector('tbody');
    const noRecordsMessage = document.getElementById('no-records-message');
    const exportButton = document.getElementById('export-to-excel');

    // Mock data for demonstration
    const attendanceData = {
        "2024-01-01": [
            { subject: "Math", status: "Present" },
            { subject: "Science", status: "Absent" }
        ],
        "2024-01-02": [
            { subject: "History", status: "Late" },
            { subject: "Geography", status: "Present" }
        ]
    };

    // Set the default date to today
    const today = new Date().toISOString().split('T')[0];
    attendanceDateInput.value = today;

    // Load attendance for the default date
    loadAttendanceData(today);

    // Event listener for date change
    attendanceDateInput.addEventListener('change', function () {
        const selectedDate = attendanceDateInput.value;
        loadAttendanceData(selectedDate);
    });

    // Function to load attendance data for the selected date
    function loadAttendanceData(date) {
        const data = attendanceData[date] || [];
        tableBody.innerHTML = '';

        if (data.length > 0) {
            noRecordsMessage.style.display = 'none';
            attendanceTable.style.display = 'table';

            data.forEach((record, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="serial-number">${index + 1}</td>
                    <td>${record.subject}</td>
                    <td><span class="attendance-status ${getStatusClass(record.status)}">${record.status}</span></td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            noRecordsMessage.style.display = 'block';
            attendanceTable.style.display = 'none';
        }
    }

    // Function to determine the status class
    function getStatusClass(status) {
        if (status === "Present") return "attendance-present";
        if (status === "Absent") return "attendance-absent";
        if (status === "Late") return "attendance-late";
        return "";
    }

    // Export to Excel functionality
    exportButton.addEventListener('click', function () {
        const tableData = [];
        const rows = tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            tableData.push({
                SerialNo: cells[0].innerText,
                Subject: cells[1].innerText,
                Status: cells[2].innerText
            });
        });

        if (tableData.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(tableData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
            XLSX.writeFile(workbook, `Attendance_${attendanceDateInput.value}.xlsx`);
        } else {
            alert('No data to export.');
        }
    });
});
