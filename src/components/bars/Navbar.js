import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import "../../App.css"

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = auth.currentUser;

  const handleLogout = () => {
    signOut(auth).then(() => { window.location.href = "/"; });
  };

  return (
    <nav className="navbar" style={{zIndex:1000}}>
      <div className="nav-container">
        <Link to="/" className="logo">🌐 SQL Practice Platform</Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <div className={`nav-links ${menuOpen ? "open" : ""}`} >
          <Link to="/" className="nav-item" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className="nav-item" onClick={() => setMenuOpen(false)}>About</Link>
          {user && <Link to="/dashboard" className="nav-item" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {user ? (
            <button onClick={handleLogout} className="logout-button">Logout</button>
          ) : (
            <Link to="/login" className="login-button">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
