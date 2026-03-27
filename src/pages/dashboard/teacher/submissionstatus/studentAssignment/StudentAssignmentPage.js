import { useEffect, useState } from "react";
import { getAttemptsByStudent } from "../../../../../components/model/questionAttempts";
import { getAssignmentDetailsByAssignmentId } from "../../../../../components/model/studentAssignments";
import { getUser } from "../../../../../components/model/users";
import GradeAttemptPage from "./GradeAttemptPage";
import "./StudentAssignmentPage.css";

export default function StudentAssignmentPage({ studentId, assignmentId, onBack }) {
  const [student, setStudent] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [gradingContext, setGradingContext] = useState(null);
  const [earned, setEarned] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [assignmentData, allAttempts, studentInfo] = await Promise.all([
      getAssignmentDetailsByAssignmentId(assignmentId),
      getAttemptsByStudent(studentId),
      getUser(studentId),
    ]);
    const questionIds = new Set((assignmentData?.questions || []).map(q => q.question_id));
    const filteredAttempts = allAttempts.filter(a => questionIds.has(a.question_id));

    setAssignment(assignmentData);
    setAttempts(filteredAttempts);
    setStudent(studentInfo);
    
    let e = 0, t = 0;
    assignmentData?.questions.forEach(q => {
      t += q.mark;
      if (filteredAttempts.find(a => a.question_id === q.question_id)?.is_correct) e += q.mark;
    });
    setEarned(e); setTotal(t);
  }

  if (!assignment) return <div className="p-4">Loading...</div>;

  return (
    <div className="container-fluid w-100 py-3">
   
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h4 className="mb-0 text-gray-800">{assignment.title}</h4>
          <span className="text-muted">Student: <strong>{student?.fullName}</strong></span>
        </div>
        <div className="text-right">
          <div className="h4 mb-0 font-weight-bold text-primary">{earned} / {total}</div>
          <button className="btn btn-link btn-sm p-0" onClick={onBack}>← Back to list</button>
        </div>
      </div>

      
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-bordered table-striped mb-0">
            <thead className="bg-light">
              <tr>
                <th style={{width: '30%'}}>Question</th>
                <th>Student SQL</th>
                <th className="text-center">Mark</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {assignment.questions.map((q) => {
                const attempt = attempts.find((a) => a.question_id === q.question_id);
                return (
                  <tr key={q.question_id}>
                    <td className="small font-weight-bold">{q.questionText}</td>
                    <td>
                      <code className="p-2 d-block bg-light text-dark rounded border small" style={{whiteSpace: 'pre-wrap'}}>
                        {attempt?.submitted_sql || "No submission"}
                      </code>
                    </td>
                    <td className="text-center align-middle font-weight-bold">
                      <span className={attempt?.is_correct ? "text-success" : "text-danger"}>
                        {attempt?.is_correct ? q.mark : 0} / {q.mark}
                      </span>
                    </td>
                    <td className="text-center align-middle">
                      {attempt && (
                        <button 
                          className="btn btn-primary btn-sm px-3"
                          onClick={() => setGradingContext({ attempt, question: q, grade: attempt.is_correct ? q.mark : 0, dataset: assignment.dataset })}
                        >
                          Check
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    
      <div className="mt-4 text-right">
        <button className="btn btn-success shadow" onClick={() => alert("Score saved")}>
          <i className="fas fa-check mr-2"></i> Return Final Score
        </button>
      </div>

   
      {gradingContext && (
        <div className="modal-overlay">
          <div className="modal-content border-0 shadow">
            <div className="d-flex justify-content-between p-3 border-bottom bg-white">
              <h6 className="m-0 font-weight-bold">Grading Detail</h6>
              <button className="close" onClick={() => setGradingContext(null)}>&times;</button>
            </div>
            <GradeAttemptPage
              attempt={gradingContext.attempt}
              question={gradingContext.question}
              autoGrade={gradingContext.grade}
              dataset={gradingContext.dataset}
              onClose={() => { setGradingContext(null); loadData(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}