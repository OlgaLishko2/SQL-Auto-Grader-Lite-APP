import React, { useState } from "react";
import questionsData from "../../../db/questions.json";
import { runSelectQuery } from "../../../db/sqlOperations";
import { useDatabaseInitializer } from "../../../db/useDatabaseInitializer";
import { useDatabase } from "../../../db/useDatabase";
import { auth, db } from "../../../firebase"; 
import { setDoc, doc, collection } from "firebase/firestore";

const datasets = {
  datasetA: ["users", "orders"],
  datasetB: ["products"]
};

function CreateQuestionSet() {
    const [selectedDataset, setSelectedDataset] = useState("");
    const [selectedTables, setSelectedTables] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [queryResult, setQueryResult] = useState("");
    const { dbA, dbB, loading, error } = useDatabase();
    const { activeDb, setActiveDb, seeded } = useDatabaseInitializer(dbA, dbB);
    const [inputQuery, setInputQuery] = useState("");
    // Handle dataset selection
    const handleDatasetChange = (e) => {
        console.log(e.target.value);
        setSelectedDataset(e.target.value);
        setSelectedTables([]);
        setQuestions([]);
        console.log(`dataset: ${selectedDataset}`);
        const select_db = e.target.value;
        const nextDb =
        select_db === "datasetA" ? dbA : select_db === "datasetB" ? dbB : null;
        if (nextDb) setActiveDb(nextDb);
        console.log(`dataset ${nextDb}`);
    };

  // Toggle table selection
  const toggleTable = (table) => {
    setSelectedTables((prev) =>
      prev.includes(table)
        ? prev.filter((t) => t !== table)
        : [...prev, table]
    );
  };

  // Add new question block
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        table: "",
        questionText: "",
        answer: "",
        preset: null,
        orderMatters: false,
        aliasStrict: false,
        max_number_of_attempts: 0
      }
    ]);
  };

  // Update question fields
  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // Execute query (Mock execution)
  const executeQuery = (inputQuery) => {
    // Replace this with real SQL execution if using SQLite WASM
    const queryResult = runSelectQuery(activeDb, inputQuery);
    console.log(queryResult);
    setQueryResult(`Executed Query:\n${queryResult[0].values}\n\n`);
  };

  // Create Assignment JSON
  const createAssignment = async() => {
    const assignment = {
      dataset: selectedDataset,
      tables: selectedTables,
      questions: questions
    };

    const blob = new Blob([JSON.stringify(assignment, null, 2)], {
      type: "application/json"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "assignment.json";
    link.click();

    //uploading to firestore
    try {
          let refDoc = await setDoc(doc(db, "questions", "one"), {
            id: 1,
            //createdBy: auth.currentUser.uid,
            qDescription: blob,
            qTitle: "Trial",
            createdDate: new Date()  
          });
          console.log("question id is :", refDoc);
          /* question set should have the assignment id for reference */
          //formData.question_set = refDoc.id;
        }
        catch(error){
          console.log("Error while updating assignment table:", error);
        }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Create Question Set</h1>

      {/* Dataset Selection */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Select Dataset</h3>
        <select value={selectedDataset} onChange={handleDatasetChange}>
          <option value="">-- Choose Dataset --</option>
          <option value="datasetA">Dataset A</option>
          <option value="datasetB">Dataset B</option>
        </select>
      </div>

      {/* Tables Selection */}
      {selectedDataset && (
        <div style={{ marginBottom: "30px" }}>
          <h3>Select Tables</h3>
          {
                
                (datasets[selectedDataset])?.map((table) => (
                    <label key={table} style={{ marginRight: "15px" }}>
                    <input
                        type="checkbox"
                        checked={selectedTables.includes(table)}
                        onChange={() => toggleTable(table)}
                    />
                    {table}
                    </label>
                ))
            }
        </div>
      )}

      {/* Questions Section */}
      <div>
        <h2>Questions</h2>
        <button onClick={addQuestion}>Add Question</button>

        {questions.map((q, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "30px",
              border: "1px solid #ccc",
              padding: "20px"
            }}
          >
            {/* Question Container */}
            <div style={{ flex: 1 }}>
              <h4>Question</h4>

              <select
                onChange={(e) => {
                  const preset = JSON.parse(e.target.value);
                  updateQuestion(index, "questionText", preset.question);
                  updateQuestion(index, "answer", preset.answer);
                }}
              >
                <option value="">-- Select Preset Question --</option>
                {selectedTables.map((table) =>
                  questionsData[selectedDataset]?.[table]?.map((preset) => (
                    <option
                      key={preset.id}
                      value={JSON.stringify(preset)}
                    >
                      {preset.question}
                    </option>
                  ))
                )}
              </select>

              <textarea
                placeholder="Or write new question..."
                value={q.questionText}
                onChange={(e) =>
                  //updateQuestion(index, "questionText", e.target.value)
                  setInputQuery(e.target.value)
                }
                style={{ width: "100%", height: "100px", marginTop: "10px" }}
              />

              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={q.orderMatters}
                    onChange={(e) =>
                      updateQuestion(index, "orderMatters", e.target.checked)
                    }
                  />
                  Order Matters
                </label>

                <label style={{ marginLeft: "15px" }}>
                  <input
                    type="checkbox"
                    checked={q.aliasStrict}
                    onChange={(e) =>
                      updateQuestion(index, "aliasStrict", e.target.checked)
                    }
                  />
                  Alias Strict 
                </label>

                <label style={{ marginLeft: "5px" }}>
                  <input
                    value={q.max_number_of_attempts}
                    onChange={(e) =>
                      updateQuestion(index, "max_number_of_attempts", e.target.checked)
                    }
                  />
                  Maximum Attempts Number: 
                </label>

              </div>
            </div>

            {/* Answer Container */}
            <div style={{ flex: 1 }}>
              <h4>Answer</h4>
              <textarea
                value={q.answer}
                onChange={(e) =>
                  updateQuestion(index, "answer", e.target.value)
                }
                style={{ width: "100%", height: "150px" }}
              />
            </div>

            {/* Code Editor Container */}
            <div style={{ flex: 1 }}>
              <h4>Code Editor</h4>
              <textarea
                placeholder="Write SQL query here..."
                style={{ width: "100%", height: "120px" }}
                onChange={(e) =>
                  updateQuestion(index, "studentQuery", e.target.value)
                }
              />

              <button
                style={{ marginTop: "10px" }}
                onClick={() => executeQuery(q.studentQuery)}
              >
                Execute
              </button>

              <textarea
                value={queryResult}
                readOnly
                style={{
                  width: "100%",
                  height: "100px",
                  marginTop: "10px",
                  backgroundColor: "#f3f3f3"
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div style={{ marginTop: "40px" }}>
        <button
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "black",
            color: "white"
          }}
          onClick={createAssignment}
        >
          Add questions
        </button>
      </div>
    </div>
  );
}

export default CreateQuestionSet