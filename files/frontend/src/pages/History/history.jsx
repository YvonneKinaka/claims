import React, { useEffect, useState } from "react";
import "./history.css";
import Sidebar from '../../Components/Sidebar/sidebar';

function History() {
  const [claims, setClaims] = useState([]);
  const [role, setRole] = useState("");
  const [expandedClaims, setExpandedClaims] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      setRole(payload.role);

      const response = await fetch("https://elevana-claims.hf.space/history", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/#/login";
        return;
      }

      const data = await response.json();
      setClaims(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const toggleExpand = (claimId) => {
    setExpandedClaims(prev => ({
      ...prev,
      [claimId]: !prev[claimId]
    }));
  };

  return (
    <div className="history-container">
      <Sidebar role={role}/>

      <h2>Claim History</h2>

      {claims.length > 0 ? (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Expand</th>
                <th>Claim ID</th>
                <th>Client Name</th>
                <th>Manager Decision</th>
                {role !== "client" && <th>AI Prediction</th>}
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <React.Fragment key={claim.id}>
                  <tr>
                    <td>
                      <button
                        className="expand-btn"
                        onClick={() => toggleExpand(claim.id)}
                      >
                        {expandedClaims[claim.id] ? "▲" : "▼"}
                      </button>
                    </td>
                    <td>{claim.id}</td>
                    <td>{claim.client_name}</td>
                    <td>{claim.manager_decision || "Pending"}</td>
                    {role !== "client" && (
                      <td>{claim.prediction === 1 ? "Fraudulent 🚨" : "Legitimate ✅"}</td>
                    )}
                  </tr>
                  {expandedClaims[claim.id] && (
                    <tr>
                      <td colSpan={role !== "client" ? 5 : 4}>
                        <div className="claim-data">
                          {Object.entries(JSON.parse(claim.claim_data)).map(([key, value], idx) => (
                            <p key={idx}><strong>{key}:</strong> {value}</p>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No claims found.</p>
      )}
    </div>
  );
}

export default History;
