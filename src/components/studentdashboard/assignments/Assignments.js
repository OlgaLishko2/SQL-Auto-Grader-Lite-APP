import React from "react";
import DataTable from "react-data-table-component";
import PageTitle from '../topbar/PageTitle';

const columns = [
  {
    name: "Sr no.",
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
  },
    {
    name: "Action",
    selector: row => row.action,
  }
];

const data = [
  { id: 1, title: "Assignment1", adate: "20 Apr,26" , status: "Done" },
  { id: 2, title: "Assignment2", adate: "20 Apr,26", status: "Pending" },
  { id: 3, title: "Assignment3", adate: "20 Apr,26", status: "Done" },
];

const Assignments = () => {
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