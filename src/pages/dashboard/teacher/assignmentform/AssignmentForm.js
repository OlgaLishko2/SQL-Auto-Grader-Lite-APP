// --- imports at top ---
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateQuestionSet from './createquestionset/CreateQuestionSet';
import { auth, db } from "../../../../firebase";
import { createNewAssignment } from "../../../../components/model/assignments";
import { getCohortsByOwner } from "../../../../components/model/cohorts";
import { CreateAssignment } from './createquestionset/CreateAssignment';
import { sendAssignmentEmail } from "../../../../components/services/email";
import { getStudentsByCohort, createNewStudentAssignment } from "../../../../components/model/studentAssignments";
import { collection, getDocs, query, where } from "firebase/firestore";


// 🔥 Shared publish helper
async function publishAssignmentToStudents(assignmentId, cohortId, dueDate, title) {
  // 1. Check if already published
  const existing = await getDocs(
    query(
      collection(db, "student_assignments"),
      where("assignment_id", "==", assignmentId)
    )
  );

  if (!existing.empty) {
    alert("This assignment is already published.");
    return false;
  }

  // 2. Get students in cohort
  const students = await getStudentsByCohort(cohortId);
  console.log("cohortId, students", cohortId, students);

  if (students.length === 0) {
    alert("No students found in this cohort.");
    return false;
  }

  // 3. Create student_assignments rows
  await Promise.all(
    students.map((s) =>
      createNewStudentAssignment({
        assignment_id: assignmentId,
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
  // 4. Send emails
  await Promise.all(
    all_users.map((s) =>
      sendAssignmentEmail(s, title, dueDate, assignmentId)
    )
  );

  return true;
}



const AssignmentForm = ({ onDone }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [dbName, setDbName] = useState("");

  const [formData, setFormData] = useState({
    title: '',
    total_marks: '',
    due_date: '',
    description: '',
    student_class: '',
    questions: [],
    enable_submission_notification: false,
    reminder_interval: false
  });

  const [cohorts, setCohorts] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getCohortsByOwner(auth.currentUser.uid).then(setCohorts);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setError("");
    setActiveTab(activeTab + 1);
  };

  const tabs = ['Create Assignment', 'Add Questions', 'Assign Students'];

  const tabRequiredFields = [
    ['title', 'description', 'due_date'],
    [],
    ['student_class'],
  ];

  const isTabComplete = (tabIndex) =>
    tabRequiredFields[tabIndex]?.every((f) => String(formData[f]).trim() !== '') ?? true;


  return (
    <div style={{ maxWidth: 'auto', margin: '20px auto', border: '1px solid #ccc', padding: '20px' }}>
      {onDone && <button type="button" onClick={onDone} style={{ marginBottom: "16px" }}>← Back to Assignments</button>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {tabs.map((tab, index) => {
          const unlocked = index === 0 || (index <= 3 && [...Array(index)].every((_, i) => isTabComplete(i)));
          return (
            <button
              key={tab}
              type="button"
              onClick={() => unlocked && setActiveTab(index)}
              disabled={!unlocked}
              style={{
                fontWeight: activeTab === index ? 'bold' : 'normal',
                opacity: unlocked ? 1 : 0.35,
                cursor: unlocked ? 'pointer' : 'not-allowed',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 0 && (
          <CreateAssignment formData={formData} handleChange={handleChange} />
        )}

        {activeTab === 1 && (
          <CreateQuestionSet
            onAddQuestions={(qs) => setFormData(prev => ({ ...prev, questions: qs }))}
            setDb={setDbName}
          />
        )}

        {activeTab === 2 && (
          <div>
            <label>Student Cohort: </label><br />
            <select name="student_class" value={formData.student_class} onChange={handleChange}>
              <option value="">-- Select Cohort --</option>
              {cohorts.map((c) => (
                <option key={c.cohort_id} value={c.cohort_id}>{c.name}</option>
              ))}
            </select>
            <br /><br />

            <label>Enable Notification(on submission): </label>
            <input name="enable_submission_notification" type="checkbox" checked={formData.enable_submission_notification} onChange={handleChange} /><br />

            <label>Reminder Interval: </label>
            <input name="reminder_interval" type="checkbox" checked={formData.reminder_interval} onChange={handleChange} />
          </div>
        )}

        {/* Buttons */}
        <div style={{ marginTop: '20px' }}>
          {activeTab < 2 && (
            <button type="button" disabled={!isTabComplete(activeTab)} onClick={handleNext}>Next</button>
          )}

          {activeTab === 2 && (
            <div style={{ display: "flex", gap: "12px" }}>
              
              {/* SAVE ASSIGNMENT */}
              <button
                type="button"
                onClick={async () => {
                  if (formData.questions.length === 0) {
                    alert("The assignment needs at least one question.");
                    return;
                  }

                  const id = await createNewAssignment({
                    title: formData.title,
                    description: formData.description,
                    owner_user_id: auth.currentUser.uid,
                    dataset: dbName,
                    questions: formData.questions,
                    student_class: formData.student_class,
                    dueDate: formData.due_date,
                    enable_submission_notification: formData.enable_submission_notification,
                    reminder_interval: formData.reminder_interval,
                    created_on: new Date(),
                    updated_on: new Date(),
                  });

                  setAssignmentId(id);
                  alert("Assignment saved.");
                }}
              >
                Save Assignment
              </button>


              {/* CREATE & PUBLISH */}
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm("Are you sure you want to publish?")) return;

                  let id = assignmentId;

                  // If assignment not saved yet → save it first
                  if (!id) {
                    id = await createNewAssignment({
                      title: formData.title,
                      description: formData.description,
                      owner_user_id: auth.currentUser.uid,
                      dataset: dbName,
                      questions: formData.questions,
                      student_class: formData.student_class,
                      dueDate: formData.due_date,
                      enable_submission_notification: formData.enable_submission_notification,
                      reminder_interval: formData.reminder_interval,
                      created_on: new Date(),
                      updated_on: new Date(),
                    });
                    setAssignmentId(id);
                  }

                  const success = await publishAssignmentToStudents(
                    id,
                    formData.student_class,
                    formData.due_date,
                    formData.title
                  );

                  if (success) {
                    alert("Assignment published!");
                    onDone();
                  }
                }}
              >
                Create & Publish Assignment
              </button>

            </div>
          )}

          {error && <span style={{ marginLeft: "12px", color: "red" }}>{error}</span>}
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;
