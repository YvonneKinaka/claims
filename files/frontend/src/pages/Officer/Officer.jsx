import React, { useEffect, useState } from "react";
import "./officer.css";
import Sidebar from "../../Components/Sidebar/sidebar";

function Officer() {
  const [pendingClaims, setPendingClaims] = useState([]);
  const [expandedClaims, setExpandedClaims] = useState({});
  const [comments, setComments] = useState({});
  const [loadingClaimId, setLoadingClaimId] = useState(null);

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  const fetchPendingClaims = async () => {
    try {
      const token = localStorage.getItem("token"); // Fetch token
      const response = await fetch("https://elevana-claims.hf.space/officer_retrieve", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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
      setPendingClaims(data);
    } catch (error) {
      console.error("Error fetching pending claims:", error);
    }
  };

  const handleReview = async (claimId) => {
    if (!comments[claimId] || comments[claimId].trim() === "") {
      alert("Please add a comment before reviewing!");
      return;
    }

    try {
      setLoadingClaimId(claimId); // Set loading state
      const token = localStorage.getItem("token");
      const response = await fetch("https://elevana-claims.hf.space/officer_review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          claim_id: claimId,
          comments: comments[claimId],
        }),
      });

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/#/login";
        return;
      }

      const data = await response.json();
      //   alert(`Claim reviewed! Fraud prediction: ${data.fraud_prediction === 1 ? "Fraudulent 🚨" : "Legitimate ✅"}`);
      alert(`Claim reviewed! Results Forwarded to Manager ✅`);

      // Clear comment after review
      setComments((prev) => {
        const updated = { ...prev };
        delete updated[claimId];
        return updated;
      });

      fetchPendingClaims(); // Refresh list
    } catch (error) {
      console.error("Error reviewing claim:", error);
    } finally {
      setLoadingClaimId(null); // Stop loading
    }
  };

  const toggleExpand = (claimId) => {
    setExpandedClaims((prev) => ({
      ...prev,
      [claimId]: !prev[claimId],
    }));
  };

  return (
    <>
      <Sidebar role="officer" /> {/* or "officer" / "manager" */}
      <div className="officer-container">
        <h2>Claims Officer Dashboard</h2>

        <div className="claims-section">
          <h3>Pending Claims</h3>
          {pendingClaims.length > 0 ? (
            pendingClaims.map((claim) => (
              <div key={claim.id} className="claim-card">
                <div
                  className="claim-header"
                  onClick={() => toggleExpand(claim.id)}
                >
                  <p>
                    <strong>Claim ID:</strong> {claim.id}
                  </p>
                  <button className="expand-btn">
                    {expandedClaims[claim.id] ? "Collapse ▲" : "Expand ▼"}
                  </button>
                </div>

                {expandedClaims[claim.id] && (
                  <div className="claim-details">
                    {Object.entries(JSON.parse(claim.claim_data)).map(
                      ([key, value], idx) => (
                        <p key={idx}>
                          <strong>{key}:</strong> {value}
                        </p>
                      )
                    )}
                  </div>
                )}
                <textarea
                  placeholder="Enter your comments..."
                  value={comments[claim.id] || ""}
                  onChange={(e) =>
                    setComments({ ...comments, [claim.id]: e.target.value })
                  }
                />
                <button
                  onClick={() => handleReview(claim.id)}
                  disabled={loadingClaimId === claim.id}
                >
                  {loadingClaimId === claim.id
                    ? "Submitting..."
                    : "Submit Review"}
                </button>
              </div>
            ))
          ) : (
            <p>No pending claims available.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Officer;
