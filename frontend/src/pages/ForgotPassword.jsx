import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/ForgotPassword.css'; 

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email.');
            return;
        }
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    console.log('API URL:', API_URL);

        setError('');
        try {
            const response = await axios.post(
                `${API_URL}/login`,
                userData,
                { headers: { 'Content-Type': 'application/json' } }
              );

            const data = await response.json();

            if (response.ok) {
                setMessage('A password reset link has been sent to your email.');
            } else {
                setError(data.detail || "An error occurred.");
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="reset-container">
                <h2>Forgot Password?</h2>
                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleReset}>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Reset</button>
                </form>
            </div>
        </div>
    );
};


export default ForgotPassword;