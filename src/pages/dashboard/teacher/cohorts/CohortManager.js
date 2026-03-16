import { useState, useEffect } from "react";
import { auth } from "../../../../firebase";
import { getAllStudents, getCohortsByOwner, createCohort, updateCohort } from "../../../../components/model/cohorts";

function CohortManager() {
  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null); // cohort being edited

  useEffect(() => {
    getAllStudents().then(setStudents);
    getCohortsByOwner(auth.currentUser.uid).then(setCohorts);
  }, []);

  const toggleStudent = (uid) =>
    setSelected((prev) => prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]);

  const selectAll = () => setSelected(students.map((s) => s.uid));

  const handleCreate = async () => {
    if (!name.trim() || selected.length === 0) return alert("Enter a name and select at least one student.");
    const id = await createCohort({ name, owner_user_id: auth.currentUser.uid, student_uids: selected, created_on: new Date() });
    setCohorts((prev) => [...prev, { cohort_id: id, name, student_uids: selected }]);
    setName("");
    setSelected([]);
    alert(`Cohort "${name}" created!`);
  };

  const startEdit = (cohort) => {
    setEditing(cohort.cohort_id);
    setSelected(cohort.student_uids ?? []);
  };

  const handleSaveEdit = async (cohort) => {
    await updateCohort(cohort.cohort_id, selected);
    setCohorts((prev) => prev.map((c) => c.cohort_id === cohort.cohort_id ? { ...c, student_uids: selected } : c));
    setEditing(null);
    setSelected([]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Cohorts</h2>

      <div style={{ marginBottom: "30px" }}>
        <div style={{ border: "1px solid #ccc", padding: "10px 16px", marginBottom: "8px", borderRadius: "4px", backgroundColor: "#f0f0f0" }}>
          <strong>All Students</strong>
          <span style={{ marginLeft: "12px", color: "#666" }}>{students.length} students (default)</span>
        </div>
        {cohorts.map((c) => (
          <div key={c.cohort_id} style={{ border: "1px solid #ccc", padding: "10px 16px", marginBottom: "8px", borderRadius: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{c.name}</strong>
                <span style={{ marginLeft: "12px", color: "#666" }}>{c.student_uids?.length ?? 0} students</span>
              </div>
              <button type="button" onClick={() => editing === c.cohort_id ? setEditing(null) : startEdit(c)}>
                {editing === c.cohort_id ? "Cancel" : "Edit Members"}
              </button>
            </div>

            {editing === c.cohort_id && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <button type="button" onClick={selectAll} style={{ marginRight: "8px" }}>Select All</button>
                  <button type="button" onClick={() => setSelected([])}>Clear</button>
                </div>
                <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid #eee", padding: "10px", marginBottom: "10px" }}>
                  {students.map((s) => (
                    <label key={s.uid} style={{ display: "block", marginBottom: "6px" }}>
                      <input type="checkbox" checked={selected.includes(s.uid)} onChange={() => toggleStudent(s.uid)} />
                      {" "}{s.fullName} — {s.email}
                    </label>
                  ))}
                </div>
                <button onClick={() => handleSaveEdit(c)} style={{ padding: "6px 16px", backgroundColor: "black", color: "white" }}>
                  Save Members
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <h3>Create New Cohort</h3>
      <input
        placeholder="Cohort name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginBottom: "12px", padding: "6px", width: "250px" }}
      />
      <div style={{ marginBottom: "8px" }}>
        <button type="button" onClick={selectAll} style={{ marginRight: "8px" }}>Select All</button>
        <button type="button" onClick={() => setSelected([])}>Clear</button>
      </div>
      <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #eee", padding: "10px", marginBottom: "12px" }}>
        {students.map((s) => (
          <label key={s.uid} style={{ display: "block", marginBottom: "6px" }}>
            <input type="checkbox" checked={selected.includes(s.uid)} onChange={() => toggleStudent(s.uid)} />
            {" "}{s.fullName} — {s.email}
          </label>
        ))}
      </div>
      <button onClick={handleCreate} style={{ padding: "8px 20px", backgroundColor: "black", color: "white" }}>
        Create Cohort
      </button>
    </div>
  );
}

export default CohortManager;
