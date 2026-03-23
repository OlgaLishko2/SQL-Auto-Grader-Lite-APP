import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/home/Home"; 
import Register from "./components/register/Register";
import Login from "./components/login/Login";
import About from "./components/about/About";
import "./App.css";
import AssignmentDetail from "./pages/dashboard/student/assignments/AntiCheatingQuestionDetail";
import AntiCheatingQuestionDetail from "./pages/dashboard/student/assignments/AntiCheatingQuestionDetail";

function TeacherAssignments() {
  const [creating, setCreating] = useState(false);
  return creating
    ? <AssignmentForm onDone={() => setCreating(false)} />
    : <AssignmentList onCreate={() => setCreating(true)} />;
}
function TeacherQuizzes() {
  const [creating, setCreating] = useState(false);
  return creating
    ? <QuizForm onDone={() => setCreating(false)} />
    : <QuizList onCreate={() => setCreating(true)} />;
}

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