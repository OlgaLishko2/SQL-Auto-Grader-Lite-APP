import { useEffect, useState } from "react";
import "./Dashboard.css";
import CardDashboard from './CardDashboard';
import userSession from "../../components/services/UserSession";
import { getDashboardDataForTeacher } from "../../components/model/studentAssignments";
import { getAllAssignmnetByStudent } from "../../components/model/studentAssignments";
import { getQuizzesForStudent } from "../../components/model/quizzes";
import { useNavigate } from "react-router-dom";
// DEV ONLY — remove these 2 lines before pushing to GitHub
import { seedAllData, uploadDbConfig } from "../../data/devSeed";

const Dashboard = ({ role }) => {
  const [teacherData, setTeacherData] = useState(null);
  const [studentCards, setStudentCards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "teacher") {
      getDashboardDataForTeacher(userSession.uid).then(setTeacherData);
    } else if (role === "student") {
      Promise.all([
        getAllAssignmnetByStudent(userSession.uid),
        getQuizzesForStudent(userSession.uid),
      ]).then(([assignments, quizzes]) => {
        setStudentCards([
          { label: "Assignments (Total)", value: assignments?.length ?? 0, color: "primary", icon: "fa-clipboard-list" },
          { label: "Result (Percentage)", value: "80%", color: "success", icon: "fa-percent" },
          { label: "Total Quizzes", value: quizzes?.length ?? 0, color: "warning", icon: "fa-comments" },
        ]);
      });
    }
  }, [role]);

  if (role === "student") {
    return (
      <div className="dashboard">
        <h2 className="dashboard-title">Student Dashboard</h2>
        <CardDashboard cards={studentCards} />
      </div>
    );
  }

  // Teacher dashboard
  if (!teacherData) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Teacher Dashboard</h2>

      {/* Cards */}
      <div className="cards">
        <div className="card">
          <p className="blue">Students</p>
          <h3>{teacherData.studentsCount}</h3>
        </div>
        <div className="card">
          <p className="green">Assignments</p>
          <h3>{teacherData.assignments.length}</h3>
        </div>
        <div className="card">
          <p className="cyan">Needs Grading</p>
          <h3>{teacherData.needsGrading.length}</h3>
        </div>
      </div>

      {/* Needs Grading */}
      <div className="needs-grading">
        <h4>Needs Grading ({teacherData.needsGrading.length})</h4>
        {teacherData.needsGrading.length > 0 ? (
          <ul>
            {teacherData.needsGrading.map((a, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{a.student_user_id} — {a.assignment_id}</span>
                <button className="grade-button" onClick={() => navigate("/dashboard/submissionstatus")}>
                  Grade
                </button>
              </li>
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
            {teacherData.assignments.map((a, index) => {
              const allForAssignment = teacherData.studentAssignments.filter(sa => sa.assignment_id === a.assignment_id);
              const submittedCount = allForAssignment.filter(sa => sa.status === "submitted" || sa.status === "completed").length;
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
