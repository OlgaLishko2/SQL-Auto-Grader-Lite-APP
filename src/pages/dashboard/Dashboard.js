import "./Dashboard.css";
import { useEffect, useState } from "react";
import CardDashboard from './CardDashboard'; // карточки студента
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";

// карточки студента (не трогаем)
const studentCards = [
  { label: "Assignments (Total)", value: 40, color: "primary", icon: "fa-clipboard-list" },
  { label: "Result (Percentage)", value: "80%", color: "success", icon: "fa-percent" },
  { label: "Total Quizzes", value: 18, color: "warning", icon: "fa-comments" },
];

const Dashboard = ({ role }) => {
  const [studentsCount, setStudentsCount] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [needsGrading, setNeedsGrading] = useState([]);

  useEffect(() => {
    if (role === "teacher") loadTeacherData();
  }, [role]);

  const loadTeacherData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const teacherId = currentUser.uid;

      // 1️⃣ Получаем все задания учителя
      const assignmentsRef = collection(db, "assignments");
      const qAssignments = query(assignmentsRef, where("owner_user_id", "==", teacherId));
      const assignmentsSnap = await getDocs(qAssignments);
      const assignmentsData = assignmentsSnap.docs.map(doc => ({
        assignment_id: doc.id,
        ...doc.data(),
      }));
      setAssignments(assignmentsData);

      if (assignmentsData.length === 0) return;

      // 2️⃣ Получаем student_assignments для этих заданий
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

      // 3️⃣ Считаем уникальных студентов
      const uniqueStudents = new Set(studentAssignmentsData.map(sa => sa.student_user_id));
      setStudentsCount(uniqueStudents.size);

      // 4️⃣ Фильтруем нуждающиеся в проверке
      const submitted = studentAssignmentsData.filter(sa => sa.status === "submitted");
      setNeedsGrading(submitted);

    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  // Студентский Dashboard с заголовком
  if (role === "student") {
    return (
      <div className="dashboard">
        <h2 className="dashboard-title">Student Dashboard</h2>
        <CardDashboard cards={studentCards} />
      </div>
    );
  }

  // Учительский Dashboard
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
          <p className="cyan">Needs Grading</p>
          <h3>{needsGrading.length}</h3>
        </div>
      </div>

      {/* Needs Grading */}
      <div className="needs-grading">
        <h4>Needs Grading ({needsGrading.length})</h4>
        {needsGrading.length > 0 ? (
          <ul>
            {needsGrading.map((a, i) => (
              <li key={i}>{a.student_user_id} — {a.assignment_id}</li>
            ))}
          </ul>
        ) : (
          <p>No assignments waiting for grading.</p>
        )}
      </div>

      {/* Recent Assignments */}
      <div className="table-container">
        <h4 className="table-title">Recent Assignments</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a, index) => {
              const allForAssignment = studentAssignments.filter(sa => sa.assignment_id === a.assignment_id);
              const submittedCount = allForAssignment.filter(sa => sa.status === "submitted").length;
              const totalStudents = allForAssignment.length;
              const percent = totalStudents ? Math.round((submittedCount / totalStudents) * 100) : 0;

              return (
                <tr key={index}>
                  <td>{a.title || a.description}</td>
                  <td>{submittedCount}/{totalStudents} ({percent}%)</td>
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