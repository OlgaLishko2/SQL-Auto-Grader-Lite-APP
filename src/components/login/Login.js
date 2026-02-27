import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "../register/Register.css"; 

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        console.log("User role:", userRole);

     
        
        if (userRole === "teacher") {
          navigate("/teacher-dashboard");
        } else {
          navigate("/student-dashboard");
        }
      } 
    } catch (err) {
    setError("Wrong email or password. Or user does not exist.");
    }
  };




  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        {error && <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{error}</p>}
        <p className="auth-subtitle">Log in to your account</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="name@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required/>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
              <span className="forgot-link">Forgot?</span>
            
            
            </div>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required />
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