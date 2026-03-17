import React, { useEffect, useState } from "react";
import {useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import PageTitle from '../../topbar/PageTitle';
import Breadcrumb from "../../topbar/Breadcrumb";

import { auth, db  } from "../../../../firebase";
import { useParams } from "react-router-dom";
import DatabaseManager from "../../teacher/datasets/DatabaseManager";
import { getAllQuestionByAssignment } from "../../../../components/model/questions";

const QuestionList =  () => {
  const { assignment_id } = useParams();
   //console.log(id);
  const navigate = useNavigate();
  const [questiondata, setquestiondata] = useState([]);

  useEffect(() => {

  // Get data from question data by assignement id from firebase
  const fetchdata = async () =>{
    try{
     
        // const user = auth.currentUser;
        // if (!user) return;
     
        const data = await getAllQuestionByAssignment(assignment_id);
        setquestiondata(data);
      // console.log(data)
    }
    catch(error){
      console.error("Error:", error);
    }
  }

 fetchdata();
}, []);
 
// First letter captial for Assignments title
  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };


  const columns = [
  {
    name: "S.No",
    selector:  (row, index) => index + 1,
    sortable: true,
  },
  {
    name: "Question",
    selector: row => row.questionText,
    sortable: true,
    cell: row => capitalizeFirstLetter(row.questionText),
  },
 {
    name: "Marks",
    selector: row => row.dueDate,
  },
 {
    name: 'Status',
    selector: row => "row.status",
    sortable: true,
    cell: row => {
      const statusClass = (() => {
        switch(row.status) {
          case 'Completed':
          case 'Done':
            return 'bg-success';            
          case 'In Progress':
            return 'bg-warning text-dark'; 
          case 'Not Started':
            return 'bg-secondary';          
          case 'Skipped':
            return 'bg-purple text-white';  
          case 'Answered':
            return 'bg-primary';          
          default:
            return 'bg-light text-dark';     
        }
      })();

      return (
        <span className={`badge ${statusClass} btn-status`} >
          {row.status}
        </span>
      );
    }
  },
  {
    name: 'Action',
    cell: row => (
      <button
        className="btn btn-sm btn-primary"
        onClick={() => navigate(`/dashboard/questions/${assignment_id}/question-view/${row.question_id}`)}
      >
        View
      </button>
    )
  }
];



  return (
    <>
      <div className="d-sm-flex justify-content-between mb-4">
        <PageTitle pagetitle="Questions List" />
        <Breadcrumb
          items={[
            { label: "Dashboard", link: "/dashboard" },
            { label: "Assignments", link: "/dashboard/assignments" },
            { label: "Questions List", active: true },
          ]} />
      </div>
   
        <div className="card shadow mb-4">
             <div class="card-header">
               Assignment name
             </div>        
            <DataTable
            columns={columns}
            data={questiondata}
            pagination
            highlightOnHover
            striped
            responsive
            pointerOnHover       
            onRowClicked={row => window.open(`/dashboard/questions/${assignment_id}/question-view/${row.question_id}`)}
        />
        </div>
     </>
  );
};


export default QuestionList