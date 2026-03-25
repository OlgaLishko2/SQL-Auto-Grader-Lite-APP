import { useEffect, useState } from "react";
import GradeAttemptPage from "./GradeAttemptPage";
import { getAttemptsByStudent, getStudentInfo } from "../../../../../components/model/questionAttempts";
import "./StudentAssignmentPage.css";

export default function StudentAssignmentPage({ studentId, assignmentId, onBack }) {

  const [student, setStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [gradingAttempt, setGradingAttempt] = useState(null);
  const [batchMode, setBatchMode] = useState(false);

  useEffect(() => {
    refreshAttempts();
  }, []);

    const  refreshAttempts = async () => {
    const list = await getAttemptsByStudent(studentId);
    const student_detail = await getStudentInfo(studentId);
    setAttempts(list);
    setStudent(student_detail);
    console.log("list, attempts, student_detail, student:", list, attempts, student_detail, student);
  }

  const gradedCount = attempts.filter(a => a.checked).length;
  const totalCount = attempts.length;

  return (
    <div>
      <button onClick={onBack}>← Back</button>

      <h2>Student Assignment</h2>
      {student && (
        <div style={{ marginBottom: "20px" }}>
          <strong>Student ID:</strong> {studentId} <br />
          <strong>Name:</strong> {student.fullName}
        </div>
      )}
      {/* Progress Bar */}
      <div className="progress-container">
        <strong>Progress:</strong> {gradedCount} / {totalCount} graded
        <div className="progress-bar-bg">
          <div
            className={`progress-bar-fill ${gradedCount === totalCount ? "complete" : ""}`}
            style={{ width: `${(gradedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Grade All Button */}
      {gradedCount < totalCount && (
        <button
          onClick={() => {
            setBatchMode(true);
            const next = attempts.find(a => !a.checked);
            setGradingAttempt(next);
          }}
        >
          Grade All
        </button>
      )}

      {/* Table */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Question No</th>
            <th>Attempt No</th>
            <th>Submitted SQL</th>
            <th>Marks</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {attempts.map((item, index) => (
            <tr key={item.id}>
              <td>{item.question_number || item.question_id}</td>
              <td>{item.attempt_no || index + 1}</td>
              <td style={{ whiteSpace: "pre-wrap" }}>{item.submitted_sql}</td>

              <td>
                {item.checked
                  ? (item.finalGrade ?? item.autoGrade ?? 0)
                  : "-"}
              </td>

              <td>
                {item.checked ? (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    Checked
                  </span>
                ) : (
                  <button onClick={() => setGradingAttempt(item)}>
                    Check
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Child Grading Page */}
      {gradingAttempt && (
        <GradeAttemptPage
          attempt={gradingAttempt}
          studentId={studentId}
          assignmentId={assignmentId}
          onClose={() => {
            refreshAttempts();

            if (batchMode) {
              const next = attempts.find(a => !a.checked);
              if (next) {
                setGradingAttempt(next);
              } else {
                setBatchMode(false);
                setGradingAttempt(null);
              }
            } else {
              setGradingAttempt(null);
            }
          }}
        />
      )}
    </div>
  );
}
