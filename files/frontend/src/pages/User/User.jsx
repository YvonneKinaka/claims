import React, { useState, useEffect } from "react";
import "./user.css";
import Sidebar from "../../Components/Sidebar/sidebar";
import UserProfile from "../../Components/UserProfile/UserProfile";

function UserForm() {
  const [totalClaims, setTotalClaims] = useState(0);
  const [pending, setPending] = useState(0);
  const [approved, setApproved] = useState(0);
  const [rejected, setRejected] = useState(0);

  const [formData, setFormData] = useState({
    months_as_customer: "",
    age: "",
    time_difference: "",
    claim_type: "",
    total_claim_amount: "",
    insured_sex: "",
    insured_education_level: "",
    policy_annual_premium: "",
    umbrella_limit: "",
    vehicle_claim: "",
    time_since_policy_activation: "",
    claim_frequency: "",
    claim_size_ratio: "",
    claim_type_frequency: "",
    average_claim_amount_last_12_months: "",
    claim_flag: "",
    policy_bind_year: "",
    policy_bind_month: "",
    policy_bind_day: "",
    policy_bind_dayofweek: "",
    policy_bind_is_weekend: "",
    policy_bind_quarter: "",
    incident_year: "",
    incident_month: "",
    incident_day: "",
    incident_dayofweek: "",
    incident_is_weekend: "",
    incident_quarter: "",
    days_between_policy_and_incident: "",
  });

  const resetForm = () => {
    setFormData({
      months_as_customer: "",
      age: "",
      time_difference: "",
      claim_type: "",
      total_claim_amount: "",
      insured_sex: "",
      insured_education_level: "",
      policy_annual_premium: "",
      umbrella_limit: "",
      vehicle_claim: "",
      time_since_policy_activation: "",
      claim_frequency: "",
      claim_size_ratio: "",
      claim_type_frequency: "",
      average_claim_amount_last_12_months: "",
      claim_flag: "",
      policy_bind_year: "",
      policy_bind_month: "",
      policy_bind_day: "",
      policy_bind_dayofweek: "",
      policy_bind_is_weekend: "",
      policy_bind_quarter: "",
      incident_year: "",
      incident_month: "",
      incident_day: "",
      incident_dayofweek: "",
      incident_is_weekend: "",
      incident_quarter: "",
      days_between_policy_and_incident: "",
      client_name: "", // don't forget this
    });
  };

  const [submissionStatus, setSubmissionStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You must be logged in to submit a claim.");
        return;
      }
      const safeData = {
        client_name:
          formData.client_name.trim() !== "" ? formData.client_name : "Unknown",
      };

      Object.keys(formData).forEach((key) => {
        if (key !== "client_name") {
          const value = formData[key];
          safeData[key] = value.trim() !== "" ? parseFloat(value) : 0;
        }
      });

      const response = await fetch(
        "https://elevana-claims.hf.space/submit_claim",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(safeData),
        }
      );

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/#/login";
        return;
      }

      if (response.ok) {
        setSubmissionStatus("Claim submitted successfully! Awaiting approval.");
        resetForm();
      } else {
        setSubmissionStatus("Failed to submit claim. Please try again.");
      }
    } catch (error) {
      console.error("Error during claim submission:", error);
      setSubmissionStatus("Failed to submit claim. Please try again.");
    }
  };
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://elevana-claims.hf.space/user_claim_stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setTotalClaims(data.total);
      setPending(data.pending);
      setApproved(data.approved);
      setRejected(data.rejected);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <>
      <Sidebar role="client" />
  
      <div className="page-wrapper">
        {/* Dashboard Section */}
        {/* <div className="welcome-banner">
          Welcome, {formData.client_name || "Client"} 👋
        </div>
         */}


        <div className="dashboard-header">
          <h2>Motor Insurance Dashboard</h2>
          <div className="dashboard-cards">
            <div className="stat-card"><h4>Total</h4><p>{totalClaims}</p></div>
            <div className="stat-card pending"><h4>Pending</h4><p>{pending}</p></div>
            <div className="stat-card approved"><h4>Approved</h4><p>{approved}</p></div>
            <div className="stat-card rejected"><h4>Rejected</h4><p>{rejected}</p></div>
          </div>
        </div>
        
  
        {/* Claim Form Section */}
        <div className="user-form">
          <h2>Submit a New Claim</h2>
  
          <form onSubmit={handleSubmit}>
            {/* Client Name at top */}
            <div className="client-name-section">
              <input
                type="text"
                name="client_name"
                id="client_name"
                placeholder="Enter client name"
                value={formData.client_name}
                onChange={handleChange}
                className="client-name-input"
                required
              />
            </div>
  
            {/* Other fields */}
            <div className="form-grid">
              {Object.keys(formData)
                .filter((field) => field !== "client_name")
                .map((field, index) => (
                  <div key={index}>
                    <label>{field.replace(/_/g, " ")}</label>
  
                    {field === "claim_type" ? (
                      <select name={field} value={formData[field]} onChange={handleChange}>
                        <option value="">Select Claim Type</option>
                        <option value="0">Vehicle Claim</option>
                        <option value="1">Property Claim</option>
                        <option value="2">Injury Claim</option>
                      </select>
                    ) : field === "insured_sex" ? (
                      <select name={field} value={formData[field]} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="0">Female</option>
                        <option value="1">Male</option>
                      </select>
                    ) : field === "insured_education_level" ? (
                      <select name={field} value={formData[field]} onChange={handleChange}>
                        <option value="">Select Education</option>
                        <option value="0">High School</option>
                        <option value="1">College</option>
                        <option value="2">Bachelors</option>
                        <option value="3">Masters</option>
                        <option value="4">PhD</option>
                      </select>
                    ) : field === "policy_bind_dayofweek" || field === "incident_dayofweek" ? (
                      <select name={field} value={formData[field]} onChange={handleChange}>
                        <option value="">Select Day of Week</option>
                        <option value="0">Monday</option>
                        <option value="1">Tuesday</option>
                        <option value="2">Wednesday</option>
                        <option value="3">Thursday</option>
                        <option value="4">Friday</option>
                        <option value="5">Saturday</option>
                        <option value="6">Sunday</option>
                      </select>
                    ) : field === "policy_bind_is_weekend" || field === "incident_is_weekend" ? (
                      <select name={field} value={formData[field]} onChange={handleChange}>
                        <option value="">Is Weekend?</option>
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    ) : field === "policy_bind_quarter" || field === "incident_quarter" ? (
                      <select name={field} value={formData[field]} onChange={handleChange}>
                        <option value="">Select Quarter</option>
                        <option value="1">Q1</option>
                        <option value="2">Q2</option>
                        <option value="3">Q3</option>
                        <option value="4">Q4</option>
                      </select>
                    ) : (
                      <input
                        type="number"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                ))}
            </div>
  
            <button type="submit" className="submit-btn">Submit Claim for Review</button>
          </form>
  
          {submissionStatus && (
            <div style={{ marginTop: "20px", textAlign: "center", color: "green" }}>
              <h3>{submissionStatus}</h3>
            </div>
            
          )}
          
        </div>
        <UserProfile />

      </div>
    </>
  );
  
}

export default UserForm;
