import { useState, useEffect } from "react";
import { getAllStudents, getCohortsByOwner, createCohort, updateCohort } from "../../../../components/model/cohorts";
import userSession from "../../../../components/services/UserSession";
import "./CohortManager.css";

function CohortManager() {
  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [openPanel, setOpenPanel] = useState(null); // "create" | cohort_id | null

  useEffect(() => {
    getAllStudents().then(setStudents);
    getCohortsByOwner(userSession.uid).then(setCohorts);
  }, []);

  const toggleStudent = (uid) =>
    setSelected(prev => prev.includes(uid) ? prev.filter(u => u !== uid) : [...prev, uid]);

  const openCreate = () => {
    setName("");
    setSelected([]);
    setOpenPanel("create");
  };

  const openEdit = (cohort) => {
    setSelected(cohort.student_uids ?? []);
    setOpenPanel(cohort.cohort_id);
  };

  const closePanel = () => {
    setOpenPanel(null);
    setSelected([]);
  };

  const handleCreate = async () => {
    if (!name.trim() || selected.length === 0) return alert("Enter a name and select at least one student.");
    const id = await createCohort({ name, owner_user_id: userSession.uid, student_uids: selected, created_on: new Date() });
    setCohorts(prev => [...prev, { cohort_id: id, name, student_uids: selected }]);
    closePanel();
    alert(`Cohort "${name}" created!`);
  };

  const handleSaveEdit = async (cohort) => {
    await updateCohort(cohort.cohort_id, selected);
    setCohorts(prev => prev.map(c => c.cohort_id === cohort.cohort_id ? { ...c, student_uids: selected } : c));
    closePanel();
  };

  const studentList = (
    <div className="student-list">
      {students.map(s => (
        <label key={s.uid}>
          <input type="checkbox" checked={selected.includes(s.uid)} onChange={() => toggleStudent(s.uid)} />
          {" "}{s.fullName} — {s.email}
        </label>
      ))}
    </div>
  );

  return (
    <div className="cohort-manager">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Cohorts</h2>
        <button
          type="button"
          onClick={openPanel === "create" ? closePanel : openCreate}
          className="cohort-btn create-cohort-btn"
        >
          {openPanel === "create" ? "Cancel" : "+ Create New Cohort"}
        </button>
      </div>

      {openPanel === "create" && (
        <div className="cohort-panel">
          <h3>New Cohort</h3>
          <input
            placeholder="Cohort name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ marginBottom: "12px", padding: "8px", width: "300px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <div style={{ marginBottom: "12px" }}>
            <button type="button" onClick={() => setSelected(selected.length === students.length ? [] : students.map(s => s.uid))} className="cohort-btn select-all-btn">
              {selected.length === students.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          {studentList}
          <button onClick={handleCreate} className="cohort-btn black-btn">Create Cohort</button>
        </div>
      )}

      {cohorts.map(c => (
        <div key={c.cohort_id} className="cohort-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{c.name}</strong>
              <span style={{ marginLeft: "12px", color: "#666" }}>{c.student_uids?.length ?? 0} students</span>
            </div>
            <button
              type="button"
              onClick={() => openPanel === c.cohort_id ? closePanel() : openEdit(c)}
              className="cohort-btn edit-btn"
            >
              {openPanel === c.cohort_id ? "Cancel" : "Edit Members"}
            </button>
          </div>

          {openPanel === c.cohort_id && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ marginBottom: "8px" }}>
                <button type="button" onClick={() => setSelected(selected.length === students.length ? [] : students.map(s => s.uid))} className="cohort-btn select-all-btn">
                  {selected.length === students.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              {studentList}
              <button onClick={() => handleSaveEdit(c)} className="cohort-btn edit-btn">Save Members</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CohortManager;
