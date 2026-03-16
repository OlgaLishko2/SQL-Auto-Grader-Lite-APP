
import "./Dashboard.css";
import PageTitle from './topbar/PageTitle';
import CardDashboard from './CardDashboard';
import SQLtest from "../../components/db/sqlTest";

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
      <SQLtest/>
    </>
  );
};

export default Dashboard;
