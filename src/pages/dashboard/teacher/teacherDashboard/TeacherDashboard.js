import React, { useState } from "react";
import "./TeacherDashboard.css";

const StudentDashboard = () => {
  const [selectedDataset, setSelectedDataset] = useState(null);

  // Моковые данные (потом заменим на Firestore)
  const datasets = [
    { id: 1, name: "Employees & Depts", desc: "Basic SELECT, JOIN, and Where clauses", icon: "👥" },
    { id: 2, name: "Customers & Orders", desc: "Complex filtering and aggregations", icon: "🛒" },
    { id: 3, name: "Movies Database", desc: "Practice with strings and dates", icon: "🎬" }
  ];

  return (
    <div className="st-wrapper">
      <nav className="st-nav">
        <div className="st-container">
          <div className="st-logo">SQL<span>Practice</span></div>
          <div className="st-user">Student Mode 👤</div>
        </div>
      </nav>

      <main className="st-container st-content">
        {!selectedDataset ? (
          <>
            <header className="st-header">
              <h1>Select a Dataset</h1>
              <p>Choose a topic to start practicing your SQL skills</p>
            </header>

            <div className="st-grid">
              {datasets.map(ds => (
                <div key={ds.id} className="st-card" onClick={() => setSelectedDataset(ds)}>
                  <div className="st-card-icon">{ds.icon}</div>
                  <h3>{ds.name}</h3>
                  <p>{ds.desc}</p>
                  <button className="st-btn-select">Start Practice</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="st-editor-view">
            <button className="st-btn-back" onClick={() => setSelectedDataset(null)}>← Back to Datasets</button>
            
            <div className="st-workspace">
              <div className="st-task-card">
                <h3>Task: {selectedDataset.name}</h3>
                <p>Write a query to find all records where ID is greater than 10.</p>
              </div>

              <div className="st-editor-card">
                <div className="editor-header">SQL Editor</div>
                <textarea placeholder="SELECT * FROM table..." className="st-sql-area"></textarea>
                <button className="st-btn-run">Run Query</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;