import React, { useEffect, useState } from "react";
import "../css/Admin.css";
import axios from "axios";

const Admin = () => {
  const [usageReports, setUsageReports] = useState ( {
    total_listings: 0,
    total_items: 0,
    total_claims: 0,
    total_reports: 0,
  });

  useEffect(() => {
    // Fetch the usage reports from the backend
    const fetchUsageReports = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/usage`,
                { withCredentials: true },
        );
        setUsageReports(response.data);
      } catch (error) {
        console.error("Error fetching usage reports:", error);
      }
    };

    fetchUsageReports();
  }, []);
  return (
    <div className="admin-page">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>The Nest Exchange</h2>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/dashboard">My Profile</a></li>
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
              <p>{usageReports.total_users}</p>
              <p>120</p>
            </div>
            <div className="card">
              <h3>Total Listings</h3>
              <p>{usageReports.total_listings}</p>
              <p>310</p>
            </div>
            <div className="card">
              <h3>Total Items</h3>
              <p>{usageReports.total_items}</p>
              <p>5</p>
            </div>
            <div className="card">
              <h3>Total Reports</h3>
              <p>{usageReports.total_reports}</p>
            </div>
          </div>

          <h2>Recent Activity</h2>
          <div className="activity-log">
            <p>User John Doe added a new listing.</p>
            <p>User Jane Smith reported an item.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
