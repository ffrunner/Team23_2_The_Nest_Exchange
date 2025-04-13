import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext'; // Import the UserContext
import '../css/HomeNew.css';

const NestExchange = () => {
    const { user } = useUser(); // Access the logged-in user's info
    const [listings, setListings] = useState([]); // State for fetched listings
    const [selectedCategory, setSelectedCategory] = useState(null); // State for the selected category
    const [error, setError] = useState(null); // State for errors
    const [isContainerOpen, setIsContainerOpen] = useState(false); // State for new container visibility
    const [isListItemOpen, setIsListItemOpen] = useState(false); // State for the "List an Item" container

    // Dynamically add a class to the body element
    useEffect(() => {
        document.body.classList.add('home-body'); // Add the class for Home page
        return () => {
            document.body.classList.remove('home-body'); // Remove the class when unmounted
        };
    }, []);

    const categories = [
        { title: "Academic Materials", image: "school-pencil-case-equipment.jpg", link: "Academic Materials" },
        { title: "Textbooks", image: "Textbooks.jpg", link: "Textbooks" },
        { title: "Technology", image: "Technology.jpeg", link: "Technology" },
        { title: "Furniture", image: "Furniture.jpeg", link: "Furniture" },
    ];

    // Function to fetch listings for a category
    const fetchListings = async (category) => {
        try {
            setError(null); // Reset error state
            setSelectedCategory(category); // Set the selected category
            setIsContainerOpen(true); // Open the new container

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/listings?category=${category}`);
            console.log("Fetched listings:", response.data.listings); // Debug: Log fetched listings
            setListings(response.data.listings);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch listings. Please try again.");
        }
    };

    // Function to close the container
    const closeContainer = () => {
        setIsContainerOpen(false);
        setListings([]);
        setSelectedCategory(null);
    };

    const toggleListItemContainer = () => {
        setIsListItemOpen(!isListItemOpen);
    };

    // Function to handle form submission for listing an item
    const handleListItemSubmit = async (event) => {
        event.preventDefault();
    
        if (!user) {
            console.error("User is not logged in.");
            return;
        }
    
        const title = event.target.title.value;
        const description = event.target.description.value;
        const category_id = event.target.category_id.value;
    
        try {
            const itemResponse = await axios.post(`${import.meta.env.VITE_API_URL}/items`, {
                title,
                description,
                category_id,
                lister_id: user.id, // Use the logged-in user's ID
            });
    
            console.log("Item created successfully:", itemResponse.data);
    
            // Set the success message
            setSuccessMessage("Your item has been listed successfully!");
    
            // Clear the success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
    
            // Close the form and reset the state
            toggleListItemContainer();
        } catch (error) {
            console.error("Error creating item:", error.response?.data || error.message);
        }
    };

    return (
        <div>
            <main>
                <div className="hero">
                    <h1>Share. Rethink. Renew</h1>
                    <p>Uniting Our Community One Gift at a Time.</p>
                    <div className="hero-login-signup">
                        <button><Link to="/login">Login/Sign Up</Link></button>
                    </div>
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
                                onClick={() => fetchListings(category.link)} // Fetch listings when clicked
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
                                    <div key={listing.id} className="listingCard">
                                        <h3>{listing.title}</h3>
                                        <p>{listing.description}</p>
                                    </div>
                                ))
                            ) : (
                                selectedCategory && !error && <p>No listings found for this category.</p>
                            )}
                        </div>
                    )}

                    {/* "List an Item" Button */}
                    <button className="list-item-button" onClick={toggleListItemContainer}>
                        List an Item
                    </button>

                    {/* "List an Item" Container */}
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
                                    Category:
                                    <select name="category_id" required>
                                        <option value="1">Academic Materials</option>
                                        <option value="2">Textbooks</option>
                                        <option value="3">Technology</option>
                                        <option value="4">Furniture</option>
                                    </select>
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