import { useEffect, useState } from "react";
import { auth } from "../../../../firebase";
import { getAllAssignmentByOwner } from "../../../../components/model/assignments";
import { getAllQuestionByAssignment, updateQuestion } from "../../../../components/model/questions";

function AssignmentList({ onCreate }) {
  const [assignments, setAssignments] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null); // { qIndex, field, value }

  useEffect(() => {
    getAllAssignmentByOwner(auth.currentUser.uid).then((data) => {
      const sorted = [...data].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setAssignments(sorted);
      // setQuestions(sorted.questions)
    });
  }, []);
  const toggleAssignment = (assignment) => {
    setExpanded(expanded === assignment.assignment_id ? null : assignment.assignment_id);
  }
  // const toggleAssignment = async (assignment) => {
  //   if (expanded === assignment.assignment_id) {
  //     setExpanded(null);
  //     setQuestions([]);
  //     return;
  //   }
  //   setExpanded(assignment.assignment_id);
  //   const qs = await getAllQuestionByAssignment(assignment.assignment_id);
  //   // setQuestions(qs);
  // };

  // const handleFieldChange = (index, field, value) => {
  //   const updated = [...questions];
  //   updated[index] = { ...updated[index], [field]: value };
  //   // setQuestions(updated);
  //   setEditing({ qIndex: index, field });
  // };

  // const saveQuestion = async (q) => {
  //   // await updateQuestion(q);
  //   // setEditing(null);
  //   // alert("Question saved!");
  // };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Assignments</h2>
        <button onClick={onCreate} style={{ padding: "8px 16px" }}>+ New Assignment</button>
      </div>

      {assignments.length === 0 && <p>No assignments found.</p>}

      {assignments.map((a) => (
        <div key={a.assignment_id} style={{ border: "1px solid #ccc", marginTop: "16px", borderRadius: "4px" }}>
          <div
            onClick={() => toggleAssignment(a)}
            style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", backgroundColor: "#f9f9f9" }}
          >
            <strong>{a.title}</strong>
            <span style={{ color: "#888" }}>Due: {a.dueDate} {expanded === a.assignment_id ? "▲" : "▼"}</span>
          </div>

          {expanded === a.assignment_id && (
            <div style={{ padding: "16px 20px" }}>
              <p style={{ margin: "0 0 12px" }}>{a.description}</p>
              <h4>Questions</h4>
              {(a.questions || []).length === 0 && <p>No questions.</p>}
              {(a.questions || []).map((q, i) => (
                <div key={q.question_id} style={{ border: "1px solid #eee", padding: "12px", marginTop: "10px" }}>
                  <label>Question Text</label>
                  <textarea
                    value={q.questionText || ""}
                    // onChange={(e) => handleFieldChange(i, "questionText", e.target.value)}
                    style={{ width: "100%", height: "60px", boxSizing: "border-box" }}
                  />
                  <label>Answer SQL</label>
                  <textarea
                    value={q.answer || ""}
                    // onChange={(e) => handleFieldChange(i, "answer", e.target.value)}
                    style={{ width: "100%", height: "60px", boxSizing: "border-box", marginTop: "6px" }}
                  />
                  <div style={{ marginTop: "8px", display: "flex", gap: "16px", alignItems: "center" }}>
                    <span>Order Matters: <strong>{q.orderMatters ? "Yes" : "No"}</strong></span>
                    <span>Alias Strict: <strong>{q.aliasStrict ? "Yes" : "No"}</strong></span>
                    <span>Difficulty: <strong>{q.difficulty || "easy"}</strong></span>
                    <span>Max Attempts: <strong>{q.max_attempts || 1}</strong></span>
                    <span>Mark: <strong>{q.mark || 1}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AssignmentList;
