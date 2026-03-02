import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div className="p-loader">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {userData?.fullName?.charAt(0) || "U"}
          </div>
          <h2>{userData?.fullName || "User Name"}</h2>
          <p className="profile-role">{userData?.role?.toUpperCase()}</p>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <label>Email Address</label>
            <span>{userData?.email}</span>
          </div>
          <div className="info-item">
            <label>Member Since</label>
            <span>{userData?.createdAt?.toDate().toLocaleDateString() || "Recently"}</span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-val">12</span>
            <span className="stat-label">Solved</span>
          </div>
          <div className="stat-box">
            <span className="stat-val">85%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;