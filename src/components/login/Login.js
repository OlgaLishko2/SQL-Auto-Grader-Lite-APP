import React from "react";
import { useNavigate } from "react-router-dom";
import "../register/Register.css"; 

function Login() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to your account</p>

        <form className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
              <span className="forgot-link">Forgot?</span>
            </div>
            <input type="password" placeholder="••••••••" />
          </div>
          <button type="submit" className="auth-btn">Login</button>
        </form>

        <p className="auth-footer">
          Don't have an account? <span onClick={() => navigate("/register")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;