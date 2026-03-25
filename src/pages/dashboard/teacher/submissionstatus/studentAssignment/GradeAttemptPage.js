import { useEffect, useState } from "react";
import { getTeacherQuestionDetails } from "../../../../../components/model/studentAssignments";
//import { updateAttemptCheckStatus } from "../../../../../components/model/questionAttempts";
import { compareQueryResult } from "../../../../../components/comparison/sqlComparison";
import { CodeEditor } from "../../../teacher/assignmentform/createquestionset/CodeEditor";
import "./StudentAssignmentPage.css";

export default function GradeAttemptPage({ attempt, studentId, assignmentId, onClose }) {
  const [question, setQuestion] = useState(null);
  const [autoGrade, setAutoGrade] = useState(0);
  const [manualGrade, setManualGrade] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    console.log(assignmentId);
    const q = await getTeacherQuestionDetails(
      assignmentId,
      attempt.question_id
    );

    if (!q) {
      console.error("Teacher question not found for:", attempt.question_id);
      alert("Error: This question does not exist in the assignment.");
      onClose();
      return;
    }
    setQuestion(q);
    console.log("q, question", q, question);
    const isCorrect = compareQueryResult(
      q.answer,
      attempt.submitted_sql,
      q.orderMatters,
      q.aliasStrict
    );

    setAutoGrade(isCorrect ? q.mark : 0);
  }

  async function handleSave() {
    const finalGrade = manualGrade !== null ? manualGrade : autoGrade;

    // await updateAttemptCheckStatus(attempt.id, {
    //   checked: true,
    //   autoGrade,
    //   manualGrade,
    //   finalGrade,
    //   comment,
    //   checked_on: new Date(),
    // });

    onClose();
  }

  if (!question) return <div>Loading...</div>;

  return (
    <div className="grading-container">

      <div className="teacher-box">
        <h3>Teacher Expected Answer</h3>
        <pre>{question.answer}</pre>
        <p><strong>Marks:</strong> {question.mark}</p>
        <p><strong>Order Matters:</strong> {String(question.orderMatters)}</p>
        <p><strong>Alias Strict:</strong> {String(question.aliasStrict)}</p>
      </div>

      <div className="student-box">
        <h3>Student Answer</h3>
        <pre>{attempt.submitted_sql}</pre>
      </div>

      <div className="editor-box">
        <h3>SQL Editor</h3>
        <CodeEditor value={attempt.submitted_sql} />
      </div>

      <div className="bottom-box">
        <label>Auto Grade:</label>
        <input type="number" value={autoGrade} readOnly />

        <label>Manual Override:</label>
        <input
          type="number"
          value={manualGrade ?? ""}
          onChange={(e) => setManualGrade(Number(e.target.value))}
        />

        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
