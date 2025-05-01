import React, { useEffect, useState } from "react";
import "./UserProfile.css";

function UserProfile() {
  const [userInfo, setUserInfo] = useState({ username: "", role: "" });
  const [claimStats, setClaimStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchUserInfo = async () => {
      const base64 = token?.split('.')[1];
      const decoded = JSON.parse(atob(base64));
      setUserInfo({ username: decoded.sub, role: decoded.role });
    };

    const fetchStats = async () => {
      try {
        const res = await fetch("https://elevana-claims.hf.space/user_claim_stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setClaimStats(data);
      } catch (err) {
        console.error("Failed to fetch claim stats:", err);
      }
    };

    fetchUserInfo();
    fetchStats();
  }, []);

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-card">
        <p><strong>Username:</strong> {userInfo.username}</p>
        <p><strong>Role:</strong> {userInfo.role}</p>
      </div>

      <div className="claim-stats">
        <h3>Claim Statistics</h3>
        <div className="stat-row">
          <div className="stat-box total">Total: {claimStats.total}</div>
          <div className="stat-box pending">Pending: {claimStats.pending}</div>
          <div className="stat-box approved">Approved: {claimStats.approved}</div>
          <div className="stat-box rejected">Rejected: {claimStats.rejected}</div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
