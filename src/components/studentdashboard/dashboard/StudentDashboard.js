import React from 'react';
import { $ } from 'jquery';

import "../../studentdashboard/Dashboard.css";

import LeftMenu from '../leftmenu/LeftMenu';
import TopBar from '../topbar/TopBar';
import PageTitle from '../topbar/PageTitle';
import CardDashboard from './CardDashboard';
import Assignments from '../assignments/Assignments';

const StudentDashboard = () => {
  return (
    <div>
      <div id="wrapper">
         { <LeftMenu></LeftMenu> }
         {   /* Top bar */}
          <div id="content-wrapper" className="d-flex flex-column">
            <div id="content">
              { <TopBar></TopBar>} 
              {/*main content area */}
              <div className="container-fluid">
                {<PageTitle></PageTitle> }
                {/* Cards */}
                { <CardDashboard></CardDashboard> }
                { <Assignments></Assignments> }
              </div>
            </div>
        </div>
    </div>
   </div>
)}

export default StudentDashboard