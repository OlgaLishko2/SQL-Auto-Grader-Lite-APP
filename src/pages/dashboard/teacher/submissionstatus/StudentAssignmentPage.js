import { useEffect, useState } from "react";
import { getStudentInfo, getBestAttemptByUserQuestion, overrideAttemptMark } from "../../../../components/model/questionAttempts";
import { getAssignmentDetailsByAssignmentId } from "../../../../components/model/studentAssignments";
import "./Submission.css";

export default function StudentAssignmentPage({ studentId, assignmentId, assignmentTitle, onBack }) {
  const [student, setStudent] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!studentId || !assignmentId) return;
    const load = async () => {
      const [userData, assignment] = await Promise.all([
        getStudentInfo(studentId),
        getAssignmentDetailsByAssignmentId(assignmentId),
      ]);
      setStudent(userData);
      
      const qs = await Promise.all(
        (assignment?.questions || []).map(async (q, i) => {
          const attempt = await getBestAttemptByUserQuestion(studentId, q.question_id);
          return {
            index: i + 1,
            question_id: q.question_id,
            questionText: q.questionText,
            expectedAnswer: q.answer,
            mark: q.mark || 1,
            attempt_id: attempt?.attempt_id || null,
            submittedSql: attempt?.submitted_sql || "-",
            isCorrect: attempt?.is_correct || false,
            earnedMark: attempt?.is_correct ? (q.mark || 1) : 0,
          };
        })
      );
      setQuestions(qs);
    };
    load();
  }, [studentId, assignmentId]);

  const toggleMark = async (index, currentIsCorrect, attempt_id, mark) => {
    if (!attempt_id) return;
    const newIsCorrect = !currentIsCorrect;
    await overrideAttemptMark(attempt_id, newIsCorrect);
    setQuestions(prev => prev.map((q, i) => i === index
      ? { ...q, isCorrect: newIsCorrect, earnedMark: newIsCorrect ? mark : 0 }
      : q
    ));
  };

  const totalEarned = questions.reduce((s, q) => s + q.earnedMark, 0);
  const totalMark = questions.reduce((s, q) => s + q.mark, 0);

  return (
    <div className="container-fluid student-assignment-page">

      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-sm btn-outline-secondary shadow-sm mr-3" onClick={onBack}>
          <i className="fas fa-arrow-left fa-sm"></i> Back
        </button>
        <h1 className="h3 mb-0 text-dashboard-title">{assignmentTitle || "Assignment Review"}</h1>
      </div>

      <div className="row">
      
        <div className="col-lg-4 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Student</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{student?.fullName || "Loading..."}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-user fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="col-lg-4 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">Total Score</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{totalEarned} / {totalMark}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-poll fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="row">
        <div className="col-lg-12">
          {questions.map((q, i) => (
            <div key={q.question_id} className="card shadow mb-4">
              <div className="card-header py-3 d-flex justify-content-between align-items-center bg-light">
                <h6 className="m-0 font-weight-bold text-primary">Question {q.index}</h6>
                <span className={`badge ${q.isCorrect ? "badge-success" : "badge-danger"}`}>
                  {q.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              <div className="card-body">
                <p className="font-weight-bold mb-1 text-gray-800">Problem:</p>
                <p className="text-gray-600 mb-3">{q.questionText}</p>

                <div className="row">
                  <div className="col-md-6">
                    <label className="small font-weight-bold text-success">Expected SQL:</label>
                    <pre className="bg-light p-3 rounded border-left-success code-block">{q.expectedAnswer}</pre>
                  </div>
                  <div className="col-md-6">
                    <label className="small font-weight-bold text-gray-700">Student's SQL:</label>
                    <pre className="bg-light p-3 rounded border-left-primary code-block">{q.submittedSql}</pre>
                  </div>
                </div>

                <div className="mt-3 d-flex justify-content-between align-items-center border-top pt-3">
                  <span className="h6 mb-0 text-gray-800">Points: <strong>{q.earnedMark} / {q.mark}</strong></span>
                  {q.attempt_id && (
                    <button 
                      className={`btn btn-sm ${q.isCorrect ? "btn-outline-danger" : "btn-outline-success"}`}
                      onClick={() => toggleMark(i, q.isCorrect, q.attempt_id, q.mark)}
                    >
                      <i className={`fas ${q.isCorrect ? "fa-times" : "fa-check"} fa-sm mr-1`}></i>
                      Override to {q.isCorrect ? "Incorrect" : "Correct"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}