import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DataTable from "react-data-table-component";
import PageTitle from "../../topbar/PageTitle";
import Breadcrumb from "../../topbar/Breadcrumb";


import { auth, db } from "../../../../firebase";
import { useParams } from "react-router-dom";
import DatabaseManager from "../../teacher/datasets/DatabaseManager";

import { getAllQuestionAndAttempt } from "../../../../components/model/questions";
import { getAssignmentDetailsByAssignmentId }from "../../../../components/model/studentAssignments";

const SubmittedQuestions = () => {
  const { assignment_id } = useParams();
  const [open, setOpen] = useState(0);

  const [assignment, setAssignment] = useState([]);
  const [questions, setQuestions] = useState([]);
 
   //Get all questions
    useEffect(() => {
        const user = auth.currentUser;    
        if (!user) return;

       async function fetchData() {
       const sdata = await getAllQuestionAndAttempt(assignment_id,user.uid);
       const adata = await getAssignmentDetailsByAssignmentId(assignment_id);
      
       // console.log("test",adata)
          setQuestions(sdata);
          setAssignment(adata);
        }

        fetchData();
      }, []);
    return (
    <>
          <div className="d-sm-flex align-items-center justify-content-between mb-4">
            <PageTitle pagetitle="Submitted Questions" />
            <Breadcrumb
              items={[
                { label: "Dashboard", link: "/dashboard" },
                { label: "Submitted Assignments", link: "/dashboard/results" },
                { label: "Submitted Questions", active: true },
              ]}
            />
          </div>
          <hr></hr>
            <div className="text-center mb-4">
                 <h3>{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <p><strong>Due Date:</strong> {assignment.dueDate}</p>
            </div>
          {questions.map((que, index) => (
            <div className="card shadow mb-4"  key={index}>
              <div
                  className={`d-block card-header py-3 $${
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
                <div className="card-body">
                      <p><strong>Your Answer:</strong> {que.answer}</p>
                      <hr/>
                       <p className="d-flex align-items-center justify-content-between flex-wrap mb-0">

                          {/* question status */}
                          <span>
                            <span
                              className={`badge ${
                                que.isSolved ? "badge-success" : "badge-danger"
                              }`}
                            >
                              {que.isSolved ? " Correct" : "Incorrect"}
                            </span>
                          </span>

                          {/* marks and attempts */}
                          <span className="text-muted small">
                            Marks: <strong>{que.mark}</strong>, Attempts:<strong> {que.max_number_of_attempts}/{que.max_attempts}</strong>
                          </span>

                        </p> 
                </div>
              )}
          </div>
          ))
        }
      </>
    );
  };


export default SubmittedQuestions
