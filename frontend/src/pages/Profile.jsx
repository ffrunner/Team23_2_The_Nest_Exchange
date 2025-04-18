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
    const [selectedListing, setSelectedListing] = useState(null);
     const categories = [
        { id: 1, title: "Technology", image: "Technology.jpeg", link: "Technology" },
        { id: 2, title: "Furniture", image: "Furniture.jpeg", link: "Furniture" },
        { id: 3, title: "Academic Materials", image: "school-pencil-case-equipment.jpg", link: "Academic Materials" },
        { id: 4, title: "Textbooks", image: "Textbooks.jpg", link: "Textbooks" },
    ];
    
    const handleSectionChange = (section) => {
        setSelectedSection(section);
        if (section === "Listings"){
            fetchItems();
        }
    };
    
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

useEffect(() => {
    const fetchClaimedItems = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/claimed`,
                { withCredentials: true }
            );
            setClaimedItems(response.data);
        } catch (error) {
            console.error("Error getting claimed items:", error);
            setError(error.response?.data?.detail || "Error occurred");
        }
    };

    fetchClaimedItems();
}, []); 

const fetchItems = async () => {
    setLoadingListings(true);
    setError(null);
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/items/`,
            { withCredentials: true }
        );
        setListings(response.data);
    } catch (error) {
        console.error("Error getting items:", error);
        setError(error.response?.data?.detail || "Error occurred");
    } finally {
        setLoadingListings(false);
    }
};
 const handleEdit = async() => {
     setLoadingListings(true);
     try {
         const response = await axios.put(
             `${import.meta.env.VITE_API_URL}/items/${selectedListing.id}`,
             selectedListing,
            { withCredentials: true }
        );
         setListings((prevListings) =>
            prevListings.map((item) =>
                item.id === selectedListing.id ? response.data : item
            )
        );
        alert("Listing has been edited successfully!");
        setSelectedListing(null); 
     } catch (error){
         console.error("Error editing listing:", error);
         alert("There was an error editing the listing");
     } finally {
         setLoadingListings(false);
     }
 };
  const handleDelete = async() => {
      try {
          const response = await axios.delete(
           `${import.meta.env.VITE_API_URL}/items/delete/${selectedListing.id}`,
            { withCredentials: true }
        );  
          if (response.status === 200){
              setListings((prevListings) => prevListings.filter((item) => item.id !== selectedListing.id));
              alert('Listing was deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting listing:', error);
              alert("There was an error deleting the listing");
            }
          };

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
              

                {/* Activity Section */}
                <section className="activity-section">
                    <h3>Activity</h3>
                    <div className="activity-cards">
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
               
                    {selectedSection === "Claimed" && (
                            <div className="claimed-container">
                                <h3>Claimed</h3>
                                {claimedItems.length === 0 ? (
                                    <p>You have not claimed any items</p>
                                ) : (
                                    claimedItems.map((item) => (
                                        <div key={item.id} className="claimed-item-card">
                                            <h2>{item.title}</h2>
                                            <p>{item.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    
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
                                    <li key = {item.id} onClick={() => setSelectedListing(item)}>
                                        {item.title} - {item.description}
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
            {selectedListing && (
        <div className="modal-backdrop" onClick={() => setSelectedListing(null)}>
          <div className="listing-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Listing</h3>
              <label>Title:</label>
            <input
              type = "text"
              value={selectedListing.title}
              onChange={(e) =>
                setSelectedListing({ ...selectedListing, title: e.target.value })
              }
            />
              <label>Description:</label>
            <textarea
              value={selectedListing.description || ""}
              onChange={(e) =>
                setSelectedListing({ ...selectedListing, description: e.target.value })
              }
            />
              <label>Pickup Details:</label>
              <input
                  type= "text"
                  value={selectedListing.pickup_details}
                  onChange={(e) =>
                      setSelectedListing({...selectedListing, pickup_details: e.target.value})
                }
             />
              <label>Category:</label>
              <select 
                  value={selectedListing.category_id}
                  onChange={(e) =>
                      setSelectedListing({...selectedListing, category_id: e.target.value})
                  }
                  >
                  <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
            <button onClick={() => handleEdit()}>Submit Changes</button>
            <button onClick={() => {
            if (window.confirm(`Are you sure you want to delete "${selectedListing.title}"?`)) {
                  handleDelete(); 
                }
              }}
              style={{ color: 'red' }}
            >
              Delete
            </button>
            <button onClick={() => setSelectedListing(null)}>Close</button>
          </div>
        </div>
      )}
        </div>
    );
};

export default Profile;