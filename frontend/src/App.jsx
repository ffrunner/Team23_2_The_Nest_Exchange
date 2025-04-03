import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home'; // Ensure you import the Home component
import './css/App.css';

function App() {
    return (
        <main className="main-content">
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/home" element={<Home />} /> {/* Add the Home route */}
                {/* Optionally add a 404 page handling */}
                {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
        </main>
    );
}

export default App;