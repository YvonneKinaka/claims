import React, { useState } from "react";
import "./auth.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "client",  // default
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://elevana-claims.hf.space/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Registration successful! You can now log in.");
      } else {
        const data = await response.json();
        setMessage(`Registration failed: ${data.detail}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage("Registration failed.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="client">Client</option>
          <option value="officer">Officer</option>
          <option value="manager">Manager</option>
        </select>

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
      <p>Already have an account? <a href="/claims/#/login">Login here</a></p>
      <p className="link-text">Just browsing?{" "}
       <a className="form-toggle" href="/#/home">Go to Home</a>
      </p>
    </div>
  );
}

export default Register;
