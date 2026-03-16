import { useState, useEffect } from 'react';
import CreateQuestionSet from '../createquestionset/CreateQuestionSet';
import { auth, db } from "../../../../firebase"; 
import { createNewAssignment } from "../../../../components/model/assignments"
import { getCohortsByOwner } from "../../../../components/model/cohorts";

const AssignmentForm = ({ onDone }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '', total_marks: '', due_date: '', description: '',
    student_class: '',
    enable_submission_notification: false, reminder_interval: 0
  });
  //once assignment is created, id should be retirieved from firestore table
  const [assignmentId, setAssignmentId] = useState("");
  const [savedQuestionCount, setSavedQuestionCount] = useState(0);
  const [cohorts, setCohorts] = useState([]);

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
      try {
        const assignment = {
          title: formData.title,
          description: formData.description,
          owner_user_id: auth.currentUser.uid,
          dataset: "DatasetA",
          created_on: new Date(),
          updated_on: new Date(),
          dueDate: formData.due_date,
        };
        console.log("Creating assignment:", assignment);
        const id = await createNewAssignment(assignment);
        console.log("Created assignment ID:", id);
        if (!id) throw new Error("No ID returned from Firestore");
        setAssignmentId(id);
      } catch (err) {
        setError("Failed to create assignment: " + err.message);
        return;
      }
    }
    setActiveTab(activeTab + 1);
  };

  const tabRequiredFields = [
    ['title', 'description', 'total_marks', 'due_date'],
    ['student_class'],
  ];

  const isTabComplete = (tabIndex) =>
    tabRequiredFields[tabIndex]?.every((f) => String(formData[f]).trim() !== '') ?? true;

  const tabs = ['Create Assignment', 'Assign Students', 'Add Questions'];

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
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label htmlFor="title">Title</label>
              <input
                id="title" name="title" placeholder="Assignment title"
                value={formData.title} onChange={handleChange}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description" name="description" placeholder="Describe the assignment..."
                value={formData.description} onChange={handleChange}
                rows={4}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <label htmlFor="total_marks">Total Marks</label>
                <input
                  id="total_marks" type="number" min="1" name="total_marks" placeholder="e.g. 100"
                  value={formData.total_marks} onChange={handleChange}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <label htmlFor="due_date">Due Date</label>
                <input
                  id="due_date" type="date" name="due_date"
                  value={formData.due_date} onChange={handleChange}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
            </div>
          </div>
        )}
        {activeTab === 1 && (
          <div>
            <label>Student Cohort: </label><br/>
            <select name="student_class" value={formData.student_class} onChange={handleChange}>
              <option value="">-- Select Cohort --</option>
              <option value="all">All Students</option>
              {cohorts.map((c) => (
                <option key={c.cohort_id} value={c.cohort_id}>{c.name}</option>
              ))}
            </select><br/><br/>
            <label htmlFor='enable_submission_notification'>Enable Notification(on submission): </label>
            <input name="enable_submission_notification" type="checkbox" checked={formData.enable_submission_notification} onChange={handleChange} /><br/>
            <label htmlFor='reminder_interval'>Reminder Interval: </label>
            <input name="reminder_interval" type="checkbox" checked={formData.reminder_interval} onChange={handleChange} />
          </div>
        )}              
        {activeTab === 2 && (
          <CreateQuestionSet assgnmntId={assignmentId} onSaved={setSavedQuestionCount} />
        )}

        <div style={{ marginTop: '20px' }}>
          {activeTab < 2 && (
            <button type="button" disabled={!isTabComplete(activeTab)} onClick={handleNext}>Next</button>
          )}
          {error && <span style={{ marginLeft: "12px", color: "red" }}>{error}</span>}
          {activeTab === 2 && savedQuestionCount === 0 && (
            <span style={{ color: "red" }}>Save at least one question before submitting.</span>
          )}
          {activeTab === 2 && savedQuestionCount > 0 && (
            <button type="button" onClick={onDone}>Finish & Go to Assignments</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;
