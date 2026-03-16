import DataTable from "react-data-table-component";
import PageTitle from '../../topbar/PageTitle';

/**
 * Column configuration for the Quizzes DataTable
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
    name: "Created Date",
    selector: row => row.cdate,
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

/**
 * Static Quizzes data (temporary)
 * Later this can come from  database
 */
const data = [
  { id: 1, title: "Quizzes1", cdate: "20 Apr,26" , status: "Done" },
  { id: 2, title: "Quizzes2", cdate: "20 Apr,26", status: "Pending" },
  { id: 3, title: "Quizzes3", cdate: "20 Apr,26", status: "Done" },
];

/**
 * Quizzes component
 * Displays Quiz list in a DataTable
 */
const Quizzes = () => {
  return (
    <>
        <PageTitle pagetitle="Quizzes" />
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


export default Quizzes