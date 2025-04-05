import React, { useState } from 'react';
import '../../css/Dashboard.css';
import NavBar from '../components/NavBar';

function Dashboard() {
  return (
    <>
      <NavBar />
    </>
  );
}
<div className="dashboard-container">
  <aside className="sidebar">
    <ul>
      <li>Home</li>
      <li>Dashboard</li>
      <li>Admin</li>
      <li>Settings</li>
    </ul>
  </aside>

  <main className="main-content">
    <h2>My Dashboard</h2>
    <div className="profile">
      <img src="/profile.jpg" alt="Profile" />
      <span>John Smith</span>
    </div>

    <h3>Activity</h3>
    <div className="activity-cards">
      <div className="card"><p>Offers</p><h2>0</h2></div>
      <div className="card"><p>Claimed</p><h2>0</h2></div>
      <div className="card"><p>Listings</p><h2>0</h2></div>
    </div>
  </main>
</div>
export default Dashboard;
