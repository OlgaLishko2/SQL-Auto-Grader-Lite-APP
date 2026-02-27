import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/home/Home"; 
import Register from "./components/register/Register";
import Login from "./components/login/Login";
import About from "./components/about/About";

import Layout from "./components/studentdashboard/layout/Layout";

import StudentDashboard from "./components/studentdashboard/dashboard/StudentDashboard";
import Assignments from "./components/studentdashboard/assignments/Assignments";

import "./App.css";
function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">🌐 SQL</Link>
            <div className="nav-links">
              <Link to="/" className="nav-item">Home</Link>
              <Link to="/about" className="nav-item">About</Link>
              <Link to="/login" className="login-button">Login</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student-dashboard" element={<Layout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="assignments" element={<Assignments />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
 </Router>
    
  );
}

export default App;