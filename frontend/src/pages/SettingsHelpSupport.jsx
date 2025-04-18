import React from 'react';
import '../css/SettingsHelpSupport.css';

const SettingsHelpSupport = () => {
    return (
        <div className="settings-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <ul>
                    <li><a href="/settings">My Account</a></li>
                    <li><a href="/settings-help-support">Help and Support</a></li>
                </ul>
            </aside>

            {/* Main Section*/}
            <main className="help-support-main">
                <h2>Help and Support</h2>

                {/* Community Guidelines */}
                <section className="community-guidelines">
                    <h3 
                        onClick={() => {
                            const dropdown = document.querySelector('.community-guidelines-dropdown');
                            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        Community Guidelines
                    </h3>
                    <div className="community-guidelines-dropdown" style={{ display: 'none' }}>
                            <div className="guideline-container">
                                <h4>Community Guidelines for The Nest Exchange</h4>
                                <p>Welcome to The Nest Exchange! We are excited to have you as part of our community. To ensure a positive experience for everyone, we have established the following community guidelines:</p>
                                <ul>
                                    <li>Be respectful and kind to others.</li>
                                    <li>Do not post any offensive or inappropriate content.</li>
                                    <li>Report any suspicious or harmful behavior.</li>
                                    <li>Follow the rules and regulations of the platform.</li>
                                    <li>If you have any questions or concerns, please reach out to our support team.</li>
                                </ul>
                            </div>
                        </div>
                </section>

                {/* FAQs */}
                <section className="FAQ">
                <h3 
                        onClick={() => {
                            const dropdown = document.querySelector('.faq-dropdown');
                            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        FAQs
                    </h3>
                    <div className="faq-dropdown" style={{ display: 'none' }}>
                        <div className="faq-container">
                            <h4>Frequently Asked Questions</h4>
                            <p></p>
                        </div>
                    </div>
                </section>

                {/* Contact Support */}
                <section className="contact-support">
                <h3 
                        onClick={() => {
                            const dropdown = document.querySelector('.contact-support-dropdown');
                            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        Contact Support
                    </h3>
                    <div className="contact-support-dropdown" style={{ display: 'none' }}>
                        <div className="contact-container">
                            <h4>Contact Support</h4>
                            <p>If you have any questions or need assistance, please reach out to our support team:</p>
                            <div className="contact-info">
                                <div className="contact-field">
                                    <h4>Students, Faculty, & Staff: </h4>
                                    <p>470-578-6999 / service@kennesaw.edu</p>
                                </div>
                                <div className="contact-field">
                                    <h4>UITS: </h4>
                                    <p>https://www.kennesaw.edu/uits/</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SettingsHelpSupport;

