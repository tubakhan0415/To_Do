import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function AdminDashboard() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found. Please log in again.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/admin-dashboard', {
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
                    console.log('Fetched data:', result.data); // Debug log
                    setData(result.data);
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchData();
    }, []);

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
            console.log('Filtered data:', result.data); // Debug log
            setData(result.data);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Admin Dashboard</h2>
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="Filter by manager's name"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button onClick={handleFilter}>Filter</button>
            </div>
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
                                <td>{item.score}</td>
                                <td>{item.feedback}</td>
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

export default AdminDashboard;
