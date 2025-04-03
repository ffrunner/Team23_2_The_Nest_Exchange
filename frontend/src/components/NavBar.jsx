import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../css/NavBar.css'; // Ensure you have this CSS file for styling

const NavBar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const query = event.target.search.value;
        console.log('Search query:', query); // Replace with actual search logic
        setIsSearchOpen(false); // Optionally close the search bar after submission
    };

    return (
        <div className="navbar">
            <div className="login-logo">
                <img src="/KSU Logo.png" alt="KSU Logo" style={{ width: '100px', height: 'auto' }} />
                <h1>The Nest Exchange</h1>
            </div>
            <div className="right-container">
                <div className="searchContainer">
                    <button onClick={handleSearchToggle}>
                        <i className="fas fa-search"></i>
                    </button>
                    {isSearchOpen && (
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                name="search"
                                placeholder="Search..."
                                className="searchInput"
                            />
                        </form>
                    )}
                </div>
                <button className="menuButton" onClick={handleMenuToggle}>
                    <div className="menuIcon">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    {isMenuOpen ? "X" : "MENU"}
                </button>
            </div>
            {isMenuOpen && (
                <div className="menuOverlay">
                    <nav>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/settings">Settings</Link></li>
                            <li><Link to="/admin">Admin</Link></li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default NavBar;