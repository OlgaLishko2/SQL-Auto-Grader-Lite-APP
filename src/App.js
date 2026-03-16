import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Home from "./pages/home/Home";
import Register from "./pages/register/Register";
import Login from "./pages/login/Login";
import About from "./pages/about/About";
import Footer from "./components/bars/Footer";

import Layout from "./pages/dashboard/layout/Layout";
import Dashboard from "./pages/dashboard/Dashboard";
// student
import Assignments from "./pages/dashboard/student/assignments/Assignments";
import Quizzes from "./pages/dashboard/student/quizzes/Quizzes";
import Results from "./pages/dashboard/student/results/Results";
import AntiCheatingAssignmentDetail from "./pages/dashboard/student/assignments/AntiCheatingAssignmentDetail";
// teacher
import DatabaseLoader from "./pages/dashboard/teacher/datasets/dbLoader"
import Profile from "./pages/profile/Profile";

import "./App.css";
import NavBar from "./components/bars/Navbar";

function App() {
  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  const ProtectedRoute = ({ children }) => {
    if (!role) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Router>
      <div className="app-wrapper">
        <NavBar/>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />


            <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard role={role}/>} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="assignments/:id" element={<AntiCheatingAssignmentDetail />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="results" element={<Results />} />

              {/* <Route path="datasets" element={<Datasets />} /> */}
              <Route path="datasets" element={<DatabaseLoader />} />
              <Route path="profile" element={<Profile />} />
            </Route>



            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;