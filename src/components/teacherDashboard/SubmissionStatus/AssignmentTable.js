import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import StudentAssignmentPage from "./StudentAssignmentPage"

export default function AssignmentTable({ onSelectStudent }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "student_assignments"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(list);
    };
    fetchData();
  }, []);

  return (
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Name</th>
          <th>Submission Date</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.studentName}</td>
            <td>{item.submissionDate}</td>
            <td>{item.dueDate}</td>
            <td>{item.status}</td>

            <td>
              {item.status === "submitted" ? (
                <button onClick={() => onSelectStudent(item.studentId)}>
                  Check & Grade
                </button>
              ) : (
                <span>{item.status}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
