import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import PageTitle from "../topbar/PageTitle";
import { auth } from "../../../../firebase";
import { getQuizzesForStudent } from "./studentQuizModel";
import LoadingOverlay from "../LoadingOverlay";

const Quizzes = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const quizzes = await getQuizzesForStudent(user.uid);
      setData(quizzes);
      setIsLoading(false);
    };
    fetch();
  }, []);

  const columns = [
    { name: "S.No", selector: (_, i) => i + 1, width: "70px" },
    { name: "Title", selector: r => r.title, sortable: true },
    { name: "Dataset", selector: r => r.dataset },
    {
      name: "Status",
      cell: r => (
        <span className={`badge ${r.status === "Completed" ? "bg-success" : "bg-primary"}`}
          style={{ color: "white", padding: "5px 10px", borderRadius: "12px", fontSize: "11px" }}>
          {r.status}
        </span>
      )
    },
    {
      name: "Action",
      cell: r => r.status === "Completed"
        ? <span className="text-muted" style={{ fontSize: "12px" }}>Done</span>
        : <button className="btn btn-sm btn-primary" style={{ fontSize: "12px" }}
            onClick={() => navigate(`/dashboard/quizzes/${r.quiz_id}`, { state: { quiz: r } })}>
            Start
          </button>
    },
  ];

  return (
    <>
      <LoadingOverlay isOpen={isLoading} message="Loading..." />
      <PageTitle pagetitle="Quizzes" />
      <div className="card shadow mb-4">
        <DataTable columns={columns} data={data} pagination highlightOnHover striped responsive />
      </div>
    </>
  );
};

export default Quizzes;
