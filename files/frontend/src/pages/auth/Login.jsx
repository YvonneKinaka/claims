import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://elevana-claims.hf.space/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);

        // Decode token to find role
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        const userRole = payload.role;

        if (userRole === "client") {
          navigate("/user-dashboard");
        } else if (userRole === "officer") {
          navigate("/officer-dashboard");
        } else if (userRole === "manager") {
          navigate("/manager-dashboard");
        }
      } else {
        const data = await response.json();
        setMessage(`Login failed: ${data.detail}`);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage("Login failed.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
      <p>Don't have an account? <a href="/claims/#/register">Register here</a></p>
      <p className="link-text">Just browsing?{" "}
          <span className="form-toggle" onClick={() => navigate("/#/home")}>Go to Home</span>
      </p>

    </div>
  );
}

export default Login;
