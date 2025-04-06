import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';

const Home = () => {
  // Dynamically add a class to the body element
  useEffect(() => {
    document.body.classList.add('home-body'); // Add the class for Home page
    return () => {
      document.body.classList.remove('home-body'); // Remove the class when unmounted
    };
  }, []);

  const categories = [
    { title: "Academic Materials", image: "school-pencil-case-equipment.jpg", link: "/academic-materials" },
    { title: "Textbooks", image: "Textbooks.jpg", link: "/textbooks" },
    { title: "Technology", image: "Technology.jpeg", link: "/technology" },
    { title: "Furniture", image: "Furniture.jpeg", link: "/furniture" },
  ];

  // Function to fetch listings for a category
  const fetchListings = async (category) => {
    try {
      setError(null); // Reset error state
      setSelectedCategory(category); // Set the selected category
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/listings?category=${category}`);
      setListings(response.data); // Update listings state with fetched data
    } catch (err) {
      console.error(err);
      setError("Failed to fetch listings. Please try again.");
    }
  };
  
  return (
    <div className="home-page">
      <div className="homePageContainer">
        <div className="categoriesContainer">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/category/${category.link}`} // Navigate to the category page
              className="categoryCard"
            >
              <img src={category.image} alt={`${category.title}`} />
              <h3>{category.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;