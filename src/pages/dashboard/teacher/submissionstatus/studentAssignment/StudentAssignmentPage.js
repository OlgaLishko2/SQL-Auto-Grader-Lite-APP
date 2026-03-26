import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GradeAttemptPage from "./GradeAttemptPage";
import { getAttemptsByStudent, computeQuestionGrade, computeTotalMarks } from "../../../../../components/model/questionAttempts";
import { getAssignmentDetailsByAssignmentId } from "../../../../../components/model/studentAssignments";
import { getUser } from "../../../../../components/model/users";
import { compareQueryResult } from "../../../../../components/comparison/sqlComparison";
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

    const questionIds = new Set(
      (assignmentData?.questions || []).map(q => q.question_id)
    );

    const filteredAttempts = allAttempts.filter(a =>
      questionIds.has(a.question_id)
    );

    setAssignment(assignmentData);
    setAttempts(filteredAttempts);
    setStudent(studentInfo);

    computeTotals(assignmentData?.questions || [], filteredAttempts);

    console.log("assignmentData, filteredAttempts, studentInfo :", assignmentData, filteredAttempts, studentInfo);
    console.log("assignment, attempts, student :", assignment, attempts, student);
  }

  function computeTotals(questions, attempts) {
    let earned = 0;
    let total = 0;

    questions.forEach((q) => {
      total += q.mark;

      const attempt = attempts.find((a) => a.question_id === q.question_id);
      if (!attempt) return;

      const isCorrect = compareQueryResult(
        q.answer,
        attempt.submitted_sql,
        q.orderMatters,
        q.aliasStrict
      );
      console.log("isCorrect: ",isCorrect)
      const autoGrade = isCorrect ? q.mark : 0;
      const final = attempt.manualGrade ?? autoGrade;

      earned += final;
    });

    setEarned(earned);
    setTotal(total);
  }

  function getGrades(q, attempt) {
    if (!attempt) return { autoGrade: 0, finalGrade: 0 };

    const isCorrect = compareQueryResult(
      q.answer,
      attempt.submitted_sql,
      q.orderMatters,
      q.aliasStrict
    );

    const autoGrade = isCorrect ? q.mark : 0;
    const finalGrade = attempt.manualGrade ?? autoGrade;

    return { autoGrade, finalGrade };
  }

  if (!assignment) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={onBack}>← Back</button>

      <h2>Student Assignment</h2>

      {student && (
        <div style={{ marginBottom: "20px" }}>
          <strong>Assignment:</strong> {assignment.title} <br />
          <strong>Name:</strong> {student.fullName}
        </div>
      )}

      <h2 className="final-grade">
        Final Grade: {earned} / {total}
      </h2>

      <button
        className="return-score-btn"
        onClick={() => alert(`Final Score Returned: ${earned}/${total}`)}
      >
        Return Final Score
      </button>

      <table className="status-table" border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Question</th>
            <th>Student SQL</th>
            <th>Auto Grade</th>
            <th>Final Grade</th>
            <th>Check</th>
          </tr>
        </thead>

        <tbody>
          {assignment.questions.map((q) => {
            const attempt = attempts.find((a) => a.question_id === q.question_id);
            const { autoGrade, finalGrade } = getGrades(q, attempt);

            return (
              <tr key={q.question_id}>
                <td>{q.questionText}</td>

                <td>
                  <pre className="sql-box">
                    {attempt?.submitted_sql || "No submission"}
                  </pre>
                </td>

                <td className={autoGrade > 0 ? "grade-cell green" : "grade-cell red"}>
                  {autoGrade} / {q.mark}
                </td>

                <td className={finalGrade > 0 ? "grade-cell green" : "grade-cell red"}>
                  {finalGrade} / {q.mark}
                </td>

                <td>
                  {attempt ? (
                    <button
                      onClick={() =>
                        setGradingContext({ attempt, question: q, autoGrade , dataset: assignment.dataset})
                      }
                    >
                      Check
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {gradingContext && (
         <div className="modal-overlay">
          <div className="modal-content">
            <GradeAttemptPage
              attempt={gradingContext.attempt}
              question={gradingContext.question}
              autoGrade={gradingContext.autoGrade}
              dataset={gradingContext.dataset}
              onClose={async () => {
                setGradingContext(null);
                await loadData();
              }}
            />
        </div>
      </div>
        
      )}
    </div>
  );
}
