// src/components/register/Register.js
import React from "react";
import "./Register.css";

function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login or / Registertion</h2>
        
        <form className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Email" />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Password" />
            <span className="forgot-link">Forgot password?</span>
          </div>

          <button className="main-submit-btn">Login</button>
        </form>

        <div className="or-divider">or</div>

        <div className="social-links">
          <button className="soc-btn google">Continue with Google</button>
          <button className="soc-btn github">Continue with GitHub</button>
        </div>

        <p className="switch-auth">New user? <a href="/login">Sign up here</a></p>
      </div>
    </div>
  );
}

export default Register;