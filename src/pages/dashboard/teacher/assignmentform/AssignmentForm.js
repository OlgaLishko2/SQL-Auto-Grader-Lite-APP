import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateQuestionSet from './createquestionset/CreateQuestionSet';
import { createNewAssignment } from "../../../../components/model/assignments";
import { getCohortsByOwner, getAllStudents } from "../../../../components/model/cohorts";
import { CreateAssignment } from './createquestionset/CreateAssignment';
import { sendAssignmentEmail } from "../../../../components/services/email";
import { publishAssignmentToStudents } from "../../../../components/model/studentAssignments";
import userSession from "../../../../components/services/UserSession";

const AssignmentForm = ({ onDone }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [db, setDb] = useState("");
  const [formData, setFormData] = useState({
    title: '', total_marks: '', due_date: '', description: '',
    student_class: '', questions: [], grading_policy: 'best',
    enable_submission_notification: false, reminder_interval: false
  });
  const [cohorts, setCohorts] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getCohortsByOwner(userSession.uid).then(setCohorts);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNext = async () => {
    setError("");
    if (activeTab === 0 && !userSession.uid) {
      setError("You must be logged in to create an assignment.");
      return;
    }
    setActiveTab(activeTab + 1);
  };

  const tabRequiredFields = [
    ['title', 'description', 'due_date'],
    [],
    ['student_class'],
  ];

  const isTabComplete = (tabIndex) =>
    tabRequiredFields[tabIndex]?.every((f) => String(formData[f]).trim() !== '') ?? true;

  const tabs = ['Create Assignment', 'Add Questions', 'Assign Students'];

  const buildAssignmentPayload = () => ({
    title: formData.title,
    description: formData.description,
    owner_user_id: userSession.uid,
    dataset: db,
    questions: formData.questions,
    student_class: formData.student_class,
    dueDate: formData.due_date,
    enable_submission_notification: formData.enable_submission_notification,
    reminder_interval: formData.reminder_interval,
    created_on: new Date(),
    updated_on: new Date(),
  });

  const sendEmailsToStudents = async (id) => {
    const cohort = cohorts.find(c => c.cohort_id === formData.student_class);
    if (!cohort?.student_uids?.length) return;
    const allStudents = await getAllStudents();
    const cohortStudents = allStudents.filter(s => cohort.student_uids.includes(s.uid));
    await Promise.all(cohortStudents.map(s => sendAssignmentEmail(s, formData.title, formData.due_date, id)));
  };

  const handleSave = async () => {
    if (formData.questions.length === 0) { alert("The assignment needs at least one question."); return; }
    try {
      const id = await createNewAssignment(buildAssignmentPayload());
      setAssignmentId(id);
      await sendEmailsToStudents(id);
      alert("Assignment saved.");
    } catch (err) {
      setError("Failed to save: " + err.message);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("Are you sure you want to publish?")) return;
    try {
      let id = assignmentId;
      if (!id) {
        if (formData.questions.length === 0) { alert("The assignment needs at least one question."); return; }
        id = await createNewAssignment(buildAssignmentPayload());
        setAssignmentId(id);
      }
      const result = await publishAssignmentToStudents(id, formData.student_class, formData.due_date);
      if (result.success) {
        await sendEmailsToStudents(id);
        alert("Assignment published!");
        onDone();
      } else alert("Failed to publish: " + result.message);
    } catch (err) {
      setError("Failed to publish: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 'auto', margin: '20px auto', border: '1px solid #ccc', padding: '20px' }}>
      {onDone && <button type="button" onClick={onDone} style={{ marginBottom: "16px" }}>← Back to Assignments</button>}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {tabs.map((tab, index) => {
          const unlocked = index === 0 || [...Array(index)].every((_, i) => isTabComplete(i));
          return (
            <button key={tab} type="button" onClick={() => unlocked && setActiveTab(index)} disabled={!unlocked}
              style={{ fontWeight: activeTab === index ? 'bold' : 'normal', opacity: unlocked ? 1 : 0.35, cursor: unlocked ? 'pointer' : 'not-allowed' }}>
              {tab}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === 0 && <CreateAssignment formData={formData} handleChange={handleChange} />}

        {activeTab === 1 && (
          <CreateQuestionSet onAddQuestions={(qs) => setFormData(prev => ({ ...prev, questions: qs }))} setDb={setDb} />
        )}

        {activeTab === 2 && (
          <div>
            <label>Student Cohort: </label><br />
            {cohorts.length === 0 ? (
              <p style={{ color: "red", marginTop: "8px" }}>
                No cohorts found.{" "}
                <span onClick={() => navigate("/dashboard/cohorts")} style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}>
                  Create a cohort first
                </span>
              </p>
            ) : (
              <>
                <select name="student_class" value={formData.student_class} onChange={handleChange}>
                  <option value="">-- Select Cohort --</option>
                  {cohorts.map(c => <option key={c.cohort_id} value={c.cohort_id}>{c.name}</option>)}
                </select><br /><br />
              </>
            )}
            <label>Enable Notification (on submission): </label>
            <input name="enable_submission_notification" type="checkbox" checked={formData.enable_submission_notification} onChange={handleChange} /><br />
            <label>Reminder Interval: </label>
            <input name="reminder_interval" type="checkbox" checked={formData.reminder_interval} onChange={handleChange} />
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          {activeTab < 2 && (
            <button type="button" disabled={!isTabComplete(activeTab)} onClick={handleNext}>Next</button>
          )}
          {activeTab === 2 && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" disabled={!isTabComplete(2)} onClick={handleSave}>Save Assignment</button>
              <button type="button" disabled={!isTabComplete(2)} onClick={handlePublish}>Create & Publish Assignment</button>
            </div>
          )}
          {error && <span style={{ marginLeft: "12px", color: "red" }}>{error}</span>}
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;
