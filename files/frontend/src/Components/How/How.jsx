import React from "react";
import "./How.css";
import step1 from "../../assets/step1.png";
import step2 from "../../assets/step2.png";
import step3 from "../../assets/step3.png";
import { Link } from "react-router-dom";

const How = () => {
  return (
    <div className="how-it-works">
      <div className="steps">
        <div className="step">
          <Link to="/login">
            <img src={step1} alt="Step 1" />
            <h3>Client Portal</h3>
            <p>
              Submit and track claims with real-time status updates and communication tools
            </p>
          </Link>
        </div>

        <div className="step">
          <Link to="/login">
            <img src={step2} alt="Step 2" />
            <h3>Claims Processing</h3>
            <p>
              Efficient claim processing with notification and atomated workflow
            </p>
          </Link>
        </div>

        <div className="step">
          <Link to="/login">
            <img src={step3} alt="Step 3" />
            <h3>Fraud Detection</h3>
            <p>
              Advanced AI -powered fraud detection with human oversight for accuracy
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default How;
