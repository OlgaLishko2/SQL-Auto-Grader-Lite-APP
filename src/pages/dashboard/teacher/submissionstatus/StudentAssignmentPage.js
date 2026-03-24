import { useEffect, useState } from "react";
import { getStudentInfo, getBestAttemptByUserQuestion, overrideAttemptMark } from "../../../../components/model/questionAttempts";
import { getAssignmentDetailsByAssignmentId } from "../../../../components/model/studentAssignments";

export default function StudentAssignmentPage({ studentId, assignmentId, assignmentTitle, onBack }) {
  const [student, setStudent] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!studentId || !assignmentId) return;
    const load = async () => {
      const [userData, assignment] = await Promise.all([
        getStudentInfo(studentId),
        getAssignmentDetailsByAssignmentId(assignmentId),
      ]);
      setStudent(userData);
      const qs = await Promise.all(
        (assignment?.questions || []).map(async (q, i) => {
          const attempt = await getBestAttemptByUserQuestion(studentId, q.question_id);
          return {
            index: i + 1,
            question_id: q.question_id,
            questionText: q.questionText,
            expectedAnswer: q.answer,
            mark: q.mark || 1,
            attempt_id: attempt?.attempt_id || null,
            submittedSql: attempt?.submitted_sql || "-",
            isCorrect: attempt?.is_correct || false,
            earnedMark: attempt?.is_correct ? (q.mark || 1) : 0,
          };
        })
      );
      setQuestions(qs);
    };
    load();
  }, [studentId, assignmentId]);

  const toggleMark = async (index, currentIsCorrect, attempt_id, mark) => {
    if (!attempt_id) return;
    const newIsCorrect = !currentIsCorrect;
    await overrideAttemptMark(attempt_id, newIsCorrect);
    setQuestions(prev => prev.map((q, i) => i === index
      ? { ...q, isCorrect: newIsCorrect, earnedMark: newIsCorrect ? mark : 0 }
      : q
    ));
  };

  const totalEarned = questions.reduce((s, q) => s + q.earnedMark, 0);
  const totalMark = questions.reduce((s, q) => s + q.mark, 0);

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>{assignmentTitle}</h2>
      {student && <p><strong>{student.fullName}</strong></p>}
      <div style={{ background: "#f0f4ff", padding: "10px", borderRadius: "6px", marginBottom: "16px" }}>
        <strong>Total Score: {totalEarned} / {totalMark}</strong>
      </div>

      {questions.map((q, i) => (
        <div key={q.question_id} style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "14px", marginBottom: "12px" }}>
          <h6>Question {q.index}</h6>
          <p>{q.questionText}</p>

          <label>Expected Answer:</label>
          <pre style={{ background: "#e8f5e9", padding: "8px", borderRadius: "4px" }}>{q.expectedAnswer}</pre>

          <label>Student's Answer:</label>
          <pre style={{ background: "#f4f4f4", padding: "8px", borderRadius: "4px" }}>{q.submittedSql}</pre>

          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "8px" }}>
            <span>Mark: <strong>{q.earnedMark} / {q.mark}</strong></span>
            <span className={`badge ${q.isCorrect ? "bg-success" : "bg-danger"}`}
              style={{ color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "11px" }}>
              {q.isCorrect ? "Correct" : "Incorrect"}
            </span>
            {q.attempt_id && (
              <button className="btn btn-sm btn-outline-secondary"
                onClick={() => toggleMark(i, q.isCorrect, q.attempt_id, q.mark)}>
                Override → Mark as {q.isCorrect ? "Incorrect" : "Correct"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
