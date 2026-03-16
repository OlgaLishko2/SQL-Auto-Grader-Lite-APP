import React from 'react';
import { Outlet  } from 'react-router-dom';

import LeftMenu from '../leftmenu/Leftmenu';
import TopBar from '../topbar/TopBar';
import Footer from '../footer/Footer';

const Teacher_Layout = () => {
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
            { <Footer></Footer>}
        </div>
    </div>
    )
}

export default Teacher_Layout
