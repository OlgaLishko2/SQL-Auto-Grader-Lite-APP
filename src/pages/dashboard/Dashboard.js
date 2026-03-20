import "./Dashboard.css";
import PageTitle from './topbar/PageTitle';
import CardDashboard from './CardDashboard';
import SQLtest from "../../components/db/sqlTest";
// DEV ONLY — remove these 2 lines before pushing to GitHub
import { seedAllData, uploadDbConfig } from "../../data/devSeed";

const studentCards = [
  { label: "Assignments (Total)", value: 40,    color: "primary", icon: "fa-clipboard-list" },
  { label: "Result (Percentage)", value: "80%", color: "success", icon: "fa-percent" },
  { label: "Total Quizzes",       value: 18,    color: "warning", icon: "fa-comments" },
];

const Dashboard = ({ role }) => {
  return (
    <>
      <PageTitle pagetitle="Dashboard" />
      {role === "student" && <CardDashboard cards={studentCards} />}
      {/* DEV ONLY — remove this block before pushing to GitHub */}
      {/* {role === "teacher" && (
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={() => seedAllData().then(() => alert("All data seeded!")).catch((e) => alert("Error: " + e.message))}
            style={{ padding: "8px 16px" }}
          >
            Seed Sample Data (run once)
          </button>
          <button
            onClick={() => uploadDbConfig().then(() => alert("Dataset config uploaded!")).catch((e) => alert("Error: " + e.message))}
            style={{ padding: "8px 16px" }}
          >
            Upload Dataset Config (run once)
          </button>
        </div>
      )} */}
    
    </>
  );
};

export default Dashboard;
