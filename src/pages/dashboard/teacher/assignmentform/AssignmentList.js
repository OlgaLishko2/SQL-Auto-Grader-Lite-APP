import { useEffect, useState } from "react";
import { getAllAssignmentByOwner } from "../../../../components/model/assignments";
import { sendReminderEmail } from "../../../../components/services/email";
import { getAllStudents, getCohortsByOwner } from "../../../../components/model/cohorts";
import CollapsiblePanel from "../assignmentform/collapsiblepanel/CollapsiblePanel";
import userSession from "../../../../services/UserSession";


function AssignmentList({ onCreate }) {
  const [assignments, setAssignments] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getAllAssignmentByOwner(userSession.uid).then((data) => {
      const today = new Date();
     const sorted = [...data]
        .filter(a => new Date(a.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setAssignments(sorted);
      // setQuestions(sorted.questions)
    });
  }, []);
  const [collapsedQuestions, setCollapsedQuestions] = useState({});
  const toggleQuestion = (id) => setCollapsedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleAssignment = (assignment) => {
    setExpanded(expanded === assignment.assignment_id ? null : assignment.assignment_id);
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Assignments</h2>
        <button onClick={onCreate} style={{ padding: "8px 16px" }}>+ New Assignment</button>
      </div>

      {assignments.length === 0 && <p>No assignments found.</p>}

      {assignments.map((a) => (
        <div key={a.assignment_id} style={{ border: `1px solid ${a.reminder_interval ? "#f59e0b" : "#ccc"}`, marginTop: "16px", borderRadius: "4px", backgroundColor: a.reminder_interval ? "#fffbeb" : "white" }}>
          <div
            onClick={() => toggleAssignment(a)}
            style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", backgroundColor: a.reminder_interval ? "#fef3c7" : "#f9f9f9" }}
          >
            <strong>{a.title}</strong> {a.reminder_interval && <span title="Reminder enabled">🔔</span>}
            <span style={{ color: "#888" }}>Due: {a.dueDate} {expanded === a.assignment_id ? "▲" : "▼"}</span>
          </div>

          {expanded === a.assignment_id && (
            <div style={{ padding: "16px 20px" }}>
              <p style={{ margin: "0 0 12px" }}>{a.description}</p>
              <div style={{ display: "flex", gap: "16px", marginBottom: "12px", alignItems: "center" }}>
                <span>Submission Notification: <strong>{a.enable_submission_notification ? "Yes" : "No"}</strong></span>
                <span>Reminder: <strong>{a.reminder_interval ? "Yes" : "No"}</strong></span>
                {a.reminder_interval && (
                  <button onClick={async () => {
                    const allStudentsList = await getAllStudents();
                    const cohorts = await getCohortsByOwner(userSession.uid);
                    const cohort = cohorts.find(c => c.cohort_id === a.student_class);
                    const cohortStudents = allStudentsList.filter(s => cohort?.student_uids?.includes(s.uid));
                    await Promise.all(cohortStudents.map(s => sendReminderEmail(s, a.title, a.dueDate, a.assignment_id)));
                    alert("Reminder emails sent!");
                  }}>Send Reminder</button>
                )}
              </div>
              <h4>Questions</h4>
              {(a.questions || []).length === 0 && <p>No questions.</p>}
              {(a.questions || []).map((q, i) => (
                <CollapsiblePanel
                  key={q.question_id}
                  title={`Question ${i + 1}`}
                  preview={
                    q.questionText
                      ? (q.questionText.length > 80
                          ? q.questionText.substring(0, 80) + "…"
                          : q.questionText)
                      : "(no question text)"
                  }
                  isCollapsed={!collapsedQuestions[q.question_id]}
                  onToggle={() => toggleQuestion(q.question_id)}
                >
                <div style={{ border: "1px solid #eee", padding: "12px", marginTop: "10px" }}>
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
                </CollapsiblePanel>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AssignmentList;
