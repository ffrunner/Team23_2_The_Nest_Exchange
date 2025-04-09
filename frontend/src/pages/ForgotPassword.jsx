import React, { useState } from 'react';
import axios from 'axios';
import styles from '../css/ForgotPassword.module.css'; // Import the CSS module

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
                `${API_URL}/forgot-password`,
                { email },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                setMessage('A password reset link has been sent to your email.');
            } else {
                setError(response.data.detail || 'An error occurred.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className={styles.content}>
            <div className={styles.resetContainer}>
                <h2 className={styles.heading}>Reset Your Password</h2>
                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleReset}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className={styles.button}>Reset</button>
                    <a href="/login" className={styles.link}>Back to Login</a>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;