import { useState, useEffect } from "react";
import { useAppContext } from "../../../../../components/db/service/context";
import { addQuestionToAssignment } from "../../../../../components/model/assignments";
import { getPresetQuestions } from '../../../../../components/model/presetQuestions';
import TableSchema from '../../../tableView/TableSchema'
import { CodeEditor } from "./CodeEditor";
import './CreateQuestionSet.css'

function CreateQuestionSet({ onAddQuestions, setDb }) {
  const { allTables, allDataset, getTableSchemaInTable } = useAppContext();

  const [selectedDataset, setSelectedDataset] = useState("");
  const [datasets, setDatasets] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState([]);
  const [selectedTableForSchema, setSelectedTableForSchema] = useState();
  const [tableSchemas, setTableSchemas] = useState({});
  const [presets, setPresets] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    allDataset().then((data) => setDatasets(data.map((d) => d.datasetName)));
  }, [allDataset]);

  useEffect(() => {
    if (!selectedDataset) return;
    allTables(selectedDataset).then((tables) => {
      const names = tables.map((t) => t.tableName);
      setAvailableTables(names);
      names.forEach((table) => {
        getTableSchemaInTable(selectedDataset, table).then((schema) =>
          setTableSchemas((prev) => ({ ...prev, [table]: schema }))
        );
      })
      getPresetQuestions(selectedDataset).then((data) => {
        setPresets(data);
      });
    });

  }, [selectedDataset, allTables]);

  const handleDatasetChange = (e) => {
    setSelectedDataset(e.target.value);
    setDb(e.target.value)
    setSelectedTable([]);
    setPresets([]);
    setQuestions([]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        table: "",
        questionText: "",
        answer: "",
        orderMatters: false,
        aliasStrict: false,
        mark: 1,
        difficulty: "easy",
        max_attempts: 1,
        created_on: new Date(),
        updated_on: new Date(),
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };
  const saveQuestions = () => {
    const invalid = questions.filter((q) => !q.questionText.trim() || !q.answer.trim());
    if (invalid.length > 0) return alert("Every question needs text and an answer.");

    const updatedQuestions = questions.map((q) => {
      const matchedTable = availableTables.find((t) => q.questionText.toLowerCase().includes(t.toLowerCase()));
      return { ...q, table: matchedTable || q.table };
    });

    onAddQuestions(updatedQuestions);
    setSavedCount(updatedQuestions.length);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Create Question Set</h1>
      <div className="container">
        <div style={{ marginBottom: "30px" }}>
          <h3>Select Dataset</h3>
          <select value={selectedDataset} onChange={handleDatasetChange}>
            <option value="" disabled>-- Choose Dataset --</option>
            {datasets.map((ds) => (
              <option key={ds} value={ds}>{ds}</option>
            ))}
          </select>
        </div>

        {selectedDataset && (
          <div style={{ marginBottom: "30px" }}>
            <h3>Table's Shema</h3>
            <select value={selectedTableForSchema ?? ""} onChange={(e) =>
              setSelectedTableForSchema(e.target.value)}>
              <option value="" disabled>-- View Table Schema --</option>
              {availableTables.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {selectedTableForSchema && <TableSchema info={tableSchemas[selectedTableForSchema]} />}
          </div>
        )}
      </div>

      {/* Questions take full width; code editor is fixed overlay on right */}
      <div className="layout-wrapper">

        <div className="questions-wrapper">
          <h2>Questions</h2>
          <button disabled={!selectedDataset} onClick={addQuestion}>Add Question</button>
          {savedCount > 0 && <span style={{ marginLeft: "12px", color: "green" }}>✓ {savedCount} question(s) saved</span>}

          {questions.map((q, index) => (
            <div key={index} className="question-row">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0 }}>Question {index + 1}</h4>
                <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== index))}>✕</button>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

                {availableTables.map((table) => (
                  <div key={table} style={{ marginBottom: "12px" }}>
                    <label style={{ marginRight: "15px" }}>
                      <input
                        type="checkbox"
                        checked={selectedTable.includes(table)}
                        onChange={
                          (e) => {
                            const checked = e.target.checked; // ✅ comes from the event
                            setSelectedTable((prev) =>
                              // checked ? prev.filter((t) => t !== table) : [...prev, table]
                              checked
                                ? [...prev, table]                 // add if checked
                                : prev.filter((t) => t !== table)  // remove if unchecked
                            );
                          }}
                      />
                      {" "}{table}
                    </label>
                  </div>
                ))}

                <select
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const preset = JSON.parse(e.target.value);

                    updateQuestion(index, "questionText", preset.question);
                    updateQuestion(index, "answer", preset.answer);
                    updateQuestion(index, "mark", preset.mark);
                    updateQuestion(index, "max_attempts", preset.max_attempts || 1);
                    updateQuestion(index, "difficulty", preset.difficulty || "easy");
                    updateQuestion(index, "presetId", preset.id);
                  }}
                >
                  
                  <option value="">-- Select Preset Question --</option>
                  {(q.filterTable
                    ? presets.filter((p) => p.tableName === q.filterTable)
                    : selectedTable.length > 0
                      ? presets.filter((p) => selectedTable.includes(p.tableName))
                      : presets
                  ).map((preset) => (
                    <option key={preset.id} value={JSON.stringify(preset)}>
                      {preset.question}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                placeholder="Write new question..."
                value={q.questionText}
                onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
                style={{ height: "80px", marginTop: "10px" }}
              />

              <textarea
                placeholder="Answer..."
                value={q.answer}
                onChange={(e) => updateQuestion(index, "answer", e.target.value)}
                style={{ height: "80px", marginTop: "8px" }}
              />

              <label>
                <input type="checkbox"
                  checked={q.orderMatters}
                  onChange={(e) => updateQuestion(index, "orderMatters", e.target.checked)} />
                {" "}Order Matters
              </label>
              <label>
                <input
                  type="checkbox" checked={q.aliasStrict}
                  onChange={(e) => updateQuestion(index, "aliasStrict", e.target.checked)} />
                {" "}Alias Strict
              </label>
              <div className="container">
                <label>
                  Max Attempts:
                  <input
                    type="Number"
                    min="1"
                    value={q.max_attempts}
                    onChange={(e) => updateQuestion(index, "max_attempts", e.target.value)}
                    style={{ width: "50px", marginLeft: "6px" }}
                  />
                </label>
                <label>
                  Difficulty:
                  <select value={q.difficulty}
                    onChange={(e) => updateQuestion(index, "difficulty", e.target.value)}
                    style={{ marginLeft: "6px" }}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <label>
                  Question Marks:
                  <input type="Number" min="0" value={q.mark}
                    onChange={(e) => updateQuestion(index, "mark", e.target.value)}
                    style={{ width: "50px", marginLeft: "6px" }} />
                </label>
              </div>
              {/* <button
                onClick={() => {
                  const tableName = selectedTable.join("_");
                  if (q.presetId)
                    updatePresetQuestion(q.presetId, {
                      datasetName: selectedDataset,
                      // tableName: q.table || tableName,
                      question: q.questionText,
                      answer: q.answer,
                      mark: q.mark,
                      difficulty:q.difficulty,
                      max_attempts:q.max_attempts
                    }).then(() => alert("Preset updated to Firebase!"))
                  else {
                    addPresetQuestion({
                      datasetName: selectedDataset,
                      // tableName: q.table || tableName,
                      question: q.questionText,
                      answer: q.answer,
                      mark: q.mark,
                      difficulty:q.difficulty,
                      max_attempts:q.max_attempts
                    }).then(() => alert("Preset added to Firebase!"))


                  }
                }
                }
              >
                Save as Preset
              </button> */}
            </div>
          ))}

          {questions.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <button
                style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "black", color: "white" }}
                onClick={saveQuestions}
              >
                Save Questions
              </button>
            </div>
          )}
        </div>



      </div>
      <CodeEditor selectedDataset={selectedDataset} />
    </div>
  );
}

export default CreateQuestionSet