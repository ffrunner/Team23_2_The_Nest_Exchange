import React from 'react';
import '../css/Logo.css'; // Optional: Add CSS for styling

const Logo = () => {
    return (
        <div className="login-logo">
            <img src="/KSU Logo.png" alt="KSU Logo" style={{ width: '100px', height: 'auto' }} />
            <h1>The Nest Exchange</h1>
        </div>
    );
};

export default Logo;