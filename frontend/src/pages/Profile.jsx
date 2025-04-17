import React, { useEffect, useState } from 'react';
import '../css/Profile.css'; // Ensure you create this CSS file for styling
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState(null);
    const [userName, setUserName] = useState({ first_name: "", last_name: "" });
    const [error, setError] = useState(null);
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(false);
    const [claimedItems, setClaimedItems] = useState([]);
    
    const handleSectionChange = (section) => {
        setSelectedSection(section);
        if (section === "Listings"){
            fetchItems();
        }
    };

    useEffect(() => {
        const fetchUserName = async () => {
            try{
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/name`,
                    { withCredentials: true, });
            setUserName(response.data);
            } catch(error) {
                console.error("Error getting your listings:", error);
                setError(error.response?.data?.detail || "Error occurred");
            }
        };
        fetchUserName();
    }, []);

        const fetchItems = async() => {
            setLoadingListings(true);
            setError(null);
            try{
                const response = await axios.get(
                     `${import.meta.env.VITE_API_URL}/items/`,  
                    { withCredentials: true, });
                setListings(response.data);
            } catch(error) {
                 console.error("Error getting user name:", error);
                 setError(error.response?.data?.detail || "Error occurred");
            }finally {
                setLoadingListings(false);
            }
        };
       const fetchClaimedItems = async () => {
           try {
               const response = await axios.get(
                   `${import.meta.env.VITE_API_URL}/claimed`,
                   { withCredentials: true,});
               setClaimedItems(response.data);
           } catch(error) {
                 console.error("Error getting claimed items:", error);
                 setError(error.response?.data?.detail || "Error occurred");
           }
       };
        
    }, []);
    return (
        <div className="profile-container">
            

            {/* Main Content */}
            <main className="profile-main">
                <h2>My Profile</h2>
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
                            <h4>{listings.length}</h4>
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
                            { claimedItems.length === 0 ? (
                            <p> You have not claimed items</p>
                            ) : (
                                claimedItems.map((item) => (
                                    <div key={item.id} className="claimed-item-card">
                                     <h2>{item.title}</h2>
                                    <p>{item.description}</p>
                                    </div>
                               ))
                            )}
                        </div>
         
            )  
                    )};
                    {selectedSection === "Listings" && (
                        <div className="listings-container">
                            <h3>Listings</h3>
                            {loadingListings ? (
                             <p> Loading your listings...</p>
                            ) : error ? (
                                <p>Error: {error}</p>
                            ) : (
                            <ul> {listings.length > 0 ? (
                                listings.map((item) => (
                                    <li key = {item.id}>
                                        {item.name} - {item.description}
                                    </li>
                                    ))
                                ) : (
                                <p> No listings were found</p>
                                )}
                            </ul>
                            )}
                        </div>
                    )}
                
                </section>
            </main>
        </div>
    );
};

export default Profile;
