import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AssignmentTable from "./AssignmentTable";
import QuizTable from "./QuizTable";

function SubmissionStatusPage() {
  const [activeTab, setActiveTab] = useState("assignments");
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate("/dashboard/submissionstatus", { replace: true, state: {} });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Submission Status</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => handleTabChange("assignments")} style={{ background: activeTab === "assignments" ? "#ccc" : "#eee" }}>Assignments</button>
        <button onClick={() => handleTabChange("quizzes")} style={{ background: activeTab === "quizzes" ? "#ccc" : "#eee" }}>Quizzes</button>
      </div>
      {activeTab === "assignments" ? <AssignmentTable /> : <QuizTable />}
    </div>
  );
}

export default SubmissionStatusPage;
