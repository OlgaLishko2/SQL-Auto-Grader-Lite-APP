import React, { useState } from 'react';
import './TeacherDashboard.css'
import { Outlet  } from 'react-router-dom';
import LeftMenu from './leftmenu/Leftmenu';
const TeacherDashboard = () => {
  return(
        <div id="wrapper">
         { <LeftMenu/> }
          <div id="content-wrapper" className="d-flex flex-column">
            <div id="content">
             {   /* Top bar */}              
             {/*main content area */}
              <div className="container-fluid">
                <Outlet />
              </div>
            </div>
        </div>
    </div>
    )
     
};

export default TeacherDashboard;