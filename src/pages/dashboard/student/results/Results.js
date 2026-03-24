import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "react-data-table-component";
import PageTitle from "../topbar/PageTitle";
import Breadcrumb from "../topbar/Breadcrumb";
import LoadingOverlay from "../LoadingOverlay";

import userSession from "../../../../components/services/UserSession";
import { getAllCompletedAssignmnetByStudent } from "../../../../components/model/studentAssignments";




/**
 * Results component
 * Displays Student result list in a DataTable
 */
const Results = () => {
  const navigate = useNavigate();
  const [submissionsdata, setsubmissionsdata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get data from student assignments table from firebase
    const fetchdata = async () => {
      try {
        const data = await getAllCompletedAssignmnetByStudent(userSession.uid);
        setsubmissionsdata(data);
        //console.log(data)
      } catch (error) {
        console.error("Error:", error);
      } finally {
            setIsLoading(false);
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
    name: "Due Date",
    selector: row => row.dueDate, 
    sortable: true,
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
     <LoadingOverlay isOpen={isLoading} message="Loading..." />
    
      <div className="d-sm-flex align-items-center justify-content-between mb-0">
        <PageTitle pagetitle="Submitted Assignments" />
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Submitted Assignments", active: true },
          ]}
        />
      </div>
        <div className="card shadow mb-4 p-0">
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