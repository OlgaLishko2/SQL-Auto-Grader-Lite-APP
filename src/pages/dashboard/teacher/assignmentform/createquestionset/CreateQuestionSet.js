import { useState, useEffect } from "react";
import { useAppContext } from "../../../../../components/db/service/context";
import { addQuestionToAssignment } from "../../../../../components/model/assignments";
import { getPresetQuestions } from '../../../../../components/model/presetQuestions';
import TableSchema from '../../../tableView/TableSchema'
import { CodeEditor } from "./CodeEditor";
import './CreateQuestionSet.css';
import CollapsiblePanel from '../collapsiblepanel/CollapsiblePanel';
import { question } from "fontawesome";

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
  const filteredPresets = selectedTable.length > 0
    ? presets.filter(p => selectedTable.every(t => p.answer?.toLowerCase().includes(t.toLowerCase())))
    : presets;

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
        question_id: crypto.randomUUID(),
        table: "",
        questionText: "",
        answer: "",
        orderMatters: false,
        aliasStrict: false,
        mark: 1,
        created_on: new Date(),
        updated_on: new Date(),
        collapsed: false, 
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
      return { 
        ...q, 
        table: matchedTable || q.table,
        collapsed: true, 
      };
    });

    onAddQuestions(updatedQuestions);
    setQuestions(updatedQuestions);
    setSavedCount(updatedQuestions.length);
  };

  const toggleQuestionCollapse = (index) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, collapsed: !q.collapsed } : q
      )
    );
  };

  return (
    <div>
      <h1>Create Question Set</h1>
      <div className='container'>
        <div>
          <h3>Select Dataset</h3>
          <select value={selectedDataset} onChange={handleDatasetChange} style={{ width: '100%' }}>
            <option value="" disabled>-- Choose Dataset --</option>
            {datasets.map((ds) => (
              <option key={ds} value={ds}>{ds}</option>
            ))}
          </select>
        </div>

        {selectedDataset && (
          <div>
            <h3>View Table Schema</h3>
            <select value={selectedTableForSchema ?? ""} onChange={(e) => setSelectedTableForSchema(e.target.value)} style={{ width: '100%' }}>
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
      {selectedDataset && (<>
        <div className="layout-wrapper">
          <div className="questions-wrapper">
            <h2>Questions</h2>
            <button disabled={!selectedDataset} onClick={addQuestion}>Add Question</button>
            {savedCount > 0 && <span style={{ marginLeft: "12px", color: "green" }}>✓ {savedCount} question(s) saved</span>}

          {questions.map((q, index) => (
            <CollapsiblePanel
              key={index}
              title={`Question ${index + 1}`}
              preview={
                q.questionText
                  ? (q.questionText.length > 80
                      ? q.questionText.substring(0, 80) + "…"
                      : q.questionText)
                  : "(no question text yet)"
              }
              isCollapsed={q.collapsed ?? false}   // default to false if undefined
              onToggle={() => toggleQuestionCollapse(index)}              
            >
              <div className="question-row">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0 }}>Question {index + 1}</h4>
                  <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== index))}>✕</button>
                </div>

                <div>
                  <label>Filter Questions by Table:</label>
                  <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {availableTables.map((table) => (
                      <div key={table}>
                        <label>
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
                  </div>
                  <select
                    style={{ width: '100%' }}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const preset = JSON.parse(e.target.value);

                      updateQuestion(index, "questionText", preset.question);
                      updateQuestion(index, "answer", preset.answer);
                      const matchedTables = availableTables.filter((t) =>
                        preset.answer.toLowerCase().includes(t.toLowerCase())
                      );
                      const tableString = matchedTables.join(", ");
                      console.log(tableString);

                      updateQuestion(index, "table", tableString);
                      updateQuestion(index, "mark", preset.mark);
                      updateQuestion(index, "presetId", preset.id);
                    }}
                  >

                    <option value="">-- Select Preset Question (optional) --</option>
                    {filteredPresets.map(p => (
                      <option key={p.id} value={JSON.stringify(p)}>{p.question}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  placeholder="Write new question..."
                  value={q.questionText}
                  onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
                  style={{ height: "80px" }}
                />

                <textarea
                  placeholder="Answer..."
                  value={q.answer}
                  onChange={(e) => updateQuestion(index, "answer", e.target.value)}
                  style={{ height: "80px" }}
                />
                <p style={{ color: 'blue' }}><strong>Detected Table:</strong> {q.table || "None"}</p>
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                  <label>
                    Question Marks:
                    <input type="Number" min="0" value={q.mark}
                      onChange={(e) => updateQuestion(index, "mark", e.target.value)}
                      style={{ width: "50px", marginLeft: "6px" }} />
                  </label>
                </div>
              </div>
              </CollapsiblePanel>
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
        <CodeEditor selectedDataset={selectedDataset} /></>)}
    </div>
  );
}

export default CreateQuestionSet