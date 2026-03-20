import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import PageTitle from "../../topbar/PageTitle";
import Breadcrumb from "../../topbar/Breadcrumb";

import { auth, db } from "../../../../firebase";
import { useParams } from "react-router-dom";
import { getAllActiveAssignmnetByStudent } from "../../../../components/model/questions";
import LoadingOverlay from "../LoadingOverlay";

const QuestionList = () => {
  const { assignment_id } = useParams();
  //console.log(id);
  const navigate = useNavigate();
  const location = useLocation();
  const dataset = location.state?.dataset;
  const [questiondata, setquestiondata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Get data from question data by assignement id from firebase
    const fetchdata = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        //(assignment_id, user_id)
        const data = await getAllActiveAssignmnetByStudent(
          assignment_id,
          user.uid,
        );
        setquestiondata(data);
        // console.log(data)
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchdata();
  }, []);

  // First letter captial for Question title
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
      name: "Question",
      selector: (row) => row.questionText,
      sortable: true,
      cell: (row) => capitalizeFirstLetter(row.questionText),
    },
    {
      name: "Marks",
      selector: (row) => {
        return row.isSolved ? row.mark : 0;
      },
    },
    {
      name: "Status",
      selector: (row) => "row.status",
      sortable: true,
      cell: (row) => {
        const statusClass = (() => {
          switch (row.status) {
            case "Correct":
              return "bg-success";
            // case "In Progress":
            //   return "bg-warning text-dark";
            case "Incorrect":
              return "bg-warning text-dark";
            case "Not Started":
              return "bg-secondary";
            case "Skipped":
              return "bg-purple text-white";
            case "Answered":
              return "bg-primary";
            default:
              return "bg-light text-dark";
          }
        })();

        return (
          <span className={`badge ${statusClass} btn-status`}>
            {row.status}
          </span>
        );
      },
    },
    {
      name: "Attemption",
      selector: (row) => `${row.attemptTime ?? 0} / ${row.max_attempts ?? 0}`,
    },
    {
      name: "Action",
      cell: (row) => {
        const isAttemptLimitReached = row.attemptTime === row.max_attempts;
        return (
          <button
            className={`btn btn-sm btn-primary ${isAttemptLimitReached ? "disabled" : ""}`}
            onClick={() =>
              navigate(
                `/dashboard/questions/${assignment_id}/question-view/${row.question_id}`,
                { state: { question: row, dataset: dataset } },
              )
            }
          >
            Start
          </button>
        );
      },
    },
  ];

  return (
    <>
      <LoadingOverlay isOpen={isLoading} message="Loading..." />
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <PageTitle pagetitle="Questions List" />
        <Breadcrumb
          items={[
            { label: "Dashboard", link: "/dashboard" },
            { label: "Assignments", link: "/dashboard/assignments" },
            { label: "Questions List", active: true },
          ]}
        />
      </div>

      <div className="card shadow mb-4">
        <div className="card-header">Assignment name</div>
        <DataTable
          columns={columns}
          data={questiondata}
          pagination
          highlightOnHover
          striped
          responsive
          pointerOnHover
          onRowClicked={(row) => {
            if (row.attemptTime >= row.max_attempts) return;
            navigate(
              `/dashboard/questions/${assignment_id}/question-view/${row.question_id}`,
              { state: { question: row, dataset: dataset } },
            );
          }}
        />
      </div>
    </>
  );
};

export default QuestionList;
