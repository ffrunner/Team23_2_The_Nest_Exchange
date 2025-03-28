import React, { useState } from 'react';
import './Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { email, password };

    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        console.log(data); // Log response data
        
        if (response.ok) {
            // Handle successful login
            alert(data.message);
        } else {
            // Handle login error
            alert("Login failed.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
  };

  return (
    <>
    <div className="login-logo">
    <img src="/KSU Logo.png" alt="KSU Logo" style={{ width: '100px', height: 'auto' }} />
      <h1>The Nest Exchange</h1>
      </div>
    <div className="login-container">
      <h2>Login</h2>
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
        <button type="submit">Sign in</button>
        <button type="button">Sign up</button>
        <a href="#">Forget Password?</a>
      </form>
    </div>
  </>
  );
};

export default Login;