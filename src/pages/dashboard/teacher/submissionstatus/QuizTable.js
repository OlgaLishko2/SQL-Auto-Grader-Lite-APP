import { useEffect, useState } from "react";
import { getQuizSubmissionsWithDetails } from "../../../../components/model/quizzes";
import userSession from "../../../../components/services/UserSession";
import "./Submission.css";


export default function QuizTable() {
  const [data, setData] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getQuizSubmissionsWithDetails(userSession.uid);
        setData(result || []);
      } catch (error) {
        console.error("Error fetching quiz submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const vA = (a[sortField] || "").toString().toLowerCase();
    const vB = (b[sortField] || "").toString().toLowerCase();
    if (vA < vB) return sortDirection === "asc" ? -1 : 1;
    if (vA > vB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter(item =>
    (item.studentName || "").toLowerCase().includes(filterText.toLowerCase()) ||
    (item.quizTitle || "").toLowerCase().includes(filterText.toLowerCase()) ||
    (item.status || "").toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="card-body p-0">
    
      <div className="row mb-4 px-3 pt-3">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-light border-0 small"
              placeholder="Search quizzes..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
            />
            
              <button className="btn btn-primary" type="button">
                <i className="fas fa-search fa-sm"></i>
              </button>
         
          </div>
        </div>

        <div className="col-md-3">
          <select className="form-control custom-select" onChange={e => setSortField(e.target.value)}>
            <option value="">Sort By</option>
            <option value="studentName">Student Name</option>
            <option value="quizTitle">Quiz Title</option>
            <option value="submissionDate">Date</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="col-md-3">
          <select className="form-control custom-select" onChange={e => setSortDirection(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

  
      <div className="table-responsive px-3">
        <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
          <thead className="bg-light text-primary">
            <tr>
              <th>Student Name</th>
              <th>Quiz Title</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th>Mark</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center">Loading...</td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map(item => (
                <tr key={item.id}>
                  <td className="font-weight-bold text-gray-800">{item.studentName}</td>
                  <td>{item.quizTitle}</td>
                  <td>{item.submissionDate || "-"}</td>
                  <td>
                    <span className={`badge ${item.status === 'completed' ? 'badge-success' : 'badge-secondary'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="font-weight-bold text-primary">{item.mark ?? "-"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center py-4">No quiz submissions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}