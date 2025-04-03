import React from "react";
import { Link } from "react-router-dom";
import '../css/NavBar.css'; // Ensure you have this CSS file for styling

function NavBar() {
    return (
        <nav className="navbar">
            <div className="login-logo">
          <img src="/KSU Logo.png" alt="KSU Logo" style={{ width: '100px', height: 'auto' }} />
          <h1>The Nest Exchange</h1>
        </div>
            <div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
             <Link to="/myDashboard" className="nav-link">My Dashboard</Link>
            </div>
        </nav>   

    ) 
}

export default NavBar;