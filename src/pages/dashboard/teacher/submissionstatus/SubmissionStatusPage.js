import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import AssignmentTable from "./AssignmentTable";
import QuizTable from "./QuizTable";

function SubmissionStatusPage() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const handleSelect = (index) => {
    setActiveTab(index);
    navigate("/dashboard/submissionstatus", { replace: true, state: {} });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Submission Status</h2>
      <Tabs selectedIndex={activeTab} onSelect={handleSelect}>
        <TabList>
          <Tab>Assignments</Tab>
          <Tab>Quizzes</Tab>
        </TabList>
        <TabPanel><AssignmentTable /></TabPanel>
        <TabPanel><QuizTable /></TabPanel>
      </Tabs>
    </div>
  );
}

export default SubmissionStatusPage;
