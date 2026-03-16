import DataTable from "react-data-table-component";
import PageTitle from '../../topbar/PageTitle';

/**
 * Column configuration for the Results DataTable
 * Each object represents one column in the table
 */
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
    name: "Marks Obtained / Total Marks",
    selector: row => `${row.oMarks} / ${row.totalMarks}`, 
    sortable: true,
  },
 {
    name: "Percentage",
    selector: row => row.percentage,
  },
   {
    name: "Result",
    cell: row => (
      <span
        style={{
          color: row.results === "Fail" ? "red" : "green",
          fontWeight: "bold",
        }}
      >
        {row.results}
      </span>
    ),
     sortable: true,
  },
 {
    name: "Submission Date",
    selector: row => row.cdate,
  },
  {
    name: "Status",
    selector: row => row.status,
  }
];

/**
 * Static Results data (temporary)
 * Later this can come from  database
 */
const data = [
  {
    id: 1,
    title: "Assignment 1",
    oMarks: 18,          
    totalMarks: 20,       
    percentage: "90%",    
    results: "Pass",      
    cdate: "2026-03-01", 
    status: "Submitted", 
  },
  {
    id: 2,
    title: "Assignment 2",
    oMarks: 12,
    totalMarks: 20,
    percentage: "60%",
    results: "Pass",
    cdate: "2026-03-02",
    status: "Pending",
  },
  {
    id: 3,
    title: "Assignment 3",
    oMarks: 7,
    totalMarks: 20,
    percentage: "35%",
    results: "Fail",
    cdate: "2026-03-03",
    status: "Submitted",
  },
  {
    id: 4,
    title: "Quiz 1",
    oMarks: 15,
    totalMarks: 15,
    percentage: "100%",
    results: "Pass",
    cdate: "2026-03-04",
    status: "Submitted",
  },
];

//red and green row border
const conditionalRowStyles = [
  {
    when: row => row.results === "Fail",
    style: {
      borderLeft: "2px solid red",
      borderRadius: "5px",
    },
  },
  {
    when: row => row.results === "Pass",
    style: {
      borderLeft: "2px solid green",
      borderRadius: "5px",
    },
  },
];
/**
 * Results component
 * Displays Student result list in a DataTable
 */
const Results = () => {
  return (
    <>
        <PageTitle pagetitle="Results" />
        <div className="card shadow mb-4">
            <DataTable
            columns={columns}
            data={data}
            pagination
            highlightOnHover
            striped
            responsive
            conditionalRowStyles={conditionalRowStyles} 
            />
        </div>
     </>
  );
};


export default Results