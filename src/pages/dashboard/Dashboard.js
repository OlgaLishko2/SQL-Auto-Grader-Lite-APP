import "./Dashboard.css";
import { useEffect, useState } from "react";
import CardDashboard from './CardDashboard'; 
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";


const Dashboard = ({ role }) => {
  const [studentsCount, setStudentsCount] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [needsGrading, setNeedsGrading] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "teacher") loadTeacherData();
    loadUsers();
  }, [role]);

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const snap = await getDocs(usersRef);
      const usersData = snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const loadTeacherData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const teacherId = currentUser.uid;

     
      const assignmentsRef = collection(db, "assignments");
      const qAssignments = query(assignmentsRef, where("owner_user_id", "==", teacherId));
      const assignmentsSnap = await getDocs(qAssignments);
      const assignmentsData = assignmentsSnap.docs.map(doc => ({
        assignment_id: doc.id,
        ...doc.data(),
      }));
      setAssignments(assignmentsData);

      if (assignmentsData.length === 0) {
        setLoading(false);
        return;
      }

   
      const assignmentIds = assignmentsData.map(a => a.assignment_id);
      const studentAssignmentsRef = collection(db, "student_assignments");
      let studentAssignmentsData = [];

      for (let i = 0; i < assignmentIds.length; i += 10) {
        const batch = assignmentIds.slice(i, i + 10);
        const q = query(studentAssignmentsRef, where("assignment_id", "in", batch));
        const snap = await getDocs(q);
        studentAssignmentsData.push(...snap.docs.map(doc => ({ ...doc.data() })));
      }

      setStudentAssignments(studentAssignmentsData);

    
      const uniqueStudents = new Set(studentAssignmentsData.map(sa => sa.student_user_id));
      setStudentsCount(uniqueStudents.size);

     
      const completed = studentAssignmentsData.filter(sa => sa.status === "completed");
      setNeedsGrading(completed);

      setLoading(false);

    } catch (error) {
      console.error("Dashboard error:", error);
      setLoading(false);
    }
  };

  if (role === "student") {
    return (
      <div className="dashboard">
        <h2 className="dashboard-title">Student Dashboard</h2>
        <CardDashboard  />
      </div>
    );
  }

  if (loading) {
    return <p>Loading teacher dashboard...</p>;
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Teacher Dashboard</h2>

      {/* Cards */}
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
          <h3>{needsGrading.length}</h3>
        </div>
      </div>

      {/* Needs Grading */}
      <div className="needs-grading">
        <h4>Completed Assignments ({needsGrading.length})</h4>
        {needsGrading.length > 0 ? (
<ul>
  {needsGrading.map((a, i) => {
    const student = users.find(u => u.uid === a.student_user_id);
    const studentName = student ? student.fullName || student.uid : a.student_user_id;

    const assignment = assignments.find(asg => asg.assignment_id === a.assignment_id);
    const assignmentTitle = assignment ? (assignment.title || assignment.description || assignment.assignment_id) : a.assignment_id;

    return (
      <li key={i}>
        {studentName} — {assignmentTitle}
      </li>
    );
  })}
</ul>
        ) : (
          <p>No completed assignments yet.</p>
        )}
      </div>

      {/* Recent Assignments */}
      <div className="table-container">
        <h4 className="table-title">Recent Assignments</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Completed / Total</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a, index) => {
              const allForAssignment = studentAssignments.filter(sa => sa.assignment_id === a.assignment_id);
              const completedCount = allForAssignment.filter(sa => sa.status === "completed").length;
              const totalStudents = allForAssignment.length;
              const percent = totalStudents ? Math.round((completedCount / totalStudents) * 100) : 0;

              return (
                <tr key={index}>
                  <td>{a.title || a.description}</td>
                  <td>{completedCount}/{totalStudents} ({percent}%)</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;