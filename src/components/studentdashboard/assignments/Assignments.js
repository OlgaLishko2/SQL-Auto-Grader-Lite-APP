import React from "react";
import {useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import PageTitle from '../topbar/PageTitle';

const Assignments = () => {
  const navigate = useNavigate();

const columns = [
  {
    name: "No",
    selector: row => row.id,
    sortable: true,
  },
  {
    name: "Title",
    selector: row => row.title,
    sortable: true,
  },
 {
    name: "Assign Date",
    selector: row => row.adate,
  },
  {
    name: "Status",
      selector: row => row.status,
      
      cell: row => (
        <span className={`badge ${
          row.status === 'Completed' || row.status === 'Done' ? 'bg-success' : 
          row.status === 'In Progress' ? 'bg-warning text-dark' : 'bg-primary'
        }`} style={{ color: 'white', padding: '5px 10px', borderRadius: '12px', fontSize: '11px' }}>
          {row.status}
        </span>
      )
    },
    {
 name: "Action",
      button: true, 
      cell: (row) => (
        row.status === "Completed" || row.status === "Done" ? (
          <span className="text-muted" style={{ fontSize: '12px' }}>Review only</span>
        ) : (
          <button 
            className="btn btn-sm btn-primary"
            style={{ borderRadius: '4px', fontSize: '12px' }}
            onClick={() => navigate(`/student-dashboard/assignments/${row.id}`)}
          >
            {row.status === "New" ? "Start Test" : "Continue"}
          </button>
        )
      ),
  }
];

const data = [
  { id: 1, title: "Assignment1", adate: "20 Apr,26" , status: "Completed" },
  { id: 2, title: "Assignment2", adate: "15 Apr,26", status: "In Progress" },
  { id: 3, title: "Assignment3", adate: "10 Apr,26", status: "Done" },
  {id: 4, title: "Assignment3", adate: "4 Apr,26", status: "New" }
];


  return (
    <>
        <PageTitle pagetitle="Assignments" />
        <div className="card shadow mb-4">
            <DataTable
            columns={columns}
            data={data}
            pagination
            highlightOnHover
            striped
            responsive
            />
        </div>
     </>
  );
};


export default Assignments