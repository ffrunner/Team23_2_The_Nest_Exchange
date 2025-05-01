import React, { useState } from "react";
import { Link } from "react-router-dom";
import '../css/NavBar.css'; // Ensure you have this CSS file for styling
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NavBar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchResult, setSearchResult] = useState([]);
    
    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        const query = event.target.search.value;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/items/search/`, 
                {
                     params: { keyword : query}, 
                     withCredentials: true,
                }
            ); 
            setSearchResults(response.data);
            console.log('Search query:', response.data); 
            setIsSearchOpen(false); // Optionally close the search bar after submission
        } catch (error) {
        console.error('Search failed:', error);
        alert("There was an error searching");
    }
};
    const navigate = useNavigate();
    const handleLogout = async () => {
        try{
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {}, { withCredentials: true});
            if (response.status === 200){
                console.log("Successfully logged out!");
                navigate("/login");
            }
        } catch (error) {
            if (error.response) {
                console.error("Logout failed:", error.response.data.detail);
                alert("Logout failed:" + error.response.data.detail);
            } else {
                console.error("Logout failed", error.message);
                alert("Error occurred. Please try again.");
            }
        }
    };
    return (
        <div className="navbar">
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
                    {searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map(item => (
                                    <div key={item.id} className="search-item">
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                        <p>{item.pickup_details}</p>
                                    </div>
                                ))}
                            </div>
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
                <button className="logoutButton" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            {isMenuOpen && (
                <div className="menuOverlay">
                    <nav>
                        <ul>
                            <li><Link to="/home">Home</Link></li>
                            <li><Link to="/profile">My Profile</Link></li>
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
