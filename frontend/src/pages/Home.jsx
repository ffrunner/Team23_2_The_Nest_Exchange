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

  return (

    <div className="home-page">
      <div className="homePageContainer">
        <div className="categoriesContainer">
          {categories.map((category, index) => (
            <Link key={index} to={category.link} className="categoryCard">
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