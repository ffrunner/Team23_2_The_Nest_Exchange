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

  const handleReportsClick = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/reports`,
        { withCredentials: true }
      );
      setReports(response.data.reports);
      setShowReports(true);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

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

      // Update the resolved state locally
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id ? { ...r, resolved: true } : r
        )
      );
      setSelectedReport((prev) => ({ ...prev, resolved: true }));
    } catch (error) {
      console.error("Error resolving report:", error);
      alert("Failed to resolve report");
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
            <div className="card">
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
              <small>Click to view</small>
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

          {/* Report List */}
          {showReports && (
            <div className="reports-section">
              <h2>All Reports</h2>
              {reports.length === 0 ? (
                <p>No reports available.</p>
              ) : (
                <ul>
                  {reports.map((report) => (
                    <li
                      key={report.id}
                      style={{ cursor: "pointer", padding: "5px 0" }}
                      onClick={() => setSelectedReport(report)}
                    >
                      Report #{report.id} - Listing ID: {report.listing_id} - Resolved:{" "}
                      {report.resolved ? "Yes" : "No"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Selected Report Detail */}
          {selectedReport && (
            <div className="report-detail">
              <h3>Report #{selectedReport.id} Details</h3>
              <p>
                <strong>Listing ID:</strong> {selectedReport.listing_id}
              </p>
              <p>
                <strong>User ID:</strong> {selectedReport.user_id}
              </p>
              <p>
                <strong>Reason:</strong> {selectedReport.reason}
              </p>
              <p>
                <strong>Resolved:</strong>{" "}
                {selectedReport.resolved ? "Yes" : "No"}
              </p>

              {!selectedReport.resolved && (
                <div className="resolve-buttons">
                  <button onClick={() => resolveReport("reject")}>
                    Reject
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
