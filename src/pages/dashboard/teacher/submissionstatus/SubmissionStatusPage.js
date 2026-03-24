import { useState } from "react";
import AssignmentTable from "./AssignmentTable";
import QuizTable from "./QuizTable";
import StudentAssignmentPage from "./StudentAssignmentPage";

function SubmissionStatusPage() {
  const [activeTab, setActiveTab] = useState("assignments");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  return (
    <div style={{ padding: "20px" }}>
      <h2>Submission Status</h2>

      {/* If a student is selected, show the StudentAssignmentPage */}
      {(selectedStudentId !== "") ? (
        <StudentAssignmentPage
          studentId={selectedStudentId}
          onBack={() => setSelectedStudentId("")}
        />
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => setActiveTab("assignments")}
              style={{ background: activeTab === "assignments" ? "#ccc" : "#eee" }}
            >
              Assignments
            </button>

            <button
              onClick={() => setActiveTab("quizzes")}
              style={{ background: activeTab === "quizzes" ? "#ccc" : "#eee" }}
            >
              Quizzes
            </button>
          </div>

          {activeTab === "assignments" ? (
            <AssignmentTable onSelectStudent={setSelectedStudentId} />
          ) : (
            <QuizTable/>
          )}
        </>
      )}
    </div>
  );
}

export default SubmissionStatusPage;