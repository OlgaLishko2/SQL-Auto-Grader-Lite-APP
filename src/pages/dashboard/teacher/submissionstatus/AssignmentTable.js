import { useEffect, useState } from "react";
import { collection, getDocs, getDoc,doc } from "firebase/firestore";
import { db } from "../../../../firebase";
import StudentAssignmentPage from "./StudentAssignmentPage"

export default function AssignmentTable({ onSelectStudent }) {
  const [data, setData] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");
 
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
      // 1. Fetch all assignment submissions
      const snap = await getDocs(collection(db, "student_assignments"));
      const assignments  = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. Extract all unique student_user_ids
      const userIds = [...new Set(assignments.map(a => a.student_user_id))];

      // 3. Extract unique assignment IDs
      const assignmentIds = [...new Set(assignments.map(a => a.assignment_id))];

      // 4. Fetch all user documents in parallel
      const userPromises = userIds.map(uid => getDoc(doc(db, "users", uid)));
      const userSnaps = await Promise.all(userPromises);

      // 5. Build a map: uid → userData
      const userMap = {};
      userSnaps.forEach((snap, index) => {
        if (snap.exists()) {
          userMap[userIds[index]] = snap.data();
        }
      });
      console.log("userMap: ", userMap);

       // 6. Fetch all assignment titles in parallel
      const assignmentPromises = assignmentIds.map(id =>
        getDoc(doc(db, "assignments", id))
      );
      const assignmentSnaps = await Promise.all(assignmentPromises);

      const assignmentMap = {};
      assignmentSnaps.forEach((snap, index) => {
        if (snap.exists()) {
          assignmentMap[assignmentIds[index]] = snap.data();
        }
      });

      // 5. Merge user names into assignments
      const merged = assignments.map(a => ({
        ...a,
        studentName: userMap[a.student_user_id]?.fullName || "Unknown",
        assignmentTitle: assignmentMap[a.assignment_id]?.title || "Assignment"
      }));

      setData(merged);
    };
    fetchData();
  }, []);
  
  


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
          <option value="submissionDate">Submission Date</option>
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
          <th>Submission Date</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {filteredData.map(item => (
          <tr key={item.id}>
            <td>{item.studentName}</td>
            <td>{item.assignmentTitle}</td>
            <td>{item.submissionDate}</td>
            <td>{item.dueDate}</td>
            <td>{item.status}</td>
            <td>
              {item.status === "submitted" ? (
                <button onClick={() => {
                  console.log("item.student_user_id: ", item.student_user_id);
                  onSelectStudent(item.student_user_id)}}>
                  Check & Grade
                </button>
              ) : (
                <span>{item.status}</span>
              )}
            </td>
          </tr>
          ))}
      </tbody>
    </table>
    </div>      
  );
}
