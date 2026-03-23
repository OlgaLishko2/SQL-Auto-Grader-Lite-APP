import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (auth.currentUser) {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (snap.exists()) setUserRole(snap.data().role);
      }
    };
    fetchRole();
  }, []);
const handleStart = () => {
  if (!auth.currentUser) {
    navigate("/login");
    return;
  }

  if (userRole === "teacher") {
    navigate("/dashboard");
  } else if (userRole === "student") {
    navigate("/dashboard");
  } else {
    navigate("/login");
  }
};
  return (
    <div className="home-container">
    
    
    
      <section className="hero">
        <h1>SQL Practice Platform</h1>
        <p>Learn SQL interactively in your browser using real datasets.</p>
<button className="start-btn" onClick={handleStart}>
  Start Working
</button>
      </section>

     
      <section className="features">
        <h2>Explore Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">📄</div>
            <h3>Real Datasets</h3>
            <p>Instant access to datasets: Employees, Departments, Customer, Orders.</p>
          </div>
          <div className="feature-card">
            <div className="icon">⌨️</div>
            <h3>Instant Query Execution</h3>
            <p>Real Database deploys right in your browser.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🤖</div>
            <h3>Automatic Grading</h3>
            <p>Get instant feedback on your SQL queries.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;