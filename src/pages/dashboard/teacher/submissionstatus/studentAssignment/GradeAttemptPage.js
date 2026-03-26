import { useEffect, useState } from "react";
import { updateAttemptCorrectness } from "../../../../../components/model/questionAttempts";
import { CodeEditor } from "../../../teacher/assignmentform/createquestionset/CodeEditor";
import "./StudentAssignmentPage.css";
//import "./GradeAttemptPage.css"

export default function GradeAttemptPage({ attempt, question, autoGrade, dataset, onClose }) {
  const [manualGrade, setManualGrade] = useState(attempt.manualGrade ?? null);
  const [isCorrect, setIsCorrect] = useState(attempt.is_correct ?? false);
  
  async function handleSave() {
    const finalGrade = manualGrade !== null ? manualGrade : autoGrade;
    onClose();
  }

  async function handleToggle() {
  const newValue = !isCorrect;

  await updateAttemptCorrectness(attempt.id, newValue);

  setIsCorrect(newValue);
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

      {/* NEW: Toggle Button */}
        <button className="toggle-btn" onClick={handleToggle}>
          {isCorrect ? "Mark Incorrect" : "Mark Correct"}
        </button>
      </div>
      
    </div>
  );
}