import React, { useState, useEffect } from 'react';
import '../css/Settings.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [userName, setUserName] = useState({ first_name: "", last_name: "" });
    const [formData, setFormData] = useState({
            first_name: '',
            last_name: '',
            username: '',
            email: '',
          });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
    const fetchUserName = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/name`,
                { withCredentials: true }
            );
            setUserName(response.data);
        } catch (error) {
            console.error("Error getting your name:", error);
            setError(error.response?.data?.detail || "Error occurred");
        }
    };

    fetchUserName();
}, []); 
    
     const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert("New password and confirm password do not match");
        return;
    }

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/changepassword`,
            {
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
            },
            { withCredentials: true }
        );

        if (response.status === 200) {
            alert('Your password has been successfully changed!');
        }
    } catch (error) {
        console.log("Failed to change your password:", error);
        alert("Error occurred when changing your password. Please try again.");
    }
};

    const updateUser = async (updateData) => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/update/user`,
                updateData,
                { withCredentials: true }
            );
            return response.data;
    } catch (error) {
        console.log("Failed to save your account changes:", error)
    }
};
     const handleSubmit = async (e) => {
        e.preventDefault();

        const filteredData = Object.fromEntries(
            Object.entries(formData).filter(([_, v]) => v.trim() !== '')
        );

        const updated = await updateUser(filteredData);
        if (updated) {
            alert('Your account changes have been saved!');
            console.log(updated);
        } else {
            alert('Failed to save your account changes.');
        }
    }; 

const handleDeleteAccount = async () => {

    setLoading(true);
    setError(null);

    try {
        const response = await axios.delete(
            `${import.meta.env.VITE_API_URL}/deleteaccount`,
            { withCredentials: true }
        );

        if (response.status === 200) {
            alert("Your account has been deleted.");

            
            navigate('/');  
        }
    } catch (error) {
        console.error("Failed to delete your Nest Exchange account:", error);
        setError("There was an error deleting your Nest Exchange account.");
    } finally {
        setLoading(false);
    }
};

    
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
              {error ? (
                    <p>Error: {error}</p>
                ) : (
                <p>
                    {userName.first_name} {userName.last_name}
                </p>
            )}

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
                            <form onSubmit={handleSubmit}>
                                <div className="top-fields">
                                    <div className="field">
                                        <label htmlFor="first-name">First Name</label> <br/>
                                        <input 
                                            type="text" 
                                            id="first_name" 
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                            />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="last-name">Last Name</label> <br/>
                                        <input 
                                            type="text" 
                                            id="last_name" 
                                            name="last_name" 
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            required />
                                    </div>
                                </div>
                                <br />

                                <div className="bottom-fields">
                                    <div className="field">
                                        <label htmlFor="username">Username</label> <br></br>
                                        <input 
                                            type="text" 
                                            id="username" 
                                            name="username" 
                                            value={formData.username}
                                            onChange={handleChange}
                                            required />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="email">Email</label> <br></br>
                                        <input 
                                            type="email" 
                                            id="email" 
                                            name="email" 
                                            value={formData.email}
                                            onChange={handleChange}
                                            required />
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
                            <form onSubmit={handleSubmitPasswordChange}>
                                <label htmlFor="current-password">Current Password</label> <br></br>
                                <input 
                                    type="password" 
                                    id="currentPassword" 
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required />
                                <br></br>

                                <label htmlFor="new-password">New Password</label> <br></br>
                                <input 
                                    type="password" 
                                    id="newPassword" 
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required />
                                <br></br>

                                <label htmlFor="confirm-password">Confirm New Password</label> <br></br>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required />
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
                            <button 
                                type="button" 
                                className="delete-button"
                                onClick={handleDeleteAccount} 
                                disabled={loading}
                                >Delete Profile</button>
                            <button 
                                type="button" 
                                className="cancel-button"
                                 onClick={() => {
                                    const dropdown = document.querySelector('.delete-profile-dropdown');
                                    dropdown.style.display = 'none';
                                }}
                            >
                                Cancel 
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Settings;