import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { auth, db } from "./firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 

import Home from "./components/home/Home"; 
import Register from "./components/register/Register";
import Login from "./components/login/Login";
import About from "./components/about/About";
import Layout from "./components/studentdashboard/layout/Layout";
import StudentDashboard from "./components/studentdashboard/dashboard/StudentDashboard";
import Assignments from "./components/studentdashboard/assignments/Assignments";
import TeacherDashboard from "./components/teacherDashboard/TeacherDashboard";
import AssignmentForm from "./components/teacherDashboard/assignmentform/AssignmentForm";
import Quizzes from "./components/studentdashboard/quizzes/Quizzes";
import Results from "./components/studentdashboard/results/Results";
import AssignmentDetail from "./components/studentdashboard/assignments/AssignmentDetail";
import Profile from "./components/profile/Profile";
import CreateQuestionSet from "./components/teacherDashboard/createquestionset/CreateQuestionSet";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      window.location.href = "/"; 
    });
  };

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">🌐 SQL Practice Platform</Link>
            <div className="nav-links">
              <Link to="/" className="nav-item">Home</Link>
              <Link to="/about" className="nav-item">About</Link>

  
              {user && (
                <Link 
                  to={role === "teacher" ? "/teacher-dashboard" : "/student-dashboard"} 
                  className="nav-item"
                >
                  Dashboard
                </Link>
              )}

              {user ? (
                <button onClick={handleLogout} className="logout-button">Logout</button>
              ) : (
                <Link to="/login" className="login-button">Login</Link>
              )}
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
              <Route path="assignments/:id" element={<AssignmentDetail />} />
              <Route path="quizzes" element={<Quizzes />} /> 
              <Route path="results" element={<Results />} /> 
              <Route path="profile" element={<Profile />} /> 
            </Route>

     

            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher-dashboard/assignment" element={<AssignmentForm />}/>
            <Route path="/teacher-dashboard/assignment-form" element={<CreateQuestionSet />}/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;