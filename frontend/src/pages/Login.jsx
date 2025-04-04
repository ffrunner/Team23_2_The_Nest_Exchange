import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email, 'Password:', password);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
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
            <Link to="/forgot-password" className="forgot-password">
              Forget password?
            </Link>
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