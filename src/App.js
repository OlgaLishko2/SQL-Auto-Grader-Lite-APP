import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./components/register/Register";
import Login from "./components/login/Login";

function App() {
  return (
    <Router>
      <div style={{ textAlign: "center", padding: "10px" }}>
        <nav>
          <Link to="/register" style={{ margin: "0 10px" }}>
            Register
          </Link>
          <Link to="/login" style={{ margin: "0 10px" }}>
            Login
          </Link>
        </nav>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<h2>Welcome to SQL Auto-Grader Lite</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
