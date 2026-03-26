import { useEffect, useState } from "react";
import { CodeEditor } from "../../../teacher/assignmentform/createquestionset/CodeEditor";
import "./StudentAssignmentPage.css";
//import "./GradeAttemptPage.css"

export default function GradeAttemptPage({ attempt, question, autoGrade, dataset, onClose }) {
  const [manualGrade, setManualGrade] = useState(attempt.manualGrade ?? null);
  const [comment, setComment] = useState(attempt.comment ?? "");
  
  async function handleSave() {
    const finalGrade = manualGrade !== null ? manualGrade : autoGrade;
    onClose();
  }

  return (
    <div className="grading-container">
      <div className="teacher-box">
        <h3>Expected Answer</h3>
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
        <CodeEditor selectedDataset={dataset} />
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