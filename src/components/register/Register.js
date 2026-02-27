import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError("");


    try {
     
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const defaultRole = "student";
    

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        fullName: fullName,
        email: email,
        role: defaultRole,
        createdAt: new Date(),
      });

      console.log("Success! Account created.");
      navigate("/student-dashboard");


    } catch (err) {
    setError("This email is already existes. Try logging in.");
    }
  };




  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the SQL Practice Platform</p>

        {error && <p style={{ color: "red", textAlign: "center", fontSize: "14px" }}>{error}</p>}



        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" 
            value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="name@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required />
          </div>


          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
              required />
          </div>
          <button type="submit" className="auth-btn">Sign Up</button>
        </form>

        <p className="auth-footer">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;