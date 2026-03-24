import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "react-data-table-component";

import Breadcrumb from "../Breadcrumb";


import userSession from "../../../../components/services/UserSession";
import { getAllCompletedAssignmnetByStudent } from "../../../../components/model/studentAssignments";
import { getBestAttemptByUserQuestion } from "../../../../components/model/questionAttempts";




/**
 * Results component
 * Displays Student result list in a DataTable
 */
const Results = () => {
  const navigate = useNavigate();
  const [submissionsdata, setsubmissionsdata] = useState([]);

  useEffect(() => {
    // Get data from student assignments table from firebase
    const fetchdata = async () => {
      try {
        const data = await getAllCompletedAssignmnetByStudent(userSession.uid);
        const withMarks = await Promise.all(data.map(async (a) => {
          const questions = a.questions || [];
          const totalMarks = questions.reduce((s, q) => s + (q.mark || 1), 0);
          const attempts = await Promise.all(questions.map(q => getBestAttemptByUserQuestion(userSession.uid, q.question_id)));
          const oMarks = attempts.reduce((s, att, i) => s + (att?.is_correct ? (questions[i].mark || 1) : 0), 0);
          return { ...a, totalMarks, oMarks, percentage: totalMarks ? Math.round((oMarks / totalMarks) * 100) + "%" : "0%" };
        }));
        setsubmissionsdata(withMarks);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchdata();
  }, []);

/**
 * Column configuration for the Results DataTable
 * Each object represents one column in the table
 */
const columns = [
  {
    name: "Sr no.",
   selector: (row, index) => index + 1,
    sortable: true,
  },
  {
    name: "Title",
    selector: row => row.title,
    sortable: true,
    cell: (row) => capitalizeFirstLetter(row.title),
  },
   {
    name: "Marks Obtained / Total Marks",
    selector: row => `${row.oMarks} / ${row.totalMarks}`, 
    sortable: true,
  },
 {
    name: "Percentage",
    selector: row => row.percentage,
  },
  
  {
    name: "Action",
    cell: (row) => (
    <button
      className="btn btn-primary btn-sm"
       style={{ borderRadius: "4px", fontSize: "12px" }}
            onClick={() =>
              navigate(`/dashboard/results/${row.assignment_id}`)
            }
    >
      View Detail
    </button>
  ),
  }
];

  // First letter captial for Assignments title
  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };



  return (
    <>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h2>Submitted Assignments</h2>
        <Breadcrumb
          items={[
            { label: "Dashboard", link: "/dashboard" },
            { label: "Submitted Assignments", active: true },
          ]}
        />
      </div>
        <div className="card shadow mb-4">
            <DataTable
            columns={columns}
            data={submissionsdata}
            pagination
            highlightOnHover
            striped
            responsive
            />
        </div>
     </>
  );
};


export default Results