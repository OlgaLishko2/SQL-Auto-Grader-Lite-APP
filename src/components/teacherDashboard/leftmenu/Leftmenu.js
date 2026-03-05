import React from 'react';
import { NavLink, Link } from 'react-router-dom';


const LeftMenu = () => {
     return (
         <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
             <a className="sidebar-brand d-flex align-items-center justify-content-center" href="#">
               <div className="sidebar-brand-text mx-3">Teacher's Dashboard</div>
            </a>
      
            <hr className="sidebar-divider my-0"/>

            <li className="nav-item active">
                <Link to="/teacher-dashboard" className="nav-link">Dashboard</Link>
            </li>
            <hr className="sidebar-divider"/>
            <div className="sidebar-heading">
                Progress
            </div>
            <li className="nav-item">
                <NavLink className="nav-link" to="/teacher-dashboard/assignment">
                    <i className="fas fa-fw fa-book"></i>
                    <span>Create Assignment</span>
                </NavLink>
             </li>
            <li className="nav-item">
                <a className="nav-link" href="/teacher-dashboard/quizzes">
                    <i className="fas fa-fw fa-question"></i>
                    <span>Create Quiz</span>
                </a>
             </li>
            <li className="nav-item">
                <a className="nav-link" href="#">
                    <i className="fas fa-fw fa-chart-area"></i>
                    <span>Result</span>
                </a>
             </li>
            <hr className="sidebar-divider"/>
            <div className="sidebar-heading">
                Settings
            </div>
            <li className="nav-item">
                <a className="nav-link" href="#">
                    <i className="fas fa-fw fa-toolbox"></i>
                    <span>Profile</span>
                </a>
             </li>
             <li className="nav-item">
                <a className="nav-link" href="#">
                    <i className="fas fa-fw fa-user"></i>
                    <span>Logout</span></a>
            </li>
        </ul>
     )
}

export default LeftMenu