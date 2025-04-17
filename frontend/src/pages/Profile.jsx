import React, { useEffect, useState } from 'react';
import '../css/Profile.css'; // Ensure you create this CSS file for styling
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState(null);
    const [userName, setUserName] = useState({ first_name: "", last_name: "" });
    const [error, setError] = useState(null);
    
    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    useEffect(() => {
        const fetchUserName = async () => {
            try{
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/name`,
                    { withCredentials: true, });
            setUserName(response.data);
            } catch(error) {
                console.error("Error getting user name:", error);
                setError(error.response?.data?.detail || "Error occurred");
            }
        };
        fetchUserName();
    }, []);
    
    return (
        <div className="profile-container">
            

            {/* Main Content */}
            <main className="profile-main">
                <h2>Profile</h2>
                {error ? (
                    <p>Error: {error}</p>
                ) : (
                <p>
                    {userName.first_name} {userName.last_name}
                </p>
            )}
                <div className="profile-header">
                    <img
                        src="/path-to-profile-image.jpg" // Replace with the actual image path
                        alt="Profile"
                        className="profile-image"
                    />
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
                        </div>
                        <div className="activity-card" onClick={() => handleSectionChange("Listings")}>
                            <p>Listings</p>
                            <h4>0</h4>
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
