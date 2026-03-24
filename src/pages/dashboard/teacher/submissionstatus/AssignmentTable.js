import { useEffect, useState } from "react";
import { getStudentAssignmentsWithDetails } from "../../../../components/model/studentAssignments";
import StudentAssignmentPage from "./StudentAssignmentPage"

export default function AssignmentTable({ onSelectStudent }) {
  const [data, setData] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");
  const [selected, setSelected] = useState(null);
 
   /*sorting logic*/
     const sortedData = [...data].sort((a, b) => {
       if (!sortField) return 0;
 
       const valueA = a[sortField]?.toString().toLowerCase();
       const valueB = b[sortField]?.toString().toLowerCase();
 
       if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
       if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
       return 0;
     });
 
     /* filtering logic */
     const filteredData = sortedData.filter(item =>
       item.studentName.toLowerCase().includes(filterText.toLowerCase()) ||
       item.assignmentTitle.toLowerCase().includes(filterText.toLowerCase()) ||
       item.status.toLowerCase().includes(filterText.toLowerCase())
     );
 

  
  /* function to fetch name per student id from the "users" collection */
  
  useEffect(() => {
    const fetchData = async () => {
      const merged = await getStudentAssignmentsWithDetails();
      setData(merged);
    };
    if (!selected) fetchData();
  }, [selected]);

  if (selected) return <StudentAssignmentPage studentId={selected.student_user_id} assignmentId={selected.assignment_id} assignmentTitle={selected.assignmentTitle} onBack={() => setSelected(null)} />;

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
            <td>{item.assignmentTitle}{isLate && <span style={{ color: "red", marginLeft: "8px", fontSize: "11px" }}>Late</span>}</td>
            <td>{markDisplay}</td>
            <td>
              {isSubmitted ? (
                <button onClick={() => setSelected(item)}>Check & Grade</button>
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
