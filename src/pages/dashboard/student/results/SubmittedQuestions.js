import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import userSession from "../../../../components/services/UserSession";
import { getAssignmentDetailsByAssignmentId } from "../../../../components/model/studentAssignments";
import { getBestAttemptByUserQuestion } from "../../../../components/model/questionAttempts";
import LoadingOverlay from "../LoadingOverlay";

const SubmittedQuestions = () => {
  const { assignment_id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const assignment = await getAssignmentDetailsByAssignmentId(assignment_id);
      if (!assignment) return setIsLoading(false);
      setTitle(assignment.title || "Assignment");
      const qs = await Promise.all(
        (assignment.questions || []).map(async (q, i) => {
          const attempt = await getBestAttemptByUserQuestion(userSession.uid, q.question_id);
          return {
            index: i + 1,
            questionText: q.questionText,
            mark: q.mark || 1,
            submittedSql: attempt?.submitted_sql || "-",
            earnedMark: attempt?.is_correct ? (q.mark || 1) : 0,
            isCorrect: attempt?.is_correct || false,
          };
        })
      );
      setQuestions(qs);
      setIsLoading(false);
    };
    load();
  }, [assignment_id]);

  return (
    <>
      <LoadingOverlay isOpen={isLoading} message="Loading..." />
      <h2>{title}</h2>
      <button className="btn btn-sm btn-secondary mb-3" onClick={() => navigate(-1)}>← Back</button>

      {questions.length > 0 && (
        <div className="card shadow mb-4 p-3" style={{ background: "#f0f4ff" }}>
          <strong>Total Score: {questions.reduce((s, q) => s + q.earnedMark, 0)} / {questions.reduce((s, q) => s + q.mark, 0)}</strong>
        </div>
      )}
      {questions.map((q) => (
        <div key={q.index} className="card shadow mb-3 p-3">
          <h6>Question {q.index}</h6>
          <p>{q.questionText}</p>
          <label>Your Answer:</label>
          <pre style={{ background: "#f4f4f4", padding: "8px", borderRadius: "4px" }}>{q.submittedSql}</pre>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span>Mark: <strong>{q.earnedMark} / {q.mark}</strong></span>
            <span className={`badge ${q.isCorrect ? "bg-success" : "bg-danger"}`}
              style={{ color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "11px" }}>
              {q.isCorrect ? "Correct" : "Incorrect"}
            </span>
          </div>
        </div>
      ))}
    </>
  );
};

export default SubmittedQuestions;
