import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStudentAssignmentsWithDetails } from "../../../../../components/model/studentAssignments";
import userSession from "../../../../../components/services/UserSession";
import StudentAssignmentPage from "./StudentAssignmentPage"

export default function AssignmentTable({ onSelectStudent, onselectAssignmentId }) {
  const Navigate = useNavigate()
  const [data, setData] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");
  const [selected, setSelected] = useState(null);
  const location = useLocation();
  const preselectedId = location.state?.student_assignment_id;

  /*sorting logic*/
  const sortedData = [...data].sort((a, b) => {
    if (sortField) {
      const valueA = a[sortField]?.toString().toLowerCase();
      const valueB = b[sortField]?.toString().toLowerCase();
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    // default: sort by submissionDate desc, fall back to assigned_on
    const aTime = a.submissionDate && a.submissionDate !== "-" ? new Date(a.submissionDate) : new Date(a.assigned_on);
    const bTime = b.submissionDate && b.submissionDate !== "-" ? new Date(b.submissionDate) : new Date(b.assigned_on);
    return bTime - aTime;
  });

  /* filtering logic */
  const filteredData = sortedData.filter(item =>
    item.status !== "created" &&
    (item.studentName.toLowerCase().includes(filterText.toLowerCase()) ||
      item.assignmentTitle.toLowerCase().includes(filterText.toLowerCase()) ||
      item.status.toLowerCase().includes(filterText.toLowerCase()))
  );



  /* function to fetch name per student id from the "users" collection */

  const [preselectedUsed, setPreselectedUsed] = useState(false);

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
  }, [selected]);

  if (selected) return (
    <StudentAssignmentPage
      studentId={selected.student_user_id} assignmentId={selected.assignment_id} assignmentTitle={selected.assignmentTitle}
      onBack={() => preselectedUsed && preselectedId ? Navigate(-1) : setSelected(null)}
    />
  );

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Search by name, title, status..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      <select onChange={(e) => setSortField(e.target.value)}>
        <option value="">Sort By</option>
        <option value="studentName">Student Name</option>
        <option value="assignmentTitle">Assignment Title</option>
        <option value="status">Status</option>
      </select>

      <select onChange={(e) => setSortDirection(e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Assignment Title</th>
            <th>Mark</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map(item => {
            const isLate = item.dueDate && item.updated_on && new Date(item.updated_on) > new Date(item.dueDate);
            const isSubmitted = item.status === "submitted" || item.status === "completed";
            const markDisplay = isSubmitted && item.totalMarks > 0
              ? `${item.earnedMarks ?? 0} / ${item.totalMarks}`
              : "-";
            return (
              <tr key={item.id} style={{ background: isLate ? "#fee2e2" : "white" }}>
                <td>{item.studentName}</td>
                <td>{item.assignmentTitle}</td>
            <td>{item.submissionDate}</td>
            <td>{item.due_on}</td>
                <td>{item.status}</td>
                <td>
                  {item.status === "submitted" ? (
                    <button onClick={() => {
                  console.log("item.student_user_id: ", item.student_user_id);
                  onSelectStudent(item.student_user_id);
                  onselectAssignmentId(item.assignment_id)}}>
                  Check & Grade
                </button>
                  ) : (
                    <span>{item.status}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
