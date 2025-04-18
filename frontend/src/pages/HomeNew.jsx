import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/HomeNew.css';

const NestExchange = () => {
    const [listings, setListings] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [error, setError] = useState(null);
    const [isContainerOpen, setIsContainerOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null); // State for selected listing
    const [isListItemOpen, setIsListItemOpen] = useState(false);
    const [isReporting, setIsReporting] = useState(false); // State for reporting modal
    const [reportReason, setReportReason] = useState(""); // State for report reason

    const backendBaseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        document.body.classList.add('home-body');
        return () => {
            document.body.classList.remove('home-body');
        };
    }, []);

    const categories = [
        { title: "Technology", image: "Technology.jpeg", link: "Technology" },
        { title: "Furniture", image: "Furniture.jpeg", link: "Furniture" },
        { title: "Academic Materials", image: "school-pencil-case-equipment.jpg", link: "Academic Materials" },
        { title: "Textbooks", image: "Textbooks.jpg", link: "Textbooks" },
    ];

    const fetchListings = async (category) => {
        try {
            setError(null);
            setSelectedCategory(category);
            setIsContainerOpen(true);

            const response = await axios.get(
                `${backendBaseUrl}/listings?category=${category}`,
                { withCredentials: true }
            );
            setListings(response.data.listings);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch listings. Please try again.");
        }
    };

    const closeContainer = () => {
        setIsContainerOpen(false);
        setListings([]);
        setSelectedCategory(null);
    };

    const closeListingDetails = () => {
        setSelectedListing(null);
    };

    const handleClaim = async (listingId) => {
        try {
            const response = await axios.post(
                `${backendBaseUrl}/items/${listingId}/claims/`,
                {},
                { withCredentials: true }
            );
            alert("You have successfully claimed this item!");
            closeListingDetails();
        } catch (err) {
            console.error(err);
            alert("Failed to claim the item. Please try again.");
        }
    };

    const handleReport = async (listingId) => {
        if (!reportReason.trim()) {
            alert("Please provide a reason for reporting this listing.");
            return;
        }

        try {
            const response = await axios.post(
                `${backendBaseUrl}/listings/${listingId}/report`,
                { reason: reportReason },
                { withCredentials: true }
            );
            alert(response.data.message || "The listing has been reported successfully.");
            setIsReporting(false); // Close the reporting container
            setReportReason(""); // Clear the reason
        } catch (err) {
            console.error("Error reporting the listing:", err);
            alert("Failed to report the listing. Please try again.");
        }
    };

    const toggleListItemContainer = () => {
        setIsListItemOpen(!isListItemOpen);
    };

    const handleListItemSubmit = async (event) => {
        event.preventDefault();

        const title = event.target.title.value;
        const description = event.target.description.value;
        const category_id = event.target.category_id.value;
        const pickup_details = event.target.pickup_details.value;
        const imageFile = event.target.photo_url.files[0];

        try {
            const itemResponse = await axios.post(
                `${backendBaseUrl}/items`,
                { title, description, category_id, pickup_details },
                { withCredentials: true }
            );

            const formData = new FormData();
            formData.append('file', imageFile);

            const photoResponse = await axios.post(
                `${backendBaseUrl}/items/photos/`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );

            console.log("Photo uploaded successfully:", photoResponse.data);
            console.log("Item created successfully:", itemResponse.data);
            toggleListItemContainer();
        } catch (error) {
            console.error("Error creating item or photo:", error);
            alert("Failed to create item or upload item photo");
        }
    };

    return (
        <div>
            <main>
                <div className="hero">
                    <h1>Share. Rethink. Renew.</h1>
                    <p>Uniting Our Community One Gift at a Time.</p>
                </div>

                <div className="about">
                    <h2>About Us</h2>
                    <p>The Nest Exchange is a community-driven platform designed to share items...</p>
                </div>

                <div className="featured-items">
                    <div className="categoriesContainer">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="categoryCard"
                                onClick={() => fetchListings(category.link)}
                            >
                                <img src={category.image} alt={`${category.title}`} />
                                <h3>{category.title}</h3>
                            </div>
                        ))}
                    </div>

                    {isContainerOpen && (
                        <div className="listingsContainer">
                            <button className="closeButton" onClick={closeContainer}>
                                Close
                            </button>
                            {selectedCategory && <h2>Listings for {selectedCategory}</h2>}
                            {error && <p className="error">{error}</p>}
                            {listings.length > 0 ? (
                                listings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="listingCard"
                                        onClick={() => setSelectedListing(listing)}
                                    >
                                        <img
                                            src={listing.photos && listing.photos[0] ? `${backendBaseUrl}${listing.photos[0]}` : "/static/images/placeholder.jpg"}
                                            alt={listing.title}
                                            className="listingPhoto"
                                        />
                                        <h3>{listing.title}</h3>
                                        <p>{listing.description}</p>
                                    </div>
                                ))
                            ) : (
                                selectedCategory && !error && <p>No listings found for this category.</p>
                            )}
                        </div>
                    )}

                    {selectedListing && (
                        <div className="listingDetailsContainer">
                            <button className="closeButton" onClick={closeListingDetails}>
                                Close
                            </button>
                            <div className="listingDetailsContent">
                                <img
                                    src={selectedListing.photos && selectedListing.photos[0] ? `${backendBaseUrl}${selectedListing.photos[0]}` : "/static/images/placeholder.jpg"}
                                    alt={selectedListing.title}
                                    className="listingPhoto"
                                />
                                <div className="listingInfo">
                                    <h2>{selectedListing.title}</h2>
                                    <p><strong>Description:</strong> {selectedListing.description}</p>
                                    
                                </div>
                                <div className="listerInfo">
                                    
                                    
                                </div>
                                <button className="claimButton" onClick={() => handleClaim(selectedListing.id)}>
                                    Claim
                                </button>
                                <button className="reportButton" onClick={() => setIsReporting(true)}>
                                    Report
                                </button>
                            </div>
                        </div>
                    )}

                    {isReporting && (
                        <div className="reportContainer">
                            <h3>Report Listing</h3>
                            <p>Please provide a reason for reporting this listing:</p>
                            <textarea
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="Enter your reason here..."
                                required
                            ></textarea>
                            <div className="reportButtons">
                                <button onClick={() => handleReport(selectedListing.id)}>Submit Report</button>
                                <button onClick={() => setIsReporting(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <button className="list-item-button" onClick={toggleListItemContainer}>
                        List an Item
                    </button>
                    {isListItemOpen && (
                        <div className="list-item-container">
                            <h3>List an Item</h3>
                            <form onSubmit={handleListItemSubmit}>
                                <label>
                                    Title:
                                    <input type="text" name="title" placeholder="Enter item title" required />
                                </label>
                                <label>
                                    Description:
                                    <textarea name="description" placeholder="Enter item description" required></textarea>
                                </label>
                                <label>
                                    Pickup Details:
                                    <textarea name="pickup_details" placeholder="Enter item pickup details" required></textarea>
                                </label>
                                <label>
                                    Category:
                                    <select name="category_id" required>
                                        <option value="1">Technology</option>
                                        <option value="2">Furniture</option>
                                        <option value="3">Academic Materials</option>
                                        <option value="4">Textbooks</option>
                                    </select>
                                </label>
                                <label>
                                    Image:
                                    <input type="file" name="photo_url" accept="image/*" required />
                                </label>
                                <button type="submit">Submit</button>
                                <button type="button" onClick={toggleListItemContainer}>
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="how-it-works">
                    <h2>How It Works</h2>
                    <ol>
                        <li>List your items for free.</li>
                        <li>Browse available items from others.</li>
                        <li>Claim an item and schedule pickup.</li>
                    </ol>
                </div>

                <div className="testimonials">
                    <h2>What Our Community Is Saying</h2>
                    <blockquote>"The Nest Exchange has changed how I connect with fellow students!"</blockquote>
                    <blockquote>"Great way to give and receive in our community!"</blockquote>
                </div>
            </main>

            <footer>
                <p>&copy; 2025 The Nest Exchange. Follow us on social media.</p>
                <p><a href="#privacy">Privacy Policy</a> | <a href="#terms">Terms of Service</a></p>
            </footer>
        </div>
    );
};

export default NestExchange;