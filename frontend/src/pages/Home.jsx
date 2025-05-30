import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/Home.css';

const Home = () => {
  const [listings, setListings] = useState([]); // State for fetched listings
  const [selectedCategory, setSelectedCategory] = useState(null); // State for the selected category
  const [error, setError] = useState(null); // State for errors
  const [isContainerOpen, setIsContainerOpen] = useState(false); // State for new container visibility

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
  
      // Use the category value directly without formatting
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/listings?category=${category}`,
        { withCredentials: true}
      );
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
  
  return (
    <div className="home-page">
      <div className="homePageContainer">
        {/* Categories Section */}
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

        {/* Listings Section */}
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
          <img
            src={listing.photo || "/static/images/placeholder.jpg"}
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
      </div>
    </div>
  );
};

export default Home;