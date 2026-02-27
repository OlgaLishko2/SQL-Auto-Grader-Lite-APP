import React from 'react';
import { Outlet  } from 'react-router-dom';

import "../../studentdashboard/Dashboard.css";

import LeftMenu from '../leftmenu/LeftMenu';
import TopBar from '../topbar/TopBar';

const Layout = () => {
    return(
        <div id="wrapper">
         { <LeftMenu></LeftMenu> }
          <div id="content-wrapper" className="d-flex flex-column">
            <div id="content">
             {   /* Top bar */}
              { <TopBar></TopBar>} 
              {/*main content area */}
              <div className="container-fluid">
                <Outlet />
                </div>
            </div>
        </div>
    </div>
    )
}

export default Layout
