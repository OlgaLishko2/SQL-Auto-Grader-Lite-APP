import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import PageTitle from "../topbar/PageTitle";
import Breadcrumb from "../topbar/Breadcrumb";

import userSession from "../../../../services/UserSession";
import { useParams } from "react-router-dom";
import { getAllActiveAssignmnetByStudent } from "../../../../components/model/questions";
import LoadingOverlay from "../LoadingOverlay";
import { updateStudentAssignment } from "../../../../components/model/studentAssignments";

const QuestionList = () => {
  const { assignment_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const assignment = location.state?.assignment;
  const questions = assignment?.questions;
  const dataset = assignment?.dataset;
  const [questiondata, setquestiondata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Get data from question data by assignement id from firebase
    const fetchdata = async () => {
      try {
        const data = await getAllActiveAssignmnetByStudent(
          questions,
          userSession.uid,
        );
        setquestiondata(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchdata();
  }, []);

  async function markComplele() {
    const assignmentId = assignment?.assignment_id;
    if (!assignmentId) return;
    await updateStudentAssignment({
      student_user_id: userSession.uid,
      assignment_id: assignmentId,
      status: "completed",
    });
    navigate("/dashboard/assignments");
  }

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
      selector: (row) => `${row.attemptTime ?? 0} / 1`,
    },
    {
      name: "Action",
      cell: (row) => {
        const isAttemptLimitReached = row.attemptTime === 1;
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
      <div className="d-sm-flex justify-content-between align-items-center mb-0 al">
        <PageTitle pagetitle="Questions List" />
        <Breadcrumb
          items={[
            { label: "Dashboard", link: "/dashboard" },
            { label: "Assignments", link: "/dashboard/assignments" },
            { label: "Questions List", active: true },
          ]}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "12px",
        }}
      >
        <button
          style={{
            backgroundColor: "#28A745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.2,
            cursor: "pointer",
          }}
          onClick={markComplele}
        >
          Mark as completed
        </button>
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
            const isAttemptLimitReached = row.attemptTime >= 1;
            if (!isAttemptLimitReached) {
              navigate(
                `/dashboard/questions/${assignment_id}/question-view/${row.question_id}`,
                { state: { question: row, dataset: dataset } },
              );
            }
          }}
        />
      </div>
    </>
  );
};

export default QuestionList;
