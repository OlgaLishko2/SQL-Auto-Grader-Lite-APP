import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import PageTitle from "../../topbar/PageTitle";
import Breadcrumb from "../../topbar/Breadcrumb";

import { auth, db } from "../../../../firebase";
import DatabaseManager from "../../teacher/datasets/DatabaseManager";
// import DatabaseManager from "../../../../db/DatabaseManager";
import { getAllAssignmentByOwner } from "../../../../components/model/assignments";
import { getAllAssignmnetByStudent } from "../../../../components/model/studentAssignments";

const Assignments = () => {
  const navigate = useNavigate();
  const [assignmentsdata, setAssignmentsdata] = useState([]);

  useEffect(() => {
    // Get data from assignments table from firebase
    const fetchdata = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        //console.log(user)

        const data = await getAllAssignmnetByStudent(user.uid);
        setAssignmentsdata(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

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
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      cell: (row) => capitalizeFirstLetter(row.title),
    },
    {
      name: "Due Date",
      selector: (row) => row.dueDate,
    },
    {
      name: "Status",
      selector: (row) => row.status,

      cell: (row) => (
        <span
          className={`badge ${
            row.status === "Completed" || row.status === "Done"
              ? "bg-success"
              : row.status === "In Progress"
                ? "bg-warning text-dark"
                : "bg-primary"
          }`}
          style={{
            color: "white",
            padding: "5px 10px",
            borderRadius: "12px",
            fontSize: "11px",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Action",
      button: true,
      cell: (row) =>
        row.status === "Completed" || row.status === "Done" ? (
          <span className="text-muted" style={{ fontSize: "12px" }}>
            Review only
          </span>
        ) : (
          <button
            className="btn btn-sm btn-primary"
            style={{ borderRadius: "4px", fontSize: "12px" }}
            onClick={() =>
              navigate(`/dashboard/questions/${row.assignment_id}`)
            }
          >
            {row.status === "New" ? "Start Test" : "Continue"}
          </button>
        ),
    },
  ];

  return (
    <>
      <div className="d-sm-flex justify-content-between mb-4">
        <PageTitle pagetitle="Assignments" />
        <Breadcrumb
          items={[
            { label: "Dashboard", link: "/dashboard" },
            { label: "Assignments", active: true },
          ]}
        />
      </div>

      <div className="card shadow mb-4">
        <DataTable
          columns={columns}
          data={assignmentsdata}
          pagination
          highlightOnHover
          striped
          responsive
        />
      </div>
    </>
  );
};

export default Assignments;
