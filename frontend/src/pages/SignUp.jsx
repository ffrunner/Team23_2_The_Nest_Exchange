import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/SignUp.css'; // Assuming a separate CSS file

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [role, setRole] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        console.log('API URL:', API_URL);
      
        if (password !== confirmPassword) {
          setError("Passwords do not match!");
          return;
        }
      
        setError('');
        setIsLoading(true);
      
        const userData = { 
          email, 
          username: userName, 
          password_hash: password,           
          role, 
          first_name: firstName, 
          last_name: lastName, 
          phone 
        };
      
        console.log('Submitting user data:', userData);
      
        try {
          const response = await axios.post(
            `${API_URL}/signup`,
            userData,
            { headers: { 'Content-Type': 'application/json' } }
          );
      
          console.log('Response:', response);
      
          if (response.status === 200) { // Check for 200 Created
            alert("Sign-up successful!");
            navigate('/'); // Redirect to login page
          } else {
            setError(response.data.detail || "Sign-up failed.");
          }
        } catch (error) {
          console.error("Error:", error.response || error.message);
          setError(error.response?.data?.detail || "An error occurred. Please try again.");
        } finally {
          setIsLoading(false);
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
                    placeholder="Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Phone"
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
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing up...' : 'Sign up'}
                </button>
            </form>
        </div>
        </>
    );
};

export default SignUp;