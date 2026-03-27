import { useEffect, useState } from "react";
import { getAllAssignmentByOwner } from "../../../../components/model/assignments";
import { sendReminderEmail, sendAssignmentEmailsToStudents } from "../../../../components/services/email";
import { getAllStudents, getCohortsByOwner, getAllCohorts } from "../../../../components/model/cohorts";
import { publishAssignmentToStudents, isAssignmentPublished } from "../../../../components/model/studentAssignments";
import CollapsiblePanel from "../assignmentform/collapsiblepanel/CollapsiblePanel";
import userSession from "../../../../components/services/UserSession";

function AssignmentList({ onCreate }) {
  const [assignments, setAssignments] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [cohortMap, setCohortMap] = useState({});

  useEffect(() => {
    getAllAssignmentByOwner(userSession.uid).then(async (data) => {
      const today = new Date().toISOString().split("T")[0];
      const filtered = data.filter(a => a.dueDate >= today);
      const withPublished = await Promise.all(
        filtered.map(async (a) => ({ ...a, published: await isAssignmentPublished(a.assignment_id) }))
      );
      setAssignments(withPublished);
    });
    getAllCohorts().then(cohorts => {
      const map = {};
      cohorts.forEach(c => { map[c.cohort_id] = c; });
      setCohortMap(map);
    });
  }, []);

  const [collapsedQuestions, setCollapsedQuestions] = useState({});
  const toggleQuestion = (id) => setCollapsedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleAssignment = (assignment) => {
    setExpanded(expanded === assignment.assignment_id ? null : assignment.assignment_id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Assignments</h2>
        <button onClick={onCreate} style={{ padding: "8px 16px" }}>+ New Assignment</button>
      </div>

      {assignments.length === 0 && <p>No assignments found.</p>}

      {assignments.map((a) => {
        const needsReminder = !!a.reminder_interval;
        return (
          <div
            key={a.assignment_id}
            style={{
              border: "1px solid #ccc",
              marginTop: "16px",
              borderRadius: "4px",
              backgroundColor: "white",
              borderLeft: needsReminder ? "4px solid #f0ad4e" : "1px solid #ccc"
            }}
          >
            <div
              onClick={() => toggleAssignment(a)}
              style={{
                padding: "14px 20px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: needsReminder ? "#fffbf2" : "#f9f9f9"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <strong>{a.title}</strong>
                {a.student_class && (
                  <span style={{ fontSize: "12px", background: "#e0f0ff", color: "#0066cc", borderRadius: "4px", padding: "2px 8px" }}>
                    {cohortMap[a.student_class]?.name || a.student_class}
                  </span>
                )}
                {needsReminder && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const allStudentsList = await getAllStudents();
                    const cohorts = await getCohortsByOwner(userSession.uid);
                    const cohort = cohorts.find(c => c.cohort_id === a.student_class);
                    const cohortStudents = allStudentsList.filter(s => cohort?.student_uids?.includes(s.uid));
                    await Promise.all(cohortStudents.map(s => sendReminderEmail(s, a.title, a.dueDate, a.assignment_id)));
                    alert("Reminder emails sent!");
                  }}
                  style={{
                    backgroundColor: "#f0ad4e", color: "white", border: "none",
                    borderRadius: "4px", padding: "3px 10px", fontSize: "12px", cursor: "pointer"
                  }}
                >
                  🔔 Send Reminder
                </button>
                )}
              </div>

              {!a.published ? (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const result = await publishAssignmentToStudents(a.assignment_id, a.student_class, a.dueDate);
                    if (result.success) {
                      await sendAssignmentEmailsToStudents(a, a.assignment_id);
                      alert("Assignment published!");
                      setAssignments(prev => prev.map(x => x.assignment_id === a.assignment_id ? { ...x, published: true } : x));
                    } else {
                      alert("Failed: " + result.message);
                    }
                  }}
                >
                  Publish
                </button>
              ) : (
                <span style={{ opacity: 0.6, marginLeft: "10px" }}>Published</span>
              )}

              <span style={{ color: "#888" }}>
                Due: {a.dueDate} {expanded === a.assignment_id ? "▲" : "▼"}
              </span>
            </div>

            {expanded === a.assignment_id && (
              <div style={{ padding: "16px 20px" }}>
                <p style={{ margin: "0 0 12px" }}>{a.description}</p>

                <div style={{ display: "flex", gap: "16px", marginBottom: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  {(() => {
                    const cohort = cohortMap[a.student_class];
                    return cohort ? (
                      <span>Cohort: <strong>{cohort.name}</strong> ({cohort.student_uids?.length ?? 0} students)</span>
                    ) : (
                      <span>Cohort: <strong>{a.student_class || "—"}</strong></span>
                    );
                  })()}
                  <span>Submission Notification: <strong>{a.enable_submission_notification ? "Yes" : "No"}</strong></span>
                  <span>Reminder: <strong>{a.reminder_interval ? "Yes" : "No"}</strong></span>
                </div>

                <h4>Questions</h4>
                {(a.questions || []).length === 0 && <p>No questions.</p>}

                {(a.questions || []).map((q, i) => (
                  <CollapsiblePanel
                    key={i}
                    title={`Question ${i + 1}`}
                    preview={q.questionText ? (q.questionText.length > 80 ? q.questionText.substring(0, 80) + "…" : q.questionText) : "(no question text)"}
                    isCollapsed={!collapsedQuestions[q.question_id]}
                    onToggle={() => toggleQuestion(q.question_id)}
                  >
                    <div style={{ border: "1px solid #eee", padding: "12px", marginTop: "10px" }}>
                      <label>Question Text</label>
                      <textarea value={q.questionText || ""} style={{ width: "100%", height: "60px" }} readOnly />
                      <label>Answer SQL</label>
                      <textarea value={q.answer || ""} style={{ width: "100%", height: "60px", marginTop: "6px" }} readOnly />
                      <div style={{ marginTop: "8px", display: "flex", gap: "16px" }}>
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
        );
      })}
    </div>
  );
}

export default AssignmentList;
