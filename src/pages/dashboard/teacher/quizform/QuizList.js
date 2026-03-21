import { useEffect, useState } from "react";
import { auth } from "../../../../firebase";
import { getAllQuizByOwner } from "../../../../components/model/assignments";

function QuizList({ onCreate }) {
  const [quizes, setQuizes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null); // { qIndex, field, value }

  useEffect(() => {
    getAllQuizByOwner(auth.currentUser.uid).then((data) => {
      const sorted = [...data].sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
      setQuizes(sorted);
    });
  }, []);
const toggleQuiz = (assignment) => {
  setExpanded(expanded === assignment.quiz_id ? null : assignment.quiz_id);
}

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Quizes</h2>
        <button onClick={onCreate} style={{ padding: "8px 16px" }}>+ New Quiz</button>
      </div>

      {quizes.length === 0 && <p>No quizes found.</p>}

      {quizes.map((a) => (
        <div key={a.quiz_id} style={{ border: "1px solid #ccc", marginTop: "16px", borderRadius: "4px" }}>
          <div
            onClick={() => toggleQuiz(a)}
            style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", backgroundColor: "#f9f9f9" }}
          >
            <strong>{a.title}</strong>
            <span style={{ color: "#888" }}>{expanded === a.quiz_id ? "▲" : "▼"}</span>
          </div>

          {expanded === a.quiz_id && a.question && (
            <div style={{ padding: "16px 20px" }}>
              <div style={{ border: "1px solid #eee", padding: "12px" }}>
                <label>Question Text</label>
                <textarea readOnly value={a.question.questionText || ""}
                  style={{ width: "100%", height: "60px", boxSizing: "border-box" }} />
                <label>Answer SQL</label>
                <textarea readOnly value={a.question.answer || ""}
                  style={{ width: "100%", height: "60px", boxSizing: "border-box", marginTop: "6px" }} />
                <div style={{ marginTop: "8px", display: "flex", gap: "16px", alignItems: "center" }}>
                  <span>Difficulty: <strong>{a.question.difficulty || "easy"}</strong></span>
                  <span>Max Attempts: <strong>{a.question.max_attempts || 1}</strong></span>
                  <span>Mark: <strong>{a.question.mark || 1}</strong></span>
                  <span>Order Matters: <strong>{a.question.orderMatters ? "Yes" : "No"}</strong></span>
                  <span>Alias Strict: <strong>{a.question.aliasStrict ? "Yes" : "No"}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default QuizList;
