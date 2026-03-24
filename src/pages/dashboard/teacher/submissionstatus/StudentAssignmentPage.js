import { useEffect, useState } from "react";
import { getStudentInfo, getAttemptsByStudent } from "../../../../components/model/questionAttempts";
import DataTable from "react-data-table-component";

export default function StudentAssignmentPage({ studentId, onBack }) {
  const [student, setStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  
  useEffect(() => {
    if (!studentId) {
      console.log("Student ID missing, skipping Firestore call");
      return;
    }
    const loadData = async () => {
      try {
        console.log("studentId", studentId);
        const userData = await getStudentInfo(studentId);
        setStudent(userData);

        const list = await getAttemptsByStudent(studentId);
        setAttempts(list);
        console.log("list: ", list);
      }catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, [studentId]);

  return (
    <div>
      <button onClick={onBack}>← Back</button>

      <h2>Student Assignment</h2>

      {student && (
        <div style={{ marginBottom: "20px" }}>
          <strong>Student ID:</strong> {studentId} <br />
          <strong>Name:</strong> {student.fullName}
        </div>
      )}

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Question No</th>
            <th>Attempts</th>
            <th>Answers</th>
            <th>Check Status</th>
          </tr>
        </thead>

        <tbody>
          {attempts.map(item => (
            <tr key={item.id}>
              <td>{item.question_id}</td>
              <td>{item.attempt_id}</td>
              <td>{item.submitted_sql}</td>
              {/*<td>
                {item.submitted_sql.map((ans, index) => (
                  <div key={index}>Attempt {index + 1}: {ans}</div>
                ))}
              </td>*/}

              <td>
                {item.checked ? (
                  <span>Checked</span>
                ) : (
                  <button>Check</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

