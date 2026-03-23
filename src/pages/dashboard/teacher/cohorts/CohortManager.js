import { useState, useEffect } from "react";
import { getAllStudents, getCohortsByOwner, createCohort, updateCohort } from "../../../../components/model/cohorts";
import userSession from "../../../../services/UserSession";

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
    setSelected((prev) => prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]);

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
    setCohorts((prev) => [...prev, { cohort_id: id, name, student_uids: selected }]);
    closePanel();
    alert(`Cohort "${name}" created!`);
  };

  const handleSaveEdit = async (cohort) => {
    await updateCohort(cohort.cohort_id, selected);
    setCohorts((prev) => prev.map((c) => c.cohort_id === cohort.cohort_id ? { ...c, student_uids: selected } : c));
    closePanel();
  };

  const studentList = (
    <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid #eee", padding: "10px", marginBottom: "10px" }}>
      {students.map((s) => (
        <label key={s.uid} style={{ display: "block", marginBottom: "6px" }}>
          <input type="checkbox" checked={selected.includes(s.uid)} onChange={() => toggleStudent(s.uid)} />
          {" "}{s.fullName} — {s.email}
        </label>
      ))}
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Cohorts</h2>
        <button
          type="button"
          onClick={openPanel === "create" ? closePanel : openCreate}
          style={{ padding: "8px 16px", backgroundColor: "black", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          {openPanel === "create" ? "Cancel" : "+ Create New Cohort"}
        </button>
      </div>

      {openPanel === "create" && (
        <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "4px", marginBottom: "20px" }}>
          <h3 style={{ marginTop: 0 }}>New Cohort</h3>
          <input
            placeholder="Cohort name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "12px", padding: "6px", width: "250px", display: "block" }}
          />
          <div style={{ marginBottom: "8px" }}>
            <button type="button" onClick={() => setSelected(students.map((s) => s.uid))} style={{ marginRight: "8px" }}>Select All</button>
            <button type="button" onClick={() => setSelected([])}>Clear</button>
          </div>
          {studentList}
          <button onClick={handleCreate} style={{ padding: "6px 16px", backgroundColor: "black", color: "white" }}>
            Create Cohort
          </button>
        </div>
      )}

      <div>
        {cohorts.map((c) => (
          <div key={c.cohort_id} style={{ border: "1px solid #ccc", padding: "10px 16px", marginBottom: "8px", borderRadius: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{c.name}</strong>
                <span style={{ marginLeft: "12px", color: "#666" }}>{c.student_uids?.length ?? 0} students</span>
              </div>
              <button type="button" onClick={() => openPanel === c.cohort_id ? closePanel() : openEdit(c)}>
                {openPanel === c.cohort_id ? "Cancel" : "Edit Members"}
              </button>
            </div>

            {openPanel === c.cohort_id && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <button type="button" onClick={() => setSelected(students.map((s) => s.uid))} style={{ marginRight: "8px" }}>Select All</button>
                  <button type="button" onClick={() => setSelected([])}>Clear</button>
                </div>
                {studentList}
                <button onClick={() => handleSaveEdit(c)} style={{ padding: "6px 16px", backgroundColor: "black", color: "white" }}>
                  Save Members
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CohortManager;
