import React, { useState } from 'react';
import './Form.css';

const managers = {
    Sales: ["Shivani", "Jiya", "Shashank", "Shubham", "Rajkumari", "Rahul", "Ayesh", "Rozi", "Vineet"],
    Growth: ["Ronak", "Priyesh", "Ankit"],
    "Operations & Credit": ["Anurandhan", "Manoj"],
    Marketing: ["Krishna", "Neha_Lakra"],
    IT: ["Prashant"],
    HR: ["Jolly Kumari"]
};

const departments = ["Sales", "Growth", "Operations & Credit", "Marketing", "IT", "HR"];

function Form() {
    const [date, setDate] = useState('');
    const [department, setDepartment] = useState('Sales');
    const [employeeName, setEmployeeName] = useState('');
    const [managerName, setManagerName] = useState(managers["Sales"][0]);
    const [employeeId, setEmployeeId] = useState('');
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('date', date);
        formData.append('department', department);
        formData.append('employeeName', employeeName);
        formData.append('managerName', managerName);
        formData.append('employeeId', employeeId);
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3000/submit-form', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Form submission failed');
            }

            alert('Form submitted successfully');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Form Submission</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="date">Date</label>
                <input
                    type="date"
                    id="date"
                    name="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <label htmlFor="department">Department</label>
                <select
                    id="department"
                    name="department"
                    value={department}
                    onChange={(e) => {
                        setDepartment(e.target.value);
                        setManagerName(managers[e.target.value][0]);
                    }}
                >
                    {departments.map((dept) => (
                        <option key={dept} value={dept}>
                            {dept}
                        </option>
                    ))}
                </select>

                <label htmlFor="employeeName">Employee Name</label>
                <input
                    type="text"
                    id="employeeName"
                    name="employeeName"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                />

                <label htmlFor="managerName">Manager's Name</label>
                <select
                    id="managerName"
                    name="managerName"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                >
                    {managers[department].map((manager) => (
                        <option key={manager} value={manager}>
                            {manager}
                        </option>
                    ))}
                </select>

                <label htmlFor="employeeId">Employee ID</label>
                <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                />

                <label htmlFor="file">Upload File</label>
                <input
                    type="file"
                    id="file"
                    name="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default Form;
