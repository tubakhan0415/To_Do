import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function Dashboard() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const managers = [
        'Shivani', 'Jiya', 'Shashank', 'Shubham', 'Rajkumari', 'Rahul',
        'Ayesh', 'Rozi', 'Vineet', 'Ronak', 'Priyesh', 'Ankit',
        'Anurandhan', 'Manoj', 'Krishna', 'Neha_Lakra', 'Prashant', 'Jolly Kumari'
    ];

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in again.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/dashboard', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setError('Unauthorized access. Please log in again.');
                    } else {
                        throw new Error('Error fetching data');
                    }
                } else {
                    const result = await response.json();
                    setData(result.data);
                }

                // Check if the user is an admin
                const userInfo = JSON.parse(atob(token.split('.')[1]));
                if (userInfo.role === 'admin') {
                    setIsAdmin(true);
                    fetchAdminData(token);
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, []);

    const fetchAdminData = async (token) => {
        try {
            const response = await fetch('http://localhost:3000/admin-dashboard', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Error fetching admin data');
            }

            const result = await response.json();
            setData(result.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFilter = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/filter-forms?managerName=${filter}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error filtering data');
            }

            const result = await response.json();
            setData(result.data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleUpdate = async (formId, score, feedback) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3000/update-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ formId, score, feedback }),
            });

            if (!response.ok) {
                throw new Error('Update failed');
            }

            alert('Update successful');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="dashboard-container">
            <h2>{isAdmin ? 'Admin Dashboard' : 'Dashboard'}</h2>
            {isAdmin && (
                <div className="filter-container">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="">All Managers</option>
                        {managers.map((manager) => (
                            <option key={manager} value={manager}>
                                {manager}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleFilter}>Filter</button>
                </div>
            )}
            {error && <p>{error}</p>}
            {data.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Department</th>
                            <th>Employee Name</th>
                            <th>Manager's Name</th>
                            <th>Employee ID</th>
                            <th>File</th>
                            <th>Score</th>
                            <th>Feedback</th>
                            {!isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.date}</td>
                                <td>{item.department}</td>
                                <td>{item.employeeName}</td>
                                <td>{item.managerName}</td>
                                <td>{item.employeeId}</td>
                                <td>
                                    <a href={`http://localhost:3000/${item.file}`} download>
                                        Download File
                                    </a>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        defaultValue={item.score || ''}
                                        onChange={(e) => (item.score = e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={item.feedback || ''}
                                        onChange={(e) => (item.feedback = e.target.value)}
                                    />
                                </td>
                                {!isAdmin && (
                                    <td>
                                        <button
                                            onClick={() => handleUpdate(item._id, item.score, item.feedback)}
                                        >
                                            Submit
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
}

export default Dashboard;
