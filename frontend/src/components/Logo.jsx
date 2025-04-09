import React from 'react';
import '../css/Logo.css'; // Optional: Add CSS for styling
import KsuLogo from '../assets/images/KSU Logo.png'; // Import the image

const Logo = () => {
    return (
        <div className="login-logo">
            <img src={KsuLogo} alt="KSU Logo" style={{ width: '100px', height: 'auto' }} />
            <h1>The Nest Exchange</h1>
        </div>
    );
};

export default Logo;