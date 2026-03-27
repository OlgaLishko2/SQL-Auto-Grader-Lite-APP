import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import Breadcrumb from "../Breadcrumb";
import userSession from "../../../../components/services/UserSession";
import { getAllAssignmnetByStudent, getAllCompletedAssignmnetByStudent } from "../../../../components/model/studentAssignments";
import { getBestAttemptByUserQuestion } from "../../../../components/model/questionAttempts";
import LoadingOverlay from "../LoadingOverlay";

const Assignments = () => {
  const navigate = useNavigate();
  const [assignmentsdata, setAssignmentsdata] = useState([]);
  const [submissionsdata, setSubmissionsdata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const [all, completed] = await Promise.all([
          getAllAssignmnetByStudent(userSession.uid),
          getAllCompletedAssignmnetByStudent(userSession.uid),
        ]);
        console.log(all)

        console.log(completed)
        setAssignmentsdata(all.filter((a) => a.status === "assigned" || a.status === "New" || a.status === "In Progress"));
console.log(assignmentsdata)
        const withMarks = await Promise.all(completed.map(async (a) => {
          const questions = a.questions || [];
          const totalMarks = questions.reduce((s, q) => s + (Number(q.mark) || 1), 0);
          const attempts = await Promise.all(questions.map(q => getBestAttemptByUserQuestion(userSession.uid, q.question_id)));
          const oMarks = attempts.reduce((s, att, i) => s + (att?.is_correct ? (Number(questions[i].mark) || 1) : 0), 0);
          return { ...a, totalMarks, oMarks, percentage: totalMarks ? Math.round((oMarks / totalMarks) * 100) + "%" : "0%" };
        }));
        setSubmissionsdata(withMarks);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchdata();
  }, []);

  const cap = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const activeColumns = [
    { name: "S.No", selector: (row) => row.assignment_id, cell: (row, index) => index + 1 },
    { name: "Title", selector: (row) => row.title, sortable: true, cell: (row) => cap(row.title) },
    { name: "Due Date", id: "dueDate", selector: (row) => row.dueDate, sortable: true },
    {
      name: "Status", selector: (row) => row.status,
      cell: (row) => (
        <span className={`badge ${row.status === "In Progress" ? "bg-warning text-dark" : "bg-primary"}`}
          style={{ color: "white", padding: "5px 10px", borderRadius: "12px", fontSize: "11px" }}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Action", ignoreRowClick: true,
      cell: (row) => (
        <button className="btn btn-sm btn-primary" style={{ borderRadius: "4px", fontSize: "12px" }}
          onClick={() => navigate(`/dashboard/questions/${row.assignment_id}`, { state: { assignment: row } })}>
          {row.status === "New" ? "Start Test" : "Continue"}
        </button>
      ),
    },
  ];

  const submittedColumns = [
    { name: "S.No", selector: (row) => row.assignment_id, cell: (row, index) => index + 1 },
    { name: "Title", selector: (row) => row.title, sortable: true, cell: (row) => cap(row.title) },
    { name: "Due Date", id: "dueDate", selector: (row) => row.dueDate, sortable: true },
    { name: "Marks Obtained / Total", selector: (row) => `${row.oMarks} / ${row.totalMarks}`, sortable: true },
    { name: "Percentage", selector: (row) => row.percentage },
    {
      name: "Action", ignoreRowClick: true,
      cell: (row) => (
        <button className="btn btn-sm btn-primary" style={{ borderRadius: "4px", fontSize: "12px" }}
          onClick={() => navigate(`/dashboard/results/${row.assignment_id}`)}>
          View Detail
        </button>
      ),
    },
  ];

  return (
    <>
      <LoadingOverlay isOpen={isLoading} message="Loading..." />
      <div className="d-sm-flex justify-content-between mb-0">
        <h2>Assignments</h2>
        <Breadcrumb items={[{ label: "Dashboard", link: "/dashboard" }, { label: "Assignments", active: true }]} />
      </div>
      <div className="card shadow mb-4">
        <Tabs>
          <TabList>
            <Tab>Assignments</Tab>
            <Tab>Submitted Assignments</Tab>
          </TabList>
          <TabPanel>
            <DataTable columns={activeColumns} data={assignmentsdata} pagination highlightOnHover striped responsive defaultSortFieldId="dueDate" defaultSortAsc={true} />
          </TabPanel>
          <TabPanel>
            <DataTable columns={submittedColumns} data={submissionsdata} pagination highlightOnHover striped responsive defaultSortFieldId="dueDate" defaultSortAsc={false} />
          </TabPanel>
        </Tabs>
      </div>
    </>
  );
};

export default Assignments;
