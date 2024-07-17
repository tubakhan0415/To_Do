import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // Import Dashboard correctly
import FormWrapper from './components/FormWrapper';
import Navbar from './components/Navbar';
 // Import AdminDashboard
import './App.css';

function App() {
    return (
        <Router>
            <div>
                <Navbar /> {/* Navbar should be at the top */}
                <Routes>
                    <Route path="/" element={<FormWrapper />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
