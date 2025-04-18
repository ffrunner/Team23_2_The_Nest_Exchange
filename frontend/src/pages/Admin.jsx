import React, { useEffect, useState } from "react";
import "../css/Admin.css";
import axios from "axios";

const Admin = () => {
  const [activityLog, setActivityLog] = useState([]);
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
          `${import.meta.env.VITE_API_URL}/admin/usage`,
                { withCredentials: true },
        );
        setUsageReports(response.data);
      } catch (error) {
        console.error("Error fetching usage reports:", error);
      }
    };

    const fetchActivityLog = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/activitylog`,
          { withCredentials: true },
          );
        setActivityLog(response.data);
      } catch (error) {
        console.error("Error fetching activity log:", error);
      }
    };
  fetchUsageReports();
  fetchActivityLog();
}, []);
      
  return (
    <div className="admin-page">

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
              <h3>Total Claims</h3>
              <p>{usageReports.total_claims}</p>
              <p>5</p>
            </div>
            <div className="card">
              <h3>Total Reports</h3>
              <p>{usageReports.total_reports}</p>
            </div>
          </div>

          <h2>Recent Activity</h2>
          <div className="activity-log">
            {activityLog.length === 0 ? (
            <p>No recent activity</p>
        ) : (
        <ul>
          {activityLog.map((db_activity) => (
          <li key={db_activity.id}>
          User {db_activity.user_id} : {db_activity.action} at {db_activity.created_at}
          </li>
          ))}
        </ul>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
