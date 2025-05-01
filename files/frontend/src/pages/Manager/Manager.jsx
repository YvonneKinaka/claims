import React, { useEffect, useState } from "react";
import "./manager.css";
import Sidebar from '../../Components/Sidebar/sidebar';

function Manager() {
  const [claims, setClaims] = useState([]);
  const [expandedClaims, setExpandedClaims] = useState({});

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem("token"); // GET token from storage
  
      const response = await fetch("https://elevana-claims.hf.space/manager_retrieve", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }      
  
      const data = await response.json();
      setClaims(data);
    } catch (error) {
      console.error("Error fetching claims:", error);
    }
  };
  
  const handleDecision = async (claimId, decision) => {
    try {
      const token = localStorage.getItem("token"); // GET token here too
  
      const response = await fetch("https://elevana-claims.hf.space/manager_decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          claim_id: claimId,
          decision: decision,
        }),
      });
  
      if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/#/login";
        return;
      }
      
      const data = await response.json();
      alert(`Manager decision recorded: ${decision.toUpperCase()}`);
      fetchClaims(); // Refresh
    } catch (error) {
      console.error("Error submitting manager decision:", error);
    }
  };
  

  const toggleExpand = (claimId) => {
    setExpandedClaims(prev => ({
      ...prev,
      [claimId]: !prev[claimId]
    }));
  };

  return (
    <div className="manager-full">
    <Sidebar role = "manager"/> 
    <div className="manager-container">
      <h2>Manager Dashboard</h2>

      <div className="claims-section">
        {claims.length > 0 ? (
          claims.map((claim) => (
            <div key={claim.id} className="claim-card">
              <div className="claim-header" onClick={() => toggleExpand(claim.id)}>
                <p><strong>Client Name:</strong> {claim.client_name}</p>
                <button className="expand-btn">
                  {expandedClaims[claim.id] ? "Collapse ▲" : "Expand ▼"}
                </button>
              </div>

              <p><strong>Officer Comments:</strong> {claim.claim_officer_comments || "No comments provided"}</p>
              <p><strong>AI Prediction:</strong> {claim.prediction === 1 ? "Fraudulent 🚨" : "Legitimate ✅"}</p>

              {expandedClaims[claim.id] && (
                <div className="claim-details">
                  {Object.entries(JSON.parse(claim.claim_data)).map(([key, value], idx) => (
                    <p key={idx}><strong>{key}:</strong> {value}</p>
                  ))}
                </div>
              )}

              <div className="button-group">
                <button onClick={() => handleDecision(claim.id, "approved")} className="approve-btn">Approve</button>
                <button onClick={() => handleDecision(claim.id, "rejected")} className="reject-btn">Reject</button>
              </div>
            </div>
          ))
        ) : (
          <p>No claims pending for manager decision.</p>
        )}
    </div>
      </div>
    </div>
  );
}

export default Manager;
