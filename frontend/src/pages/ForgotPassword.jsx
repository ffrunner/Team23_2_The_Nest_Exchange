import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css'; 

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
        
        setError('');
        try {
            const response = await fetch('http://localhost:8000/forgot-password', { // Adjust to your API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

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
        <>
        <div className="login-logo">
        <img src="/KSU Logo.png" alt="KSU Logo" style={{ width: '100px', height: 'auto' }} />
          <h1>The Nest Exchange</h1>
          </div>
        <div className="reset-container">
            <h2>Forgot Password?</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleReset}>
                <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Reset</button>
            </form>
        </div>
    </>
    );
};

export default ForgotPassword;