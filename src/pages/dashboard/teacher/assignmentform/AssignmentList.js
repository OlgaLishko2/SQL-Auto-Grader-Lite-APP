import { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase";
import { getAllAssignmentByOwner } from "../../../../components/model/assignments";
import { getStudentsByCohort, createNewStudentAssignment } from "../../../../components/model/studentAssignments";
import { sendAssignmentEmail, sendReminderEmail } from "../../../../components/services/email";
import { getAllStudents, getCohortsByOwner } from "../../../../components/model/cohorts";
import { collection, getDocs, query, where } from "firebase/firestore";
import CollapsiblePanel from "../assignmentform/collapsiblepanel/CollapsiblePanel";


// 🔥 Helper: check if assignment is published
async function isAssignmentPublished(assignmentId) {
  const snap = await getDocs(
    query(
      collection(db, "student_assignments"),
      where("assignment_id", "==", assignmentId)
    )
  );
  return !snap.empty;
}


// 🔥 Shared publish logic
async function publishAssignmentToStudents(assignment) {
  if (!window.confirm("Are you sure you want to publish?")) return false;

  const { assignment_id, student_class, dueDate, title } = assignment;

  // Check if already published
  const existing = await getDocs(
    query(
      collection(db, "student_assignments"),
      where("assignment_id", "==", assignment_id)
    )
  );

  if (!existing.empty) {
    alert("This assignment is already published.");
    return false;
  }

  console.log("assignment_id, student_class, dueDate, title :", assignment_id, student_class, dueDate, title);
  // Get students
  const students = await getStudentsByCohort(student_class);
  
  console.log("students: ", students);

  if (students.length === 0) {
    alert("No students found in this cohort.");
    return false;
  }

  // Create student_assignments rows
  await Promise.all(
    students.map((s) =>
      createNewStudentAssignment({
        assignment_id,
        student_user_id: s.student_uids,
        status: "assigned",
        assigned_on: new Date(),
        submissionDate: null,
        due_on: dueDate,
      })
    )
  );

   //Fetch full user details from users collection
  const user_detail = collection(db, "users");

  const all_users = [];
  for (const c of students) {
    if (!c.student_uids) continue;

    for (const uid of c.student_uids) {
      const snap = await getDocs(query(user_detail, where("uid", "==", uid)));
      if (!snap.empty) {
        all_users.push({
          uid,
          ...snap.docs[0].data(), // includes email, name, etc.
        });
      }
    }
  }
  // Send emails
  await Promise.all(
    students.map((s) =>
      sendAssignmentEmail(s, title, dueDate, assignment_id)
    )
  );

  return true;
}



function AssignmentList({ onCreate }) {
  const [assignments, setAssignments] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    const data = await getAllAssignmentByOwner(auth.currentUser.uid);

    const withStatus = await Promise.all(
      data.map(async (a) => ({
        ...a,
        published: await isAssignmentPublished(a.assignment_id),
      }))
    );

    const sorted = [...withStatus].sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    );

    setAssignments(sorted);
  }

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

      {assignments.map((a) => (
        <div
          key={a.assignment_id}
          style={{
            border: "1px solid #ccc",
            marginTop: "16px",
            borderRadius: "4px",
            backgroundColor: "white"
          }}
        >
          <div
            onClick={() => toggleAssignment(a)}
            style={{
              padding: "14px 20px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#f9f9f9"
            }}
          >
            <strong>{a.title}</strong>

            {/* 🔥 Publish button or Published label */}
            {!a.published ? (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const success = await publishAssignmentToStudents(a);
                  if (success) {
                    alert("Assignment published!");
                    loadAssignments();
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

              {/* 🔥 RESTORED REMINDER + NOTIFICATION BLOCK */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "12px", alignItems: "center" }}>
                <span>Submission Notification: <strong>{a.enable_submission_notification ? "Yes" : "No"}</strong></span>
                <span>Reminder: <strong>{a.reminder_interval ? "Yes" : "No"}</strong></span>

                {a.reminder_interval && (
                  <button
                    onClick={async () => {
                      const allStudentsList = await getAllStudents();
                      const cohorts = await getCohortsByOwner(auth.currentUser.uid);
                      const cohort = cohorts.find(c => c.cohort_id === a.student_class);
                      const cohortStudents = allStudentsList.filter(s => cohort?.student_uids?.includes(s.uid));

                      await Promise.all(
                        cohortStudents.map(s =>
                          sendReminderEmail(s, a.title, a.dueDate, a.assignment_id)
                        )
                      );

                      alert("Reminder emails sent!");
                    }}
                  >
                    Send Reminder
                  </button>
                )}
              </div>

              <h4>Questions</h4>
              {(a.questions || []).length === 0 && <p>No questions.</p>}

              {(a.questions || []).map((q, i) => (
                <CollapsiblePanel
                  key={i}
                  title={`Question ${i + 1}`}
                  preview={
                    q.questionText
                      ? (q.questionText.length > 80
                          ? q.questionText.substring(0, 80) + "…"
                          : q.questionText)
                      : "(no question text)"
                  }
                >
                  <div style={{ border: "1px solid #eee", padding: "12px", marginTop: "10px" }}>
                    <label>Question Text</label>
                    <textarea
                      value={q.questionText || ""}
                      style={{ width: "100%", height: "60px" }}
                      readOnly
                    />

                    <label>Answer SQL</label>
                    <textarea
                      value={q.answer || ""}
                      style={{ width: "100%", height: "60px", marginTop: "6px" }}
                      readOnly
                    />

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
      ))}
    </div>
  );
}

export default AssignmentList;
