import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    console.log('API URL:', API_URL);
  
    // Define the userData object
    const userData = {
      email: email,
      password: password,
    };
  
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        userData,
        { 
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
  
      if (response.status === 200) {
        // Redirect to the home page on successful login
        console.log('Login successful, redirecting...');
        navigate('/home'); 
      } else {
        setError(response.data.detail || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-page">
      
      <div className="login-container">
        <h2 className="login-title">Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
           
          </div>
          <button type="submit" className="login-button">Login</button>
          <p className="register-text">
            Don’t have an account? <Link to="/signup" className="register-link">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;