import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "react-data-table-component";
import PageTitle from "../topbar/PageTitle";
import Breadcrumb from "../topbar/Breadcrumb";
import LoadingOverlay from "../LoadingOverlay";

import { auth, db } from "../../../../firebase";
import { useParams } from "react-router-dom";
import DatabaseManager from "../../teacher/datasets/DatabaseManager";
import userSession from "../../../../components/services/UserSession";

import { getAssignmentWithStudentAttempts } from "../../../../components/model/questionAttempts";


const SubmittedQuestions = () => {
  const { assignment_id } = useParams();
  const [open, setOpen] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [assignment, setAssignment] = useState([]);
 
   //Get all questions
    useEffect(() => {
        const fetchdata = async () => {
        try {
          const data = await getAssignmentWithStudentAttempts(
              assignment_id, userSession.uid
            );
            //console.log(sdata)
            setAssignment(data);
          } catch (error) {
            console.error("Error:", error);
          } finally {
            setIsLoading(false);
          }
        };

        fetchdata();
      }, []);

  // Total marks
    const totalMarks = assignment?.questions?.reduce(
      (sum, q) => sum + (q.attempts?.[0]?.is_correct ? q.mark : 0),
      0
    );

  //Optain marks
  const maxMarks = assignment?.questions?.reduce(
    (sum, q) => sum + q.mark,
    0
  );
  
    return (
    <>
          <LoadingOverlay isOpen={isLoading} message="Loading..." />
         <div className="d-sm-flex align-items-center justify-content-between mb-0">
            <PageTitle pagetitle="Submitted Questions" />
            <Breadcrumb
              items={[
                { label: "Dashboard", path: "/dashboard" },
                { label: "Submitted Assignments", path: "/dashboard/results" },
                { label: "Submitted Questions", active: true },
              ]}
            />
          </div>
          <hr></hr>
            <div className="text-center mb-4">
                 <h3>{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <p>
                    <strong>Due Date:</strong> {assignment.dueDate} <br></br>
                     <strong>Total Marks:</strong>  {totalMarks} / {maxMarks}
                  </p>
             </div>
        {assignment?.questions?.length > 0 ? (    
            assignment.questions.map((que, index) => (
            <div className="card shadow mb-4 p-0 text-left"  key={index}>
              <div
                  className={`d-block card-header py-3 ${
                      open === index ? "" : "collapsed"
                    }`}
                  data-toggle="collapse"
                  onClick={() => setOpen(open === index ? null : index)}
                  style={{ cursor: "pointer" }}
                >
                  <h6 className="m-0 font-weight-bold text-primary">
                      Question {index + 1} : {que.questionText}
                  </h6>
              </div>

              
             {open === index && (
                <div className="card-body ">
                    {que.attempts.length > 0 ? (
                        que.attempts.map((attempt, j) => (
                          <div key={j}>
                              <p><strong>Your Answer:</strong> {attempt.submitted_sql}</p>
                              <hr/>
                              <p className="d-flex align-items-center justify-content-between flex-wrap mb-0">

                                  {/* question status */}
                                  <span>
                                    <span
                                      className={`badge ${
                                        attempt.is_correct ? "badge-success" : "badge-danger"
                                      }`}
                                    >
                                      {attempt.is_correct ? " Correct" : "Incorrect"}
                                    </span>
                                  </span>

                                  {/* marks and attempts */}
                                  <span className="text-muted small">
                                    Marks: <strong> 
                                       {attempt.is_correct ? `${que.mark}/${que.mark}` : `0/${que.mark}`}
                                       </strong>
                                  </span>

                                </p> 
                          </div>
                        ))
                      ) : (
                        <p>No attempts</p>
                      )}
                    
                </div>
              )}
          </div>
          ))
          ) : (
          <p>Loading questions...</p>
        )
        }
      </>
    );
  };


export default SubmittedQuestions
