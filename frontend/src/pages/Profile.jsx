import React from 'react';
import '../css/Profile.css'; // Ensure you create this CSS file for styling
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
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
                        <div className="activity-card">
                            <p>Offers</p>
                            <h4>0</h4>
                        </div>
                        <div className="activity-card">
                            <p>Claimed</p>
                            <h4>0</h4>
                            <span className="badge">30</span>
                        </div>
                        <div className="activity-card">
                            <p>Listings</p>
                            <h4>0</h4>
                            <span className="badge">300</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;
