import { useEffect, useState } from "react";
import "./Dashboard.css";
import PageTitle from './student/topbar/PageTitle';
import CardDashboard from './CardDashboard';
import userSession from "../../services/UserSession";
import { getDashboardDataForTeacher } from "../../components/model/studentAssignments";
import { getAllAssignmnetByStudent } from "../../components/model/studentAssignments";
import { getAllQuizByOwner } from "../../components/model/quizzes";
import { getQuizzesForStudent } from "../../components/model/quizzes";
// DEV ONLY — remove these 2 lines before pushing to GitHub
import { seedAllData, uploadDbConfig } from "../../data/devSeed";

const Dashboard = ({ role }) => {
  const [teacherData, setTeacherData] = useState(null);
  const [studentCards, setStudentCards] = useState([
    { label: "Assignments (Total)", value: "...", color: "primary", icon: "fa-clipboard-list" },
    { label: "Total Quizzes",       value: "...", color: "warning", icon: "fa-comments" },
  ]);

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
          { label: "Total Quizzes",       value: quizzes?.length ?? 0,     color: "warning", icon: "fa-comments" },
        ]);
      });
    }
  }, [role]);

  if (role === "student") {
    return (
      <>
        <PageTitle pagetitle="Dashboard" />
        <CardDashboard cards={studentCards} />
      </>
    );
  }

  // Teacher dashboard
  return (
    <>
      <PageTitle pagetitle="Dashboard" />

      {/* DEV ONLY — remove this block before pushing to GitHub */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <button onClick={() => seedAllData().then(() => alert("All data seeded!")).catch(e => alert("Error: " + e.message))}
          style={{ padding: "8px 16px" }}>Seed Sample Data (run once)</button>
        <button onClick={() => uploadDbConfig().then(() => alert("Dataset config uploaded!")).catch(e => alert("Error: " + e.message))}
          style={{ padding: "8px 16px" }}>Upload Dataset Config (run once)</button>
      </div>

      {teacherData && (
        <>
          <CardDashboard cards={[
            { label: "Students",      value: teacherData.studentsCount,       color: "primary", icon: "fa-users" },
            { label: "Assignments",   value: teacherData.assignments.length,  color: "success", icon: "fa-clipboard-list" },
            { label: "Needs Grading", value: teacherData.needsGrading.length, color: "warning", icon: "fa-pen" },
          ]} />

          <div className="card shadow mb-4">
            <div className="card-header"><h6>Recent Assignments</h6></div>
            <table className="table table-bordered" style={{ margin: 0 }}>
              <thead><tr><th>Assignment</th><th>Submitted / Total</th></tr></thead>
              <tbody>
                {teacherData.assignments.map((a, i) => {
                  const all = teacherData.studentAssignments.filter(sa => sa.assignment_id === a.assignment_id);
                  const submitted = all.filter(sa => sa.status === "submitted").length;
                  const percent = all.length ? Math.round((submitted / all.length) * 100) : 0;
                  return (
                    <tr key={i}>
                      <td>{a.title}</td>
                      <td>{submitted}/{all.length} ({percent}%)</td>
                    </tr>
                  );
                })}
                {teacherData.assignments.length === 0 && <tr><td colSpan="2">No assignments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
