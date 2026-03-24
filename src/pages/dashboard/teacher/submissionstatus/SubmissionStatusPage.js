import { useState } from "react";
import AssignmentTable from "./AssignmentTable";
import QuizTable from "./QuizTable";

function SubmissionStatusPage() {
  const [activeTab, setActiveTab] = useState("assignments");

  return (
    <div style={{ padding: "20px" }}>
      <h2>Submission Status</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("assignments")} style={{ background: activeTab === "assignments" ? "#ccc" : "#eee" }}>Assignments</button>
        <button onClick={() => setActiveTab("quizzes")} style={{ background: activeTab === "quizzes" ? "#ccc" : "#eee" }}>Quizzes</button>
      </div>
      {activeTab === "assignments" ? <AssignmentTable /> : <QuizTable />}
    </div>
  );
}

export default SubmissionStatusPage;
