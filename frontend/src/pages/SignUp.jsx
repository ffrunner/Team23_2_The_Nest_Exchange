import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SignUp.css'; // Assuming a separate CSS file

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState(''); 
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        // Reset error before proceeding
        setError('');
        
        const userData = { 
            email, 
            password_hash: password,  // Match the field expected by the backend
            name, 
            role 
        };

        try {
            const response = await fetch('http://localhost:8000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
        
            const data = await response.json();
            console.log("Response Data:", data);  // Check the response
        
            if (response.ok) {
                alert("Sign-up successful!");
                navigate('/'); // Redirect to login page
            } else {
                setError(data.detail || "Sign-up failed.");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <>
        <div className="sign-up-container">
            <h2>Sign up</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                >
                    <option value="" disabled>Select Role</option> {/* Placeholder Option */}
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit">Sign up</button>
            </form>
        </div>
        </>
    );
};

export default SignUp;