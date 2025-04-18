import React from 'react';
import '../css/Settings.css';

const Settings = () => {
    return (
        <div className="settings-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <ul>
                    <li><a href="/settings">My Account</a></li>
                    <li><a href="/settings-help-support">Help and Support</a></li>
                </ul>
            </aside>

            {/* Main Account Section*/}
            <main className="account-main">
                <h2>My Account</h2>

                {/* Profile Header */}
                <div className="profile-header">
                    <img
                        src="/path-to-profile-image.jpg" // Replace with the actual image path
                        alt="Profile"
                        className="profile-image"
                    />
                    <h3>John Smith</h3> {/*replace with user's name */}
                </div>

                {/* Edit Profile */}
                <section className="edit-profile">
                    <h3 
                        onClick={() => {
                            const dropdown = document.querySelector('.edit-profile-dropdown');
                            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        Edit Profile
                    </h3>
                    <div className="edit-profile-dropdown" style={{ display: 'none' }}>
                        <div className="edit-profile-container">
                            <h4>Edit Profile</h4>
                            <form>
                                <div className="top-fields">
                                    <div classname="field">
                                        <label htmlFor="first-name">First Name</label> <br/>
                                        <input type="text" id="first-name" name="first-name" required />
                                    </div>
                                    <div classname="field">
                                        <label htmlFor="last-name">Last Name</label> <br/>
                                        <input type="text" id="last-name" name="last-name" required />
                                    </div>
                                </div>
                                <br />

                                <div className="bottom-fields">
                                    <div classname="field">
                                        <label htmlFor="username">Username</label> <br></br>
                                        <input type="text" id="username" name="username" required />
                                    </div>
                                    <div classname="field">
                                        <label htmlFor="phone">Phone Number</label> <br></br>
                                        <input type="tel" id="phone" name="phone" required />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="email">Email</label> <br></br>
                                        <input type="email" id="email" name="email" required />
                                    </div>
                                </div>

                                <br />

                                <button type="submit">Save Changes</button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Change Password */}
                <section className="change-password">
                <h3 
                        onClick={() => {
                            const dropdown = document.querySelector('.change-password-dropdown');
                            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        Change Password
                    </h3>
                    <div className="change-password-dropdown" style={{ display: 'none' }}>
                        <div className="change-password-container">
                            <h4>Change Password</h4>
                            <form>
                                <label htmlFor="current-password">Current Password</label> <br></br>
                                <input type="password" id="current-password" name="current-password" required />
                                <br></br>

                                <label htmlFor="new-password">New Password</label> <br></br>
                                <input type="password" id="new-password" name="new-password" required />
                                <br></br>

                                <label htmlFor="confirm-password">Confirm New Password</label> <br></br>
                                <input type="password" id="confirm-password" name="confirm-password" required />
                                <br></br>
                                <br></br>

                                <button type="submit">Change Password</button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Delete Profile */}
                <section className="delete-profile">
                <h3 
                        onClick={() => {
                            const dropdown = document.querySelector('.delete-profile-dropdown');
                            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        Delete Profile
                    </h3>
                    <div className="delete-profile-dropdown" style={{ display: 'none' }}>
                        <div className="delete-profile-container">
                            <h4>Delete Profile</h4>
                            <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
                            <button type="button" className="delete-button">Delete Profile</button>
                            <button type="button" className="cancel-button"> Cancel </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Settings;