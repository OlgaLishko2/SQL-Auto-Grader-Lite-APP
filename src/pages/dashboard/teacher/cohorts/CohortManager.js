import { useState, useEffect } from "react";
import { getAllStudents, getCohortsByOwner, createCohort, updateCohort } from "../../../../components/model/cohorts";
import CollapsiblePanel from "../assignmentform/collapsiblepanel/CollapsiblePanel";
import userSession from "../../../../components/services/UserSession";
import "./CohortManager.css";

function CohortManager() {
  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(null); 

  useEffect(() => {
    getAllStudents().then(setStudents);
    getCohortsByOwner(userSession.uid).then(setCohorts);
  }, []);

  const toggleStudent = (uid) =>
    setSelected(prev => prev.includes(uid) ? prev.filter(u => u !== uid) : [...prev, uid]);

  const toggleCohort = (id) => setExpanded(prev => (prev === id ? null : id));

  const handleCreate = async () => {
    if (!name.trim() || selected.length === 0) return alert("Enter name and select students.");
    const id = await createCohort({ name, owner_user_id: userSession.uid, student_uids: selected, created_on: new Date() });
    setCohorts(prev => [...prev, { cohort_id: id, name, student_uids: selected }]);
    setName("");
    setSelected([]);
    setExpanded(null);
  };

  const handleSaveEdit = async (cohort) => {
    await updateCohort(cohort.cohort_id, selected);
    setCohorts(prev => prev.map(c => c.cohort_id === cohort.cohort_id ? { ...c, student_uids: selected } : c));
    setExpanded(null);
  };

const renderStudentList = () => (
  <div className="student-selection-wrapper border rounded bg-white shadow-sm mt-2">
    <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
      <span className="text-uppercase small font-weight-bold text-gray-700">
        <i className="fas fa-users mr-2"></i>Members: {selected.length}
      </span>
      <button 
        type="button" 
        className="btn btn-outline-primary btn-sm" 
        onClick={() => setSelected(selected.length === students.length ? [] : students.map(s => s.uid))}
      >
        {selected.length === students.length ? "Deselect All" : "Select All Students"}
      </button>
    </div>
    
    <div className="student-scroll-list p-2">
      {students.map(s => (
        <div 
          key={s.uid} 
          className={`student-row d-flex align-items-center justify-content-between p-3 rounded mb-2 ${selected.includes(s.uid) ? 'bg-selected' : ''}`}
          onClick={() => toggleStudent(s.uid)}
          style={{ cursor: 'pointer', border: '1px solid #e3e6f0' }}
        >
          <div className="d-flex align-items-center">
            <div className="custom-check-box mr-3">
              <input 
                type="checkbox" 
                checked={selected.includes(s.uid)} 
                readOnly
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>
            <div className="student-main-info">
              <span className="h6 mb-0 font-weight-bold text-gray-800">{s.fullName}</span>
            </div>
          </div>
          
          <div className="student-email-info">
            <span className="text-gray-500 small font-italic">{s.email}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
  return (
    <div className="container-fluid py-4">
  
      <div className="d-sm-flex align-items-center justify-content-between mb-4 px-3">
        <h1 className="h3 mb-0 text-gray-800 font-weight-bold">Cohorts</h1>
        <button 
          onClick={() => {
            setName("");
            setSelected([]);
            toggleCohort("create");
          }} 
          className={`btn ${expanded === "create" ? 'btn-secondary' : 'btn-success'} btn-icon-split shadow-sm`}
        >
          <span className="icon text-white-50">
            <i className={`fas ${expanded === "create" ? 'fa-times' : 'fa-plus'}`}></i>
          </span>
          <span className="text">{expanded === "create" ? "Cancel" : "New Cohort"}</span>
        </button>
      </div>

      <div className="cohort-list-container px-3">
       
        {expanded === "create" && (
          <div className="card shadow mb-4 border-left-success">
            <div className="card-header py-3 bg-white">
              <h6 className="m-0 font-weight-bold text-success text-uppercase">Create New Cohort</h6>
            </div>
            <div className="card-body bg-light">
              <label className="small font-weight-bold text-gray-600">COHORT NAME</label>
              <input
                className="form-control mb-3"
                placeholder="Enter cohort name..."
                value={name}
                onChange={e => setName(e.target.value)}
              />
              {renderStudentList()}
              <button onClick={handleCreate} className="btn btn-success btn-block mt-3 shadow-sm">
                <i className="fas fa-check mr-2"></i> Create Cohort
              </button>
            </div>
          </div>
        )}

      
        {cohorts.map((c) => (
          <div key={c.cohort_id} className="card shadow mb-3 border-left-primary">
            <CollapsiblePanel
              title={c.name}
              preview={`${c.student_uids?.length || 0} students enrolled`}
              isCollapsed={expanded !== c.cohort_id}
              onToggle={() => {
                setSelected(c.student_uids ?? []);
                toggleCohort(c.cohort_id);
              }}
            >
              <div className="card-body bg-light border-top">
                <h6 className="font-weight-bold text-primary mb-3">
                  <i className="fas fa-user-graduate mr-2"></i>Edit Cohort Members
                </h6>
                {renderStudentList()}
                <div className="d-flex justify-content-end">
                  <button onClick={() => handleSaveEdit(c)} className="btn btn-primary shadow-sm px-4">
                    <i className="fas fa-save mr-2"></i> Save Changes
                  </button>
                </div>
              </div>
            </CollapsiblePanel>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CohortManager;