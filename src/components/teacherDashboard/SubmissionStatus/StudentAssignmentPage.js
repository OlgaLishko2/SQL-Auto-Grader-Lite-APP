import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";

export default function StudentAssignmentPage({ studentId, onBack }) {
  const [student, setStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const userRef = doc(db, "users", studentId);
      const userSnap = await getDoc(userRef);
      setStudent(userSnap.data());

      const q = query(
        collection(db, "question_attempts"),
        where("studentId", "==", studentId)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttempts(list);
    };

    loadData();
  }, [studentId]);

  return (
    <div>
      <button onClick={onBack}>← Back</button>

      <h2>Student Assignment</h2>

      {student && (
        <div style={{ marginBottom: "20px" }}>
          <strong>ID:</strong> {studentId} <br />
          <strong>Name:</strong> {student.name}
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
              <td>{item.questionNumber}</td>
              <td>{item.numberOfAttempts}</td>
              <td>
                {item.answers.map((ans, index) => (
                  <div key={index}>Attempt {index + 1}: {ans}</div>
                ))}
              </td>

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

