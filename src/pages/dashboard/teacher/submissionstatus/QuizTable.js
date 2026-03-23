import { useEffect, useState } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase";

export default function QuizTable({ onSelectStudent }) {
  const [data, setData] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const vA = a[sortField]?.toString().toLowerCase();
    const vB = b[sortField]?.toString().toLowerCase();
    if (vA < vB) return sortDirection === "asc" ? -1 : 1;
    if (vA > vB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter(item =>
    (item.studentName || "").toLowerCase().includes(filterText.toLowerCase()) ||
    (item.quizTitle || "").toLowerCase().includes(filterText.toLowerCase()) ||
    (item.status || "").toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "student_quizzes"));
      const submissions = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const userIds = [...new Set(submissions.map(s => s.student_user_id))];
      const quizIds = [...new Set(submissions.map(s => s.quiz_id))];

      const [userSnaps, quizSnaps] = await Promise.all([
        Promise.all(userIds.map(uid => getDoc(doc(db, "users", uid)))),
        Promise.all(quizIds.map(id => getDoc(doc(db, "quizzes", id)))),
      ]);

      const userMap = {};
      userSnaps.forEach((s, i) => { if (s.exists()) userMap[userIds[i]] = s.data(); });

      const quizMap = {};
      quizSnaps.forEach((s, i) => { if (s.exists()) quizMap[quizIds[i]] = s.data(); });

      setData(submissions.map(s => ({
        ...s,
        studentName: userMap[s.student_user_id]?.fullName || "Unknown",
        quizTitle: quizMap[s.quiz_id]?.title || "Quiz",
      })));
    };
    fetchData();
  }, []);

  return (
    <div style={{ marginBottom: "20px" }}>
      <input type="text" placeholder="Search by name, title, status..."
        value={filterText} onChange={e => setFilterText(e.target.value)} />

      <select onChange={e => setSortField(e.target.value)}>
        <option value="">Sort By</option>
        <option value="studentName">Student Name</option>
        <option value="quizTitle">Quiz Title</option>
        <option value="submissionDate">Submission Date</option>
        <option value="status">Status</option>
      </select>

      <select onChange={e => setSortDirection(e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Quiz Title</th>
            <th>Submission Date</th>
            <th>Status</th>
            <th>Mark</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id}>
              <td>{item.studentName}</td>
              <td>{item.quizTitle}</td>
              <td>{item.submissionDate}</td>
              <td>{item.status}</td>
              <td>{item.mark ?? "-"}</td>
              <td>
                {item.status === "submitted" ? (
                  <button onClick={() => onSelectStudent(item.student_user_id)}>
                    Check & Grade
                  </button>
                ) : (
                  <span>{item.status}</span>
                )}
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: "center" }}>No quiz submissions found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
