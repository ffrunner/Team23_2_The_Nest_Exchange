import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Assuming you have a CSS file for styles

const Home = () => {
    const categories = [
        { title: "Academic Materials", image: "/path/to/academic-materials.jpg", link: "/academic-materials" },
        { title: "Textbooks", image: "/path/to/textbooks.jpg", link: "/textbooks" },
        { title: "Technology", image: "/path/to/technology.jpg", link: "/technology" },
        { title: "Furniture", image: "/path/to/furniture.jpg", link: "/furniture" },
    ];

    return (
        <div className="home-page-container">
            <h1>The Nest Exchange</h1>
            <div className="categories-container">
                {categories.map((category, index) => (
                    <Link key={index} to={category.link} className="category-card">
                        <img src={category.image} alt={`${category.title}`} />
                        <h3>{category.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;