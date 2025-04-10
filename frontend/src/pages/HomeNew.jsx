import React from 'react';
import { Link } from 'react-router-dom';
import '../css/HomeNew.css';

const NestExchange = () => {
    return (
        <div>
            <main>
                <div className="hero">
                    <h1>Share. Rethink. Renew</h1>
                    <p>Uniting Our Community One Gift at a Time.</p>
                    <div className="hero-buttons">
                        <button><Link to="/list-item">List an Item</Link></button>
                        <button><Link to="/browse">Browse Items</Link></button>
                    </div>
                </div>

                <div className="about">
                    <h2>About Us</h2>
                    <p>The Nest Exchange is a community-driven platform designed to share items...</p>
                </div>

                <div className="how-it-works">
                    <h2>How It Works</h2>
                    <ol>
                        <li>List your items for free.</li>
                        <li>Browse available items from others.</li>
                        <li>Claim an item and schedule pickup.</li>
                    </ol>
                </div>

                <div className="featured-items">
                    <h2>Featured Items</h2>
                    <div className="item">
                        <img src="https://via.placeholder.com/150" alt="Item 1" />
                        <h3>Item Title</h3>
                        <p>Short description of the item.</p>
                        <button>Claim Now</button>
                    </div>
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