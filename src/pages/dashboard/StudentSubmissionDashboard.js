import React, { useEffect, useState } from "react";
import {useNavigate } from "react-router-dom";

import userSession from "../../components/services/UserSession";
import { getAllCompletedAssignmnetByStudent } from "../../components/model/studentAssignments";
import { getBestAttemptByUserQuestion } from "../../components/model/questionAttempts";

import LoadingOverlay from './student/LoadingOverlay';


const StudentSubmissionDashboard = () => {
    const [submissionsdata, setsubmissionsdata] = useState([]);

  useEffect(() => {
    // Get data from student assignments table from firebase
    const fetchdata = async () => {
      try {
        const data = await getAllCompletedAssignmnetByStudent(userSession.uid);
        const withMarks = await Promise.all(data.map(async (a) => {
          const questions = a.questions || [];
          const totalMarks = questions.reduce((s, q) => s + (Number(q.mark) || 1), 0);
          const attempts = await Promise.all(questions.map(q => getBestAttemptByUserQuestion(userSession.uid, q.question_id)));
          const oMarks = attempts.reduce((s, att, i) => s + (att?.is_correct ? (Number(questions[i].mark) || 1) : 0), 0);
          return { ...a, totalMarks, oMarks, percentage: totalMarks ? Math.round((oMarks / totalMarks) * 100) + "%" : "0%" };
        }));
        setsubmissionsdata(withMarks);
        //console.log(withMarks)
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchdata();
  }, []);


  return(
    <>
        <div className="row">
  <div className="col-lg-12 mb-4">
    <div className="card shadow mb-4">

      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">
          Five Recent Assignment Score
        </h6>
      </div>

      <div className="card-body">
        {submissionsdata.slice(0, 5).map((item, index) => {
          const percent = parseInt(item.percentage) || 0;

          // Optional color logic
          const getColor = (p) => {
            if (p < 30) return "danger";
            if (p < 60) return "warning";
            if (p < 90) return "info";
            return "success";
          };

          const color = getColor(percent);

          return (
            <div key={item.assignment_id || index}>
              
              <h4 className="small font-weight-bold">
                {item.title || `Assignment ${index + 1}`}{" "}
                <span className="float-right">
                  {item.oMarks} / {item.totalMarks} {percent === 100 ? "— Complete!" : `(${percent}%)`}
                </span>
              </h4>

              <div className="progress mb-4">
                <div
                  className={`progress-bar bg-${color}`}
                  role="progressbar"
                  style={{ width: `${percent}%` }}
                  aria-valuenow={percent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  </div>
</div>
  </>
  )
};

export default StudentSubmissionDashboard;