import React, { useEffect, useState } from "react";
import "../css/Admin.css";
import axios from "axios";

const Admin = () => {
  const [activityLog, setActivityLog] = useState([]);
  const [usageReports, setUsageReports] = useState({
    total_listings: 0,
    total_users: 0,
    total_claims: 0,
    total_reports: 0,
  });
  const [reports, setReports] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);


  //Function to get counts of users, listings, etc
  useEffect(() => {
    const fetchUsageReports = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/usage`,
          { withCredentials: true }
        );
        setUsageReports(response.data);
      } catch (error) {
        console.error("Error fetching usage reports:", error);
      }
    };

    //Function to fill activity log 
    const fetchActivityLog = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/activitylog`,
          { withCredentials: true }
        );
        setActivityLog(response.data);
      } catch (error) {
        console.error("Error fetching activity log:", error);
      }
    };

    fetchUsageReports();
    fetchActivityLog();
  }, []);

  //Function to get all reports when report box is clicked
  const handleReportsClick = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/reports`,
        { withCredentials: true }
      );
      setReports(response.data.reports);
      setShowReports(true);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  //Function to call backend to resolve reports
  const resolveReport = async (action) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/reports/resolve`,
        {
          report_id: selectedReport.id,
          action: action,
        },
        { withCredentials: true }
      );
      alert("Report resolved successfully");

      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id ? { ...r, resolved: true } : r
        )
      );
      setSelectedReport((prev) => ({ ...prev, resolved: true }));
    } catch (error) {
      console.error("There was an error resolving the report:", error);
      alert("Failed to resolve report");
    }
  };

  //Function to load all users from database when the users tab is clicked 
  const handleUsersClick = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/admin/users`,
      { withCredentials: true }
    );
    setUsers(response.data.users);
    setShowUsers(true);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};
const promoteUser = async (userId) => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/promote`,
      { user_id: userId },
      { withCredentials: true }
    );
    alert("User promoted to Admin successfully!");
    fetchUsers();
  } catch (error) {
    console.error("Error promoting user:", error);
    alert("Failed to promote user.");
  }
};

const unpromoteUser = async (userId) => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/admin/unpromote`,
      { user_id: userId },
      { withCredentials: true }
    );
    alert("User unpromoted successfully");
    fetchUsers(); // Refresh users
  } catch (error) {
    console.error("There was an error unpromoting the user:", error);
    alert("Failed to unpromote user");
  }
};

  return (
    <div className="admin-page">
      <div className="main-content">
        <header>
          <h1>Admin Panel</h1>
        </header>

        <div className="admin-dashboard">
          <h2>Manage Listings</h2>
          <div className="admin-cards">
            <div
                className="card"
                onClick={handleUsersClick}
                style={{ cursor: "pointer" }}
              >
                <h3>Total Users</h3>
                <p>{usageReports.total_users}</p>
              </div>

            <div className="card">
              <h3>Total Listings</h3>
              <p>{usageReports.total_listings}</p>
            </div>
            <div className="card">
              <h3>Total Claims</h3>
              <p>{usageReports.total_claims}</p>
            </div>
            <div
              className="card"
              onClick={handleReportsClick}
              style={{ cursor: "pointer" }}
            >
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
                    User {db_activity.user_id} : {db_activity.action} at{" "}
                    {db_activity.created_at}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {showUsers && (
            <div
              className="users-list"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "10px",
                marginTop: "20px",
              }}
            >
              <h2>All Users</h2>
              {users.length === 0 ? (
                <p>No users were found</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {users.map((user) => (
                  <li key={user.id} className="user-item">
                    {user.username} ({user.role})
                    {user.role !== "admin" ? (
                      <button
                        onClick={() => promoteUser(user.id)}
                        style={{ marginLeft: '10px' }}
                      >
                        Promote to Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => unpromoteUser(user.id)}
                        style={{ marginLeft: '10px' }}
                      >
                        Unpromote to Student
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>        
          
          {showReports && !selectedReport && (
            <div className="report-box">
              <h2>All Reports</h2>
              {reports.length === 0 ? (
                <p> No reports were found</p>
              ) : (
                <ul className="report-list">
                  {reports.map((report) => (
                    <li
                      key={report.id}
                      className="report-item"
                      onClick={() => setSelectedReport(report)}
                    >
                      <strong>Report #{report.id}</strong> — Listing:{" "}
                      {report.listing_id} —{" "}
                      <span
                        style={{
                          color: report.resolved ? "blue" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {report.resolved ? "Resolved" : "Unresolved"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

         
          {selectedReport && (
            <div className="report-detail-box">
              <h3>Report #{selectedReport.id} Details</h3>
              <p>
                <strong>Listing ID:</strong> {selectedReport.listing_id}
              </p>
              <p>
                <strong>User who made the report:</strong> {selectedReport.reported_by}
              </p>
              <p>
                <strong>Reason for the report:</strong> {selectedReport.reason}
              </p>
              <p>
                <strong>Resolved:</strong>{" "}
                {selectedReport.resolved ? "Yes" : "No"}
              </p>

              {!selectedReport.resolved && (
                <div className="resolve-buttons">
                  <button onClick={() => resolveReport("reject")}>
                    Reject Report
                  </button>
                  <button onClick={() => resolveReport("delete_listing")}>
                    Delete Listing
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
