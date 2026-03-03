import React, { useState } from 'react';
import CreateQuestionSet from '../createquestionset/CreateQuestionSet';

const AssignmentForm = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    // Tab 1: Assignment info
    title: '', total_marks: '',due_date: '',description: '',
    // Tab 2: questions setting
    question_set: '', points: '', question_type: '',
    // Tab 3: students per assignment
    student_class: '', 
    // Tab 4: publish
    enable_submission_notification: false, reminder_interval: 0
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Final Form Submission with data:', formData);
    alert('Form Submitted');
  };

  const tabs = ['Create Assignment', 'Question Details', 'Add Questions', 'Assign Students'];

  return (
    <div style={{ maxWidth: 'auto', margin: '20px auto', border: '1px solid #ccc', padding: '20px' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {tabs.map((tab, index) => (
          <button 
            key={tab} 
            type="button"
            onClick={() => setActiveTab(index)}
            style={{ fontWeight: activeTab === index ? 'bold' : 'normal' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        {activeTab === 0 && (
          <div>
            <label htmlFor='title'>Title: </label>
            <input name="title" placeholder="title" value={formData.title} onChange={handleChange} /><br/>
            <label htmlFor='total_marks'>Total Marks: </label>
            <input name="total_marks" placeholder="total marks" value={formData.total_marks} onChange={handleChange} /><br/>
            <label htmlFor='due_date'>Due Date: </label>
            <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} /><br/>
            <label htmlFor='description'>Description: </label>
            <input name="description" placeholder="description" value={formData.description} onChange={handleChange} /><br/> 
            </div>
        )}
        {activeTab === 1 && (
          <div>
            <label htmlFor='question_set'>Question set: </label>
            <input name="question_set" placeholder="questions" value={formData.question_set} onChange={handleChange} /><br/>
            <label htmlFor=''>Points per question: </label>
            <input name="points" placeholder="points" value={formData.points} onChange={handleChange} />
            <label htmlFor="question_type">Question type: </label>
            <input name="question_type"  placeholder="Type" value={formData.question_type} onChange={handleChange} /><br/>
          </div>
        )}
        {activeTab === 2 && (
          <CreateQuestionSet />
        )}
        {activeTab === 3 && (
          <div>
            <label htmlFor='student_class'>Student Cohort: </label>
            <input name="student_class" type="checkbox" checked={formData.student_class} onChange={handleChange} /><br/> 
            <label htmlFor='enable_submission_notification'>Enable Notification(on submission): </label>
            <input name="enable_submission_notification" type="checkbox" checked={formData.enable_submission_notification} onChange={handleChange} /><br/>
            <label htmlFor='reminder_interval'>Reminder Interval: </label>
            <input name="reminder_interval"type="checkbox" checked={formData.reminder_interval} onChange={handleChange} />
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          {activeTab < 3 ? (
            <button type="button" onClick={() => setActiveTab(activeTab + 1)}>Next</button>
          ) : (
            <button type="submit">Save and Publish</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;
