import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateQuestionSet from './createquestionset/CreateQuestionSet';
import { auth, db } from "../../../../firebase";
import { createNewAssignment, updateAssignment } from "../../../../components/model/assignments"
import { getCohortsByOwner } from "../../../../components/model/cohorts";
import { CreateAssignment } from './createquestionset/CreateAssignment';
import { sendAssignmentEmail } from "../../../../components/services/email";
import { getAllStudents } from "../../../../components/model/cohorts";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
// import { question } from 'fontawesome';

const AssignmentForm = ({ onDone }) => {

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [db, setDb] = useState("")
  const [formData, setFormData] = useState({
    title: '', total_marks: '', due_date: '', description: '',
    student_class: '', questions: [],
    enable_submission_notification: false, reminder_interval: false
  });
  const [cohorts, setCohorts] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");

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

  const [error, setError] = useState("");

  const handleNext = async () => {
    setError("");
    if (activeTab === 0) {
      if (!auth.currentUser) {
        setError("You must be logged in to create an assignment.");
        return;
      }
    }
    setActiveTab(activeTab + 1);
  };
  /* Publish function */
    const handlePublish = async () => {
      if (!assignmentId) {
        alert("Assignment ID missing. Please create the assignment first.");
        return;
      }

      if (!formData.student_class) {
        alert("Please select a cohort before publishing.");
        return;
      }

      try {
        // 1. Fetch students in the selected cohort
        const studentsRef = collection(db, "users");
        const q = query(studentsRef, where("cohort_id", "==", formData.student_class));
        const snap = await getDocs(q);

        const students = snap.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));

        if (students.length === 0) {
          alert("No students found in this cohort.");
          return;
        }

        // 2. Create student_assignments entries
        const promises = students.map(student =>
          addDoc(collection(db, "student_assignments"), {
            assignment_id: assignmentId,
            student_user_id: student.uid,
            status: "assigned",
            assigned_on: new Date(),
            submissionDate: null,
            due_on: formData.due_date
          })
        );

        await Promise.all(promises);

        alert("Assignment published successfully!");
        onDone(); // go back to assignment list

      } catch (err) {
        console.error("Publish error:", err);
        alert("Failed to publish assignment: " + err.message);
      }
    };

  const tabRequiredFields = [
    ['title', 'description', 'due_date'],
    [],
    ['student_class'],
  ];

  const isTabComplete = (tabIndex) =>
    tabRequiredFields[tabIndex]?.every((f) => String(formData[f]).trim() !== '') ?? true;

  const tabs = ['Create Assignment', 'Add Questions', 'Assign Students'];

  return (
    <div style={{ maxWidth: 'auto', margin: '20px auto', border: '1px solid #ccc', padding: '20px' }}>
      {onDone && <button type="button" onClick={onDone} style={{ marginBottom: "16px" }}>← Back to Assignments</button>}
      {/* Tab Navigation */}
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

      {/* Form Content */}
      <div>
        {activeTab === 0 && (
          <CreateAssignment formData={formData} handleChange={handleChange} />
        )}

        {activeTab === 1 && (
          <CreateQuestionSet onAddQuestions={(qs) => setFormData(prev => ({ ...prev, questions: qs }))} setDb={setDb}/>
        )}

        {activeTab === 2 && (
          <div>
            <label>Student Cohort: </label><br />
            {cohorts.length === 0 ? (
              <p style={{ color: "red", marginTop: "8px" }}>
                No cohorts found.{" "}
                <span
                  onClick={() => navigate("/dashboard/cohorts")}
                  style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
                >
                  Create a cohort first
                </span>
              </p>
            ) : (
              <>
                <select name="student_class" value={formData.student_class} onChange={handleChange}>
                  <option value="">-- Select Cohort --</option>
                  {cohorts.map((c) => (
                    <option key={c.cohort_id} value={c.cohort_id}>{c.name}</option>
                  ))}
                </select><br /><br />
              </>
            )}
            <label htmlFor='enable_submission_notification'>Enable Notification(on submission): </label>
            <input name="enable_submission_notification" type="checkbox" checked={formData.enable_submission_notification} onChange={handleChange} /><br />
            <label htmlFor='reminder_interval'>Reminder Interval: </label>
            <input name="reminder_interval" type="checkbox" checked={formData.reminder_interval} onChange={handleChange} />
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          {activeTab < 2 && (
            <button type="button" disabled={!isTabComplete(activeTab)} onClick={handleNext}>Next</button>
          )}
          {error && <span style={{ marginLeft: "12px", color: "red" }}>{error}</span>}
          {activeTab === 2 && (
          <div>
            <button
              type="button"
              disabled={!isTabComplete(2)}
              onClick={async () => {
                try {
                  if (formData.questions.length === 0) {
                    alert("the assignmet needs to have at least one question")
                    return
                  }

                  const id = await createNewAssignment({
                    title: formData.title,
                    description: formData.description,
                    owner_user_id: auth.currentUser.uid,
                    dataset: db,
                    questions: formData.questions,
                    student_class: formData.student_class,
                    dueDate: formData.due_date,
                    enable_submission_notification: formData.enable_submission_notification,
                    reminder_interval: formData.reminder_interval,
                    created_on: new Date(),
                    updated_on: new Date(),
                  });
                  setAssignmentId(id);
                  const cohort = cohorts.find((c) => c.cohort_id === formData.student_class);
                  if (cohort?.student_uids?.length) {
                    const allStudents = await getAllStudents();
                    const cohortStudents = allStudents.filter((s) => cohort.student_uids.includes(s.uid));
                    await Promise.all(
                      cohortStudents.map((s) => sendAssignmentEmail(s, formData.title, formData.due_date, id))
                    );
                  }
                  onDone();
                } catch (err) {
                  setError("Failed to assign cohort: " + err.message);
                }
              }}
            >
              Create Assignments
            </button>
            <button type="button" onClick={handlePublish}>Publish Assignments</button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;
