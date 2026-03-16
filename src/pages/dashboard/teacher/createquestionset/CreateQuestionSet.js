import { useState, useEffect } from "react";
import { useAppContext } from "../../../../components/db/service/context";
import { createNewQuestion } from '../../../../components/model/questions';
import { getPresetQuestions, addPresetQuestion } from '../../../../components/model/presetQuestions';
import "./CreateQuestionSet.css";
// import { seedPresetQuestions } from '../../../../components/model/seedPresetQuestions';

function CreateQuestionSet({ assgnmntId, onSaved }) {
  const { runSelectQuery, allTables, allDataset } = useAppContext();

  const [selectedDataset, setSelectedDataset] = useState("");
  const [datasets, setDatasets] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [presets, setPresets] = useState({});
  const [questions, setQuestions] = useState([]);
  const [queryResult, setQueryResult] = useState("");

  useEffect(() => {
    allDataset().then((data) => setDatasets(data.map((d) => d.datasetName)));
  }, [allDataset]);

  useEffect(() => {
    if (!selectedDataset) return;
    allTables(selectedDataset).then((tables) =>
      setAvailableTables(tables.map((t) => t.tableName))
    );
  }, [selectedDataset, allTables]);

  useEffect(() => {
    if (!selectedDataset || selectedTables.length === 0) return;
    Promise.all(
      selectedTables.map((table) =>
        getPresetQuestions(selectedDataset, table).then((data) => ({ table, data }))
      )
    ).then((results) => {
      const map = {};
      results.forEach(({ table, data }) => (map[table] = data));
      setPresets(map);
    });
  }, [selectedDataset, selectedTables]);

  const handleDatasetChange = (e) => {
    setSelectedDataset(e.target.value);
    setSelectedTables([]);
    setQuestions([]);
  };

  const toggleTable = (table) => {
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        assignment_id: "",
        table: "",
        questionText: "",
        answer: "",
        preset: null,
        orderMatters: false,
        aliasStrict: false,
        max_number_of_attempts: 1,
        difficulty: "easy",
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

  const executeQuery = async (query) => {
    const result = await runSelectQuery(selectedDataset, query);
    const values = result[0]?.values ?? [];
    setQueryResult(values.map((row) => row.join(", ")).join("\n"));
  };

  const [studentQuery, setStudentQuery] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  const createAssignment = async () => {
    const invalid = questions.filter((q) => !q.questionText.trim() || !q.answer.trim());
    if (questions.length === 0) return alert("Add at least one question before saving.");
    if (invalid.length > 0) return alert("Every question must have both question text and an answer.");

    try {
      await Promise.all(
        questions.map((q) => createNewQuestion({ ...q, assignment_id: assgnmntId }))
      );
      setSavedCount(questions.length);
      if (onSaved) onSaved(questions.length);
      alert(`${questions.length} question(s) saved!`);
    } catch (err) {
      console.log("Error inserting questions:", err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Create Question Set</h1>

      <div style={{ marginBottom: "30px" }}>
        <h3>Select Dataset</h3>
        <select value={selectedDataset} onChange={handleDatasetChange}>
          <option value="">-- Choose Dataset --</option>
          {datasets.map((ds) => (
            <option key={ds} value={ds}>{ds}</option>
          ))}
        </select>
      </div>

      {selectedDataset && (
        <div style={{ marginBottom: "30px" }}>
          <h3>Select Tables</h3>
          {availableTables.map((table) => (
            <label key={table} style={{ marginRight: "15px" }}>
              <input
                type="checkbox"
                checked={selectedTables.includes(table)}
                onChange={() => toggleTable(table)}
              />
              {table}
            </label>
          ))}
        </div>
      )}

      {/* Questions take full width; code editor is fixed overlay on right */}
      <div>

        <div className="questions-wrapper">
          <h2>Questions</h2>
          <button disabled={!selectedDataset || selectedTables.length === 0} onClick={addQuestion}>Add Question</button>
          {savedCount > 0 && <span style={{ marginLeft: "12px", color: "green" }}>✓ {savedCount} question(s) saved</span>}

          {questions.map((q, index) => (
            <div key={index} className="question-row" style={{ flexDirection: "column" }}>
              <h4>Question {index + 1}</h4>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const preset = JSON.parse(e.target.value);
                  updateQuestion(index, "assignment_id", assgnmntId);
                  updateQuestion(index, "questionText", preset.question);
                  updateQuestion(index, "answer", preset.answer);
                  updateQuestion(index, "difficulty", preset.difficulty || "easy");
                }}
              >
                <option value="">-- Select Preset Question --</option>
                {selectedTables.map((table) =>
                  presets[table]?.map((preset) => (
                    <option key={preset.id} value={JSON.stringify(preset)}>
                      {preset.question}
                    </option>
                  ))
                )}
              </select>

              <textarea
                placeholder="Or write new question..."
                value={q.questionText}
                onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
                style={{ width: "100%", height: "80px", marginTop: "10px" }}
              />

              <textarea
                placeholder="Answer..."
                value={q.answer}
                onChange={(e) => updateQuestion(index, "answer", e.target.value)}
                style={{ width: "100%", height: "80px", marginTop: "8px" }}
              />

                <label>
                  <input type="checkbox" checked={q.orderMatters} onChange={(e) => updateQuestion(index, "orderMatters", e.target.checked)} />
                  {" "}Order Matters
                </label>
                <label>
                  <input type="checkbox" checked={q.aliasStrict} onChange={(e) => updateQuestion(index, "aliasStrict", e.target.checked)} />
                  {" "}Alias Strict
                </label>
                <label>
                  Max Attempts:
                  <input type="text" value={q.max_number_of_attempts} onChange={(e) => updateQuestion(index, "max_number_of_attempts", e.target.value)} style={{ width: "50px", marginLeft: "6px" }} />
                </label>
                <label>
                  Difficulty:
                  <select value={q.difficulty} onChange={(e) => updateQuestion(index, "difficulty", e.target.value)} style={{ marginLeft: "6px" }}>
                    <option value="easy">Easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <button
                  onClick={() =>
                    addPresetQuestion({
                      datasetName: selectedDataset,
                      tableName: q.table || selectedTables[0] || "",
                      question: q.questionText,
                      answer: q.answer,
                    }).then(() => alert("Preset saved to Firebase!"))
                  }
                >
                  Save as Preset
                </button>
              </div>
          ))}

          {questions.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <button
                style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "black", color: "white" }}
                onClick={createAssignment}
              >
                Save Questions
              </button>
            </div>
          )}
        </div>

        {/* Right: fixed code editor */}
        <div className="code-editor">
          <h4>Code Editor</h4>
          <textarea
            placeholder="Write SQL query here..."
            value={studentQuery}
            style={{ width: "100%", height: "160px", boxSizing: "border-box" }}
            onChange={(e) => setStudentQuery(e.target.value)}
          />
          <button style={{ marginTop: "10px" }} onClick={() => executeQuery(studentQuery)}>
            Execute
          </button>
          <textarea
            value={queryResult}
            readOnly
            style={{ width: "100%", height: "120px", marginTop: "10px", backgroundColor: "#f3f3f3", boxSizing: "border-box" }}
          />
        </div>

      </div>
    </div>
  );
}

export default CreateQuestionSet;
