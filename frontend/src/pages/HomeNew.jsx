import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/ForgotPassword.module.css';



const NestExchange = () => {
    return (
        <div>
            <header>
                <div className="logo">The Nest Exchange</div>
                <nav>
                    <ul>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#browse">Browse Items</a></li>
                        <li><a href="#how-it-works">How It Works</a></li>
                        <li><a href="#faq">FAQs</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav>
            </header>

            <main>
                <section className="hero">
                    <h1>Share. Rethink. Renew</h1>
                    <p>Uniting Our Community One Gift at a Time.</p>
                    <button><a href="#list-item">List an Item</a></button>
                    <button><a href="#browse">Browse Items</a></button>
                </section>

                <section id="about">
                    <h2>About Us</h2>
                    <p>The Nest Exchange is a community-driven platform designed to share items...</p>
                </section>

                <section id="how-it-works">
                    <h2>How It Works</h2>
                    <ol>
                        <li>List your items for free.</li>
                        <li>Browse available items from others.</li>
                        <li>Claim an item and schedule pickup.</li>
                    </ol>
                </section>

                <section id="featured-items">
                    <h2>Featured Items</h2>
                    <div className="item">
                        <img src="item1.jpg" alt="Item 1" />
                        <h3>Item Title</h3>
                        <p>Short description of the item.</p>
                        <button>Claim Now</button>
                    </div>
                    {/* More items can be added similarly */}
                </section>

                <section id="testimonials">
                    <h2>What Our Community Is Saying</h2>
                    <blockquote>"The Nest Exchange has changed how I connect with fellow students!"</blockquote>
                    <blockquote>"Great way to give and receive in our community!"</blockquote>
                </section>
            </main>

            <footer>
                <p>&copy; 2025 The Nest Exchange. Follow us on social media.</p>
                <p><a href="#privacy">Privacy Policy</a> | <a href="#terms">Terms of Service</a></p>
            </footer>
        </div>
    );
};

export default NestExchange;