import React from "react";
import "../css/Admin.css";

const Admin = () => {
  return (
    <div className="admin-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>The Nest Exchange</h2>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/admin" className="active">Admin</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header>
          <h1>Admin Panel</h1>
          <button className="menu-button">Menu</button>
        </header>

        <div className="admin-dashboard">
          <h2>Manage Listings</h2>
          <div className="admin-cards">
            <div className="card">
              <h3>Total Users</h3>
              <p>120</p>
            </div>
            <div className="card">
              <h3>Total Listings</h3>
              <p>310</p>
            </div>
            <div className="card">
              <h3>Reported Items</h3>
              <p>5</p>
            </div>
          </div>

          <h2>Recent Activity</h2>
          <div className="activity-log">
            <p>User John Doe added a new listing.</p>
            <p>User Jane Smith reported an item.</p>
            <p>Admin approved a listing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;