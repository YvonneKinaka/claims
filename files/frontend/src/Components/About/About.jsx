import React from "react";
import "./About.css";
import about_img from "../../assets/grab.jpg";

const About = ({ setPlayState }) => {
  return (
    <div className="about">
      <div className="about-left">
        <img src={about_img} alt="" className="about-img" />
      </div>
      <div className="about-right">
        <p></p>
        <p>
        This AI-powered system is designed to detect and classify potentially fraudulent motor insurance 
        claims—helping insurers, officers, and managers make smarter, faster decisions.
        </p>
        <p>
        By analyzing claim data with advanced machine learning models, the tool provides accurate fraud risk assessments 
        in real-time. It empowers claim officers to review efficiently, enables managers to approve with confidence, and 
        ensures clients receive fair and timely responses. 
        </p>
        <p>
          Detect risk early. Decide smarter. Drive trust. 🚗
        </p>
      </div>
    </div>
  );
};

export default About;
