import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css'; // Assuming a separate CSS file

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState(''); 
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const userData = { 
            email, 
            password: password_hash,  // Match the field expected by the backend
            firstName: first_name, 
            lastName : last_name,
            username, 
            phone,
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
                navigate('http://localhost:8000/login'); // Redirect to login page
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
        <div className="login-logo">
            <img src="/KSU Logo.png" alt="KSU Logo" style={{ width: '100px', height: 'auto' }} />
            <h1>The Nest Exchange</h1>
        </div>
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
                    type="text"
                    placeholder="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
