import { useEffect, useState } from "react";
import { getAllQuizByOwner } from "../../../../components/model/quizzes";
import CollapsiblePanel from "../assignmentform/collapsiblepanel/CollapsiblePanel";
import userSession from "../../../../components/services/UserSession";
import "./QuizManager.css";

function QuizList({ onCreate }) {
  const [quizzes, setQuizzes] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const toggleQuiz = (id) => setExpanded(prev => prev === id ? null : id);

  useEffect(() => {
    console.log('QuizList uid:', userSession.uid);
    getAllQuizByOwner(userSession.uid).then((data) => {
      console.log('QuizList data:', data);
      const sorted = [...data].sort((a, b) => b.created_on?.toMillis() - a.created_on?.toMillis());
      setQuizzes(sorted);
    });
  }, []);

  return (
    <div className="quiz-list">
      <div className="list-header">
        <h2>Quizzes</h2>
        <button onClick={onCreate} className="quiz-btn create-quiz-btn">+ New Quiz</button>
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
          <div className="quiz-preview">
            <label>Question Text</label>
            <textarea readOnly value={a.questionText || ""} className="textarea-field" />
            <label>Answer SQL</label>
            <textarea readOnly value={a.answer || ""} className="textarea-field" />
            <div className="quiz-meta">
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
