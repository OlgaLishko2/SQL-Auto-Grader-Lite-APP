import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStudentAssignmentsWithDetails } from "../../components/model/studentAssignments";
import "./Dashboard.css";

const GradingPage = () => {
  const { student_assignment_id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignment = async () => {
      try {

        const allAssignments = await getStudentAssignmentsWithDetails();
        const current = allAssignments.find(
          (a) => a.student_assignment_id === student_assignment_id
        );
        if (current) {
          setAssignment(current);
          setGrade(current.earnedMarks || 0);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading assignment:", error);
        setLoading(false);
      }
    };
    loadAssignment();
  }, [student_assignment_id]);

  const handleSubmit = async () => {
    if (!assignment) return;
    try {
    
      const studentAssignmentRef = doc(db, "student_assignments", assignment.id);
      await updateDoc(studentAssignmentRef, {
        grade: Number(grade),
        status: "graded",
      });
      alert("Grade submitted!");
      navigate("/dashboard"); 
    } catch (error) {
      console.error("Error submitting grade:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!assignment) return <p>Assignment not found</p>;

  return (
    <div className="grading-page">
      <h2>Grade Assignment</h2>
      <p>
        <strong>Student:</strong> {assignment.studentName}
      </p>
      <p>
        <strong>Assignment:</strong> {assignment.assignmentTitle}
      </p>
      <p>
        <strong>Total Marks:</strong> {assignment.totalMarks}
      </p>
      <div>
        <label>Grade: </label>
        <input
          type="number"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          min="0"
          max={assignment.totalMarks}
        />
      </div>
      <button className="submit-button" onClick={handleSubmit}>
        Submit Grade
      </button>
    </div>
  );
};

export default GradingPage;