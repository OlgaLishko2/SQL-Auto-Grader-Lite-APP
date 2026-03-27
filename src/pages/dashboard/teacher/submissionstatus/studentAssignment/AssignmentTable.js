import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStudentAssignmentsWithDetails } from "../../../../../components/model/studentAssignments";
import userSession from "../../../../../components/services/UserSession";
import StudentAssignmentPage from "./StudentAssignmentPage";
import "./..//Submission.css";

export default function AssignmentTable({ onSelectStudent, onselectAssignmentId }) {
  const Navigate = useNavigate()
  const [data, setData] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");
  const [selected, setSelected] = useState(null);
  const [preselectedUsed, setPreselectedUsed] = useState(false);
  
  const location = useLocation();
  const preselectedId = location.state?.student_assignment_id;

  useEffect(() => {
    const fetchData = async () => {
      const merged = await getStudentAssignmentsWithDetails(userSession.uid);
      setData(merged);
      if (preselectedId && !preselectedUsed) {
        const match = merged.find(item => item.student_assignment_id === preselectedId || item.id === preselectedId);
        if (match) setSelected(match);
        setPreselectedUsed(true);
      }
    };
    if (!selected) fetchData();
  }, [selected, preselectedId, preselectedUsed]);


  const sortedData = [...data].sort((a, b) => {
    if (sortField) {
      const valueA = a[sortField]?.toString().toLowerCase();
      const valueB = b[sortField]?.toString().toLowerCase();
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    const aTime = a.submissionDate && a.submissionDate !== "-" ? new Date(a.submissionDate) : new Date(a.assigned_on);
    const bTime = b.submissionDate && b.submissionDate !== "-" ? new Date(b.submissionDate) : new Date(b.assigned_on);
    return bTime - aTime;
  });

  const filteredData = sortedData.filter(item =>
    item.status !== "created" &&
    (item.studentName.toLowerCase().includes(filterText.toLowerCase()) ||
    item.assignmentTitle.toLowerCase().includes(filterText.toLowerCase()) ||
    item.status.toLowerCase().includes(filterText.toLowerCase()))
  );

  if (selected) return (
    <StudentAssignmentPage 
      studentId={selected.student_user_id} 
      assignmentId={selected.assignment_id} 
      assignmentTitle={selected.assignmentTitle} 
      onBack={() => setSelected(null)} 
    />
  );

  return (
    <div className="card-body p-0"> 
      

      <div className="row mb-4 px-3 pt-3">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-light border-0 small"
              placeholder="Search by name, title, status..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <div className="input-group-append">
              <button className="btn btn-primary" type="button">
                <i className="fas fa-search fa-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <select className="form-control custom-select" onChange={(e) => setSortField(e.target.value)}>
            <option value="">Sort By</option>
            <option value="studentName">Student Name</option>
            <option value="assignmentTitle">Assignment Title</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="col-md-3">
          <select className="form-control custom-select" onChange={(e) => setSortDirection(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

  
      <div className="table-responsive px-3">
        <table className="table table-hover table-bordered" width="100%" cellSpacing="0">
          <thead className="bg-light">
            <tr>
              <th style={{ width: "20%" }}>Student Name</th>
              <th style={{ width: "30%" }}>Assignment Title</th>
              <th>Mark</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map(item => {
              const isLate = item.dueDate && item.updated_on && new Date(item.updated_on) > new Date(item.dueDate);
              const isSubmitted = item.status === "submitted" || item.status === "completed";
              
              return (
                <tr key={item.id} className={isLate ? "table-danger" : ""}>
                  <td className="font-weight-bold">{item.studentName}</td>
                  <td>{item.assignmentTitle}</td>
                  <td>{isSubmitted ? `${item.earnedMarks ?? 0} / ${item.totalMarks ?? 0}` : "-"}</td>
                  <td>{item.due_on || item.dueDate || "-"}</td>
                  <td>
                    <span className={`badge ${item.status === 'submitted' ? 'badge-warning' : item.status === 'completed' ? 'badge-success' : 'badge-secondary'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.status === "submitted" ? (
                      <button 
                        className="btn btn-primary btn-sm btn-block"
                        onClick={() => {
                          onSelectStudent(item.student_user_id);
                          onselectAssignmentId(item.assignment_id);
                        }}
                      >
                        Check & Grade
                      </button>
                    ) : (
                      <span className="text-muted small text-uppercase font-weight-bold">{item.status}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}