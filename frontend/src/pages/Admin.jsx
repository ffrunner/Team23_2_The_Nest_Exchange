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
  const [showModal, setShowModal] = useState(false); 

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
      setSelectedReport(null);
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

  const openModal = (report) => {
    setSelectedReport(report);
    setShowModal(true); // Show the modal
  };

  const closeModal = () => {
    setShowModal(false); // Close the modal
    setSelectedReport(null); // Reset the selected report
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
              onClick={handleReportsClick}
              style={{ cursor: "pointer" }}
            >
              <h3>Total Reports</h3>
              <p>{usageReports.total_reports}</p>
            </div>
          </div>

          {showReports && !selectedReport && (
            <div className="report-box">
              <h2>All Reports</h2>
              {reports.length === 0 ? (
                <p>No reports were found</p>
              ) : (
                <ul className="report-list">
                  {reports.map((report) => (
                    <li
                      key={report.id}
                      className="report-item"
                      onClick={() => openModal(report)} // Open modal on click
                    >
                      <strong>Report #{report.id}</strong> — Listing: {report.listing_id} —{" "}
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

          {/* Modal for report details */}
          {showModal && selectedReport && (
            <div className="modal show" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close-btn" onClick={closeModal}>
                  &times;
                </span>
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
                  <strong>Resolved:</strong> {selectedReport.resolved ? "Yes" : "No"}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
