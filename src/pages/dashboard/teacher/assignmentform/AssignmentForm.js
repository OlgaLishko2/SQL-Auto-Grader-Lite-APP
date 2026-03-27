import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
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
    student_class: '', questions: [],
    enable_submission_notification: false, reminder_interval: false
  });
  const [cohorts, setCohorts] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [error, setError] = useState("");

  const [cohortsLoaded, setCohortsLoaded] = useState(false);

  useEffect(() => {
    getCohortsByOwner(userSession.uid).then(data => {
      setCohorts(data);
      setCohortsLoaded(true);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'due_date') setError("");
  };

  const handleNext = async () => {
    setError("");
    if (activeTab === 0 && !userSession.uid) {
      setError("You must be logged in to create an assignment.");
      return;
    }
    if (activeTab === 0 && formData.due_date) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(formData.due_date) < today) {
        setError("Due date cannot be in the past.");
        return;
      }
    }
    const next = activeTab + 1;
    setActiveTab(next);
  };

  const tabRequiredFields = [
    ['title', 'due_date'],
    [],
    ['student_class'],
  ];

  const isTabComplete = (tabIndex) =>
    tabRequiredFields[tabIndex]?.every((f) => String(formData[f]).trim() !== '') ?? true;

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
    const allCohorts = await getCohortsByOwner(userSession.uid);
    console.log('[email] cohorts found:', allCohorts.length, 'student_class:', formData.student_class);
    const cohort = allCohorts.find(c => c.cohort_id === formData.student_class);
    console.log('[email] matched cohort:', cohort);
    if (!cohort?.student_uids?.length) { console.warn('[email] no students in cohort, aborting'); return; }
    const allStudents = await getAllStudents();
    const cohortStudents = allStudents.filter(s => cohort.student_uids.includes(s.uid));
    console.log('[email] sending to', cohortStudents.map(s => s.email));
    await Promise.all(cohortStudents.map(s => sendAssignmentEmail(s, formData.title, formData.due_date, id)));
  };

  const validateDueDate = () => {
    const date = new Date(formData.due_date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date < today) { setError("Due date cannot be in the past."); return false; }
    if (date.getFullYear() > 2100) { setError("Please enter a valid due date."); return false; }
    return true;
  };

  const handleSave = async () => {
    if (formData.questions.length === 0) { alert("The assignment needs at least one question."); return; }
    if (!validateDueDate()) return;
    try {
      const id = await createNewAssignment(buildAssignmentPayload());
      setAssignmentId(id);
      // await sendEmailsToStudents(id);
      alert("Assignment saved.");
    } catch (err) {
      setError("Failed to save: " + err.message);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("Are you sure you want to publish?")) return;
    if (!validateDueDate()) return;
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

  const tab0Content = () => <CreateAssignment formData={formData} handleChange={handleChange} />;

  const tab1Content = () => (
    <CreateQuestionSet
      onAddQuestions={(qs) => setFormData(prev => ({ ...prev, questions: qs }))}
      setDb={setDb}
      existingQuestions={formData.questions}
      existingDataset={db}
    />
  );

  const tab2Content = () => (
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
      <label>Would you like to be notified when a student submits this assignment?: </label>
      <input name="enable_submission_notification" type="checkbox" checked={formData.enable_submission_notification} onChange={handleChange} /><br />
      <label>Would you like to remind students to submit this assignment?: </label>
      <input name="reminder_interval" type="checkbox" checked={formData.reminder_interval} onChange={handleChange} />
    </div>
  );

  // const onTabSelecting = (args) => {
  //   const targetIndex = args.selectingIndex;
  //   const unlocked = targetIndex === 0 || [...Array(targetIndex)].every((_, i) => isTabComplete(i));
  //   if (!unlocked) args.cancel = true;
  //   else setActiveTab(targetIndex);
  // };

  return (
    <div style={{ maxWidth: 'auto', margin: '20px auto', padding: '20px' }}>
      {onDone && <button type="button" onClick={onDone} style={{ marginBottom: "16px" }}>← Back to Assignments</button>}
      {cohortsLoaded && cohorts.length === 0 ? (
        <div style={{ padding: '20px', border: '1px solid #f5c6cb', borderRadius: '8px', background: '#fff3f3', color: '#721c24' }}>
          <strong>No cohorts found.</strong> You need to create at least one cohort before creating an assignment.{" "}
          <span onClick={() => navigate("/dashboard/cohorts")} style={{ color: "#0056b3", cursor: "pointer", textDecoration: "underline" }}>
            Create a cohort now
          </span>
        </div>
      ) : (
        <>
          <Tabs selectedIndex={activeTab} onSelect={(index) => {
            const unlocked = index === 0 || [...Array(index)].every((_, i) => isTabComplete(i));
            if (unlocked) setActiveTab(index);
          }}>
            <TabList>
              <Tab disabled={false}>Create Assignment</Tab>
              <Tab disabled={!isTabComplete(0)}>Add Questions</Tab>
              <Tab disabled={!isTabComplete(0) || !isTabComplete(1)}>Assign Students</Tab>
            </TabList>
            <TabPanel>{tab0Content()}</TabPanel>
            <TabPanel>{tab1Content()}</TabPanel>
            <TabPanel>{tab2Content()}</TabPanel>
          </Tabs>
          <div style={{ marginTop: '20px' }}>
            {activeTab > 0 && (
              <button type="button" style={{ marginRight: '10px' }} onClick={() => setActiveTab(prev => prev - 1)}>
                ← Back
              </button>
            )}
            {activeTab < 2 && (
              <button type="button" onClick={handleNext}>Next →</button>
            )}
            {activeTab === 2 && (
              <>
                <button type="button" style={{ marginRight: '10px' }} disabled={!isTabComplete(2)} onClick={handleSave}>Save Assignment</button>
                <button type="button" disabled={!isTabComplete(2)} onClick={handlePublish}>Create & Publish Assignment</button>

              </>
            )}
            {error && <span style={{ marginLeft: "12px", color: "red" }}>{error}</span>}</div>
        </>
      )}
    </div>
  );
};

export default AssignmentForm;
