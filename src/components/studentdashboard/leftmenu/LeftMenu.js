import React from 'react';

const LeftMenu = () => {
     return (
         <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
             <a className="sidebar-brand d-flex align-items-center justify-content-center" href="#">
                <div className="sidebar-brand-icon rotate-n-15">
                    <i className="fas fa-laugh-wink"></i>
                </div>
                <div className="sidebar-brand-text mx-3">Student Dashboard</div>
            </a>
      
            <hr className="sidebar-divider my-0"/>

            <li className="nav-item active">
                <a className="nav-link" href="index.html">
                    <i className="fas fa-fw fa-tachometer-alt"></i>
                    <span>Dashboard</span></a>
            </li>
            <hr className="sidebar-divider"/>
            <div className="sidebar-heading">
                Progress
            </div>
            <li className="nav-item">
                <a className="nav-link" href="#">
                    <i className="fas fa-fw fa-book"></i>
                    <span>Assignments</span>
                </a>
             </li>
            <li className="nav-item">
                <a className="nav-link" href="#">
                    <i className="fas fa-fw fa-question"></i>
                    <span>Quizzes</span>
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
                Seetings
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