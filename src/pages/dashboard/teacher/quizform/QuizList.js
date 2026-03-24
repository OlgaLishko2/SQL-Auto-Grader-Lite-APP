import { useEffect, useState } from "react";
import { getAllQuizByOwner } from "../../../../components/model/quizzes";
import CollapsiblePanel from "../assignmentform/collapsiblepanel/CollapsiblePanel";
import userSession from "../../../../components/services/UserSession";

function QuizList({ onCreate }) {
  const [quizzes, setQuizzes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const toggleQuiz = (id) => setExpanded(prev => prev === id ? null : id);

  useEffect(() => {
    getAllQuizByOwner(userSession.uid).then((data) => {
      console.log("quizzes:", data);
      const sorted = [...data].sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
      setQuizzes(sorted);
    });
  }, []);

  return (
    <div style={{ padding: "20px"}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Quizzes</h2>
        <button onClick={onCreate} style={{ padding: "8px 16px", marginBottom: "16px" }}>+ New Quiz</button>
      </div>

      {quizzes.length === 0 && <p>No quizzes found.</p>}

      {quizzes.map((a) => (
        <CollapsiblePanel
          key={a.quiz_id}
          title={a.title}
          preview={a.questionText?.substring(0, 80) || "(no question)"}
          isCollapsed={expanded !== a.quiz_id}
          onToggle={() => toggleQuiz(a.quiz_id)}
        >
          <div style={{ border: "1px solid #eee", padding: "12px"}}>
            <label>Question Text</label>
            <textarea readOnly value={a.questionText || ""}
              style={{ width: "100%", height: "60px", boxSizing: "border-box" }} />
            <label>Answer SQL</label>
            <textarea readOnly value={a.answer || ""}
              style={{ width: "100%", height: "60px", boxSizing: "border-box", marginTop: "6px" }} />
            <div style={{ marginTop: "8px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <span>Difficulty: <strong>{a.difficulty || "easy"}</strong></span>
              <span>Max Attempts: <strong>{a.max_attempts || 1}</strong></span>
              <span>Mark: <strong>{a.mark || 1}</strong></span>
              <span>Order Matters: <strong>{a.orderMatters ? "Yes" : "No"}</strong></span>
              <span>Alias Strict: <strong>{a.aliasStrict ? "Yes" : "No"}</strong></span>
            </div>
          </div>
        </CollapsiblePanel>
      ))}
    </div>
  );
}

export default QuizList;
