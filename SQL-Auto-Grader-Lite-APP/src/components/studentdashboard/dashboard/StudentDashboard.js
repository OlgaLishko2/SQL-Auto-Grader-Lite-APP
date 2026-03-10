import React from 'react';

import "../../studentdashboard/Dashboard.css";


import PageTitle from '../topbar/PageTitle';
import CardDashboard from './CardDashboard';


const StudentDashboard = () => {
  return (
    <>
       <PageTitle pagetitle="Dashboard" />
       <CardDashboard></CardDashboard>
    </>
  )}   

export default StudentDashboard