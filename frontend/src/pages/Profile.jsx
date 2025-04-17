import React from 'react';
import '../css/Profile.css'; // Ensure you create this CSS file for styling
import { useNavigate } from 'react-router-dom';
import React, { useState} from 'react';

const Profile = () => {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState(null);
    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };
    
    return (
        <div className="profile-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <ul>
                    <li><button onClick={() => navigate('/homeNew')}>Home</button></li>
                    <li><button onClick={() => navigate('/profile')}>Profile</button></li>
                    <li><button onClick={() => navigate('/admin')}>Admin</button></li>
                    <li><button onClick={() => navigate('/settings')}>Settings</button></li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="profile-main">
                <h2>My Profile</h2>
                <div className="profile-header">
                    <img
                        src="/path-to-profile-image.jpg" // Replace with the actual image path
                        alt="Profile"
                        className="profile-image"
                    />
                    <h3>John Smith</h3>
                </div>

                {/* Activity Section */}
                <section className="activity-section">
                    <h3>Activity</h3>
                    <div className="activity-cards">
                        <div className="activity-card" onClick={() => handleSectionChange("Offers")}>
                            <p>Offers</p>
                            <h4>0</h4>
                        </div>
                        <div className="activity-card" onClick={() => handleSectionChange("Claimed")}>
                            <p>Claimed</p>
                            <h4>0</h4>
                            <span className="badge">30</span>
                        </div>
                        <div className="activity-card" onClick={() => handleSectionChange("Listings")}>
                            <p>Listings</p>
                            <h4>0</h4>
                            <span className="badge">300</span>
                        </div>
                    </div>
                </section>
                <section className="dynamic-section">
                    {selectedSection === "Offers" && (
                        <div className="offers-container">
                            <h3>Offers</h3>
                            <p>Your offers</p>
                        </div>
                    )}
                    {selectedSection === "Claimed" && (
                        <div className="claimed-container">
                            <h3>Claimed</h3>
                            <p>Your claimed items</p>
                        </div>
                    )}
                    {selectedSection === "Listings" && (
                        <div className="listings-container">
                            <h3>Listings</h3>
                            <p>Your listings</p>
                        </div>
                    )}
                
                </section>
            </main>
        </div>
    );
};

export default Profile;
