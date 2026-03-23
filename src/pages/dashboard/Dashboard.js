import "./Dashboard.css";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase"; 

const Dashboard = () => {
  const [studentsCount, setStudentsCount] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [needsGrading, setNeedsGrading] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return; 

        const teacherId = currentUser.uid;

      
        const assignmentsRef = collection(db, "assignments");
        const qAssignments = query(assignmentsRef, where("owner_user_id", "==", teacherId));
        const assignmentsSnap = await getDocs(qAssignments);
        const assignmentsData = assignmentsSnap.docs.map(doc => ({ assignment_id: doc.id, ...doc.data() }));
        setAssignments(assignmentsData);

        if (assignmentsData.length === 0) return; 

       
        const assignmentIds = assignmentsData.map(a => a.assignment_id);
        const studentAssignmentsRef = collection(db, "student_assignments");
    
        const batches = [];
        for (let i = 0; i < assignmentIds.length; i += 10) {
          batches.push(assignmentIds.slice(i, i + 10));
        }

        let studentAssignmentsData = [];
        for (const batch of batches) {
          const studentAssignmentsQuery = query(studentAssignmentsRef, where("assignment_id", "in", batch));
          const studentAssignmentsSnap = await getDocs(studentAssignmentsQuery);
          studentAssignmentsData = studentAssignmentsData.concat(studentAssignmentsSnap.docs.map(doc => ({ ...doc.data() })));
        }

    
        const studentsSet = new Set(studentAssignmentsData.map(sa => sa.student_user_id));
        setStudentsCount(studentsSet.size);

       
        const completedAssignments = studentAssignmentsData.filter(sa => sa.status === "submitted");
        setCompleted(completedAssignments);

     
        setNeedsGrading(completedAssignments);

      } catch (error) {
        console.error("Error loading teacher dashboard:", error);
      }
    };

    loadData();
  }, []);

  const completionPercent = assignments.length
    ? Math.round((completed.length / (assignments.length * (studentsCount || 1))) * 100)
    : 0;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Teacher Dashboard</h2>

      <div className="cards">
        <div className="card">
          <p className="blue">Students</p>
          <h3>{studentsCount}</h3>
        </div>

        <div className="card">
          <p className="green">Assignments</p>
          <h3>{assignments.length}</h3>
        </div>

        <div className="card">
          <p className="cyan">Completed</p>
          <h3>{completed.length} ({completionPercent}%)</h3>
        </div>
      </div>

      <div className="needs-grading">
        <h4>Needs Grading ({needsGrading.length})</h4>
        {needsGrading.length > 0 ? (
          <ul>
            {needsGrading.map((a, i) => (
              <li key={i}>{a.student_user_id} — {a.assignment_id}</li>
            ))}
          </ul>
        ) : <p>No assignments waiting for grading.</p>}
      </div>

      <div className="table-container">
        <h4 className="table-title">Recent Assignments</h4>
        <table className="table">
          <thead>
            <tr className="table-header">
              <th>Assignment ID</th>
              <th>Title</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a, index) => {
              const submittedCount = completed.filter(c => c.assignment_id === a.assignment_id).length;
              return (
                <tr key={index}>
                  <td>{a.assignment_id}</td>
                  <td>{a.title || a.description}</td>
                  <td>{submittedCount}/{studentsCount} submitted</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;