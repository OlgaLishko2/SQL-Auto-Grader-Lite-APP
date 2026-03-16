import { Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";

import "../Dashboard.css";

import LeftMenu from '../leftmenu/LeftMenu';
import TopBar from '../topbar/TopBar';

const studentNavItems = [
  { name: 'Dashboard',   address: '/dashboard',             icon: 'fa-tachometer-alt' },
  { name: 'Assignments', address: '/dashboard/assignments', icon: 'fa-book' },
  { name: 'Quizzes',     address: '/dashboard/quizzes',     icon: 'fa-question' },
  { name: 'Result',      address: '/dashboard/results',     icon: 'fa-chart-area' },
  { name: 'Profile',     address: '/dashboard/profile',     icon: 'fa-user' },
];

const teacherNavItems = [
  { name: 'Dashboard',   address: '/dashboard',             icon: 'fa-tachometer-alt' },
  { name: 'Datasets',    address: '/dashboard/datasets',    icon: 'fa-database' },
  { name: 'Cohorts',     address: '/dashboard/cohorts',     icon: 'fa-users' },
  { name: 'Assignments', address: '/dashboard/assignments', icon: 'fa-book' },
  { name: 'Profile',     address: '/dashboard/profile',     icon: 'fa-user' },
];

const Layout = () => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().fullName);
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserData();
  }, []);

  if (!auth.currentUser) return <Navigate to="/login" />;

  const navItems = userRole === "teacher" ? teacherNavItems : studentNavItems;
  const dashboardName = userRole === "teacher" ? "Teacher Dashboard" : "Student Dashboard";

  return (
    <div id="wrapper">
      <LeftMenu name={dashboardName} navItems={navItems} />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <TopBar name={userName} />
          <div className="container-fluid">
            <Outlet context={{ userRole }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
