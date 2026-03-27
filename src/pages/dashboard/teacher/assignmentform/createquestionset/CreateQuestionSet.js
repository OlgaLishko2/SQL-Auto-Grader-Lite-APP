import { useState, useEffect } from "react";
import { useAppContext } from "../../../../../components/db/service/context";
import { getPresetQuestions } from '../../../../../components/model/presetQuestions';
import TableSchema from '../../../tableView/TableSchema';
import { CodeEditor } from "./CodeEditor";
import './CreateQuestionSet.css';
import CollapsiblePanel from '../collapsiblepanel/CollapsiblePanel';

function CreateQuestionSet({ onAddQuestions, setDb, existingQuestions = [], existingDataset = "", setTotalMarks }) {
  const { allTables, allDataset, getTableSchemaInTable, runSelectQuery } = useAppContext();

  const [selectedDataset, setSelectedDataset] = useState(existingDataset);
  const [datasets, setDatasets] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState([]);
  const [selectedTableForSchema, setSelectedTableForSchema] = useState();
  const [tableSchemas, setTableSchemas] = useState({});
  const [presets, setPresets] = useState([]);
  const [questions, setQuestions] = useState(existingQuestions);
  const [savedCount, setSavedCount] = useState(existingQuestions.length);
  const [total, setTotal] = useState(0);
 
  

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
      });
      getPresetQuestions(selectedDataset).then(setPresets);
    });
  }, [selectedDataset, allTables]);

  const handleDatasetChange = (e) => {
    if (questions.length > 0 && !window.confirm("Changing the dataset will remove all current questions. Continue?")) return;
    setSelectedDataset(e.target.value);
    setDb(e.target.value);
    setSelectedTable([]);
    setPresets([]);
    setQuestions([]);
    setSavedCount(0);
    onAddQuestions([]);
    setTotal(0);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question_id: crypto.randomUUID(),
      table: "", questionText: "", answer: "",
      orderMatters: false, aliasStrict: false, mark: 1,
      created_on: new Date(), updated_on: new Date(),
      collapsed: false,
    }]);    
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const saveQuestions = async () => {
    const invalid = questions.filter((q) => !q.questionText.trim() || !q.answer.trim());
    if (invalid.length > 0) return alert("Every question needs text and an answer.");
    const texts = questions.map(q => q.questionText.trim().toLowerCase());
    
    if (new Set(texts).size !== texts.length) return alert("Duplicate questions found. Please make each question unique.");
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const result = await runSelectQuery(selectedDataset, q.answer);
      if (!result?.isSuccessful || !result.data?.length) {
        return alert(`Question ${i + 1} has an invalid answer SQL — it failed or returned no rows.`);
      }      
    }
    const updatedQuestions = questions.map((q) => {
      const matchedTable = availableTables.find((t) => q.questionText.toLowerCase().includes(t.toLowerCase()));
      return { ...q, table: matchedTable || q.table, collapsed: true };
    });
    let final_grade = calculate_totalMarks(updatedQuestions);
    onAddQuestions(updatedQuestions);
    setQuestions(updatedQuestions);
    setSavedCount(updatedQuestions.length);
    setTotal(final_grade);
    setTotalMarks(final_grade);    
    console.log("inside saveQuestions: total marks:", final_grade);
  };

  const toggleQuestionCollapse = (index) => {
    setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, collapsed: !q.collapsed } : q));
  };

  const calculate_totalMarks = (question_array) => {
    let val = 0;
    for (let i = 0; i < question_array.length; i++) {      
      let q_mark = question_array[i].mark;
      let mark_per_question = typeof(q_mark) === "number"? q_mark : parseInt(q_mark);
      console.log(mark_per_question);
      val = val + mark_per_question;  
      console.log("Q#:",i, "mark: ", mark_per_question, "total: ", val);       
    }
    console.log("total : ", val, typeof(val));  
    return val;
  }

  return (
    <div>
      <h1>Create Question Set</h1>
      <div className='container'>
        <div>
          <h3>Select Dataset</h3>
          <select value={selectedDataset} onChange={handleDatasetChange} style={{ width: '100%' }}>
            <option value="" disabled>-- Choose Dataset --</option>
            {datasets.map((ds) => <option key={ds} value={ds}>{ds}</option>)}
          </select>
        </div>

        {selectedDataset && (
          <div>
            <h3>View Table Schema</h3>
            <select value={selectedTableForSchema ?? ""} onChange={(e) => setSelectedTableForSchema(e.target.value)} style={{ width: '100%' }}>
              <option value="" disabled>-- View Table Schema --</option>
              {availableTables.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {selectedTableForSchema && <TableSchema info={tableSchemas[selectedTableForSchema]} />}
          </div>
        )}
      </div>

      {selectedDataset && (<>
        <div className="layout-wrapper">
          <div className="questions-wrapper">
            <h2>Questions</h2>
            <button disabled={!selectedDataset} onClick={addQuestion}>Add Question</button>
            {savedCount > 0 && <span style={{ marginLeft: "12px", color: "green" }}>✓ {savedCount} question(s) saved</span>}
            {savedCount > 0 && <span style={{ marginLeft: "12px", color: "blue" }}>Total Marks:{total}</span>}

            {questions.map((q, index) => (
              <CollapsiblePanel
                key={index}
                title={`Question ${index + 1}`}
                preview={q.questionText ? (q.questionText.length > 80 ? q.questionText.substring(0, 80) + "…" : q.questionText) : "(no question text yet)"}
                isCollapsed={q.collapsed ?? false}
                onToggle={() => toggleQuestionCollapse(index)}
              >
                <div className="question-row">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0 }}>Question {index + 1}</h4>
                    <button type="button" onClick={() => {
                      if (!window.confirm("Remove this question?")) return;
                      setQuestions(questions.filter((_, i) => i !== index));
                      setSavedCount(0);
                    }}>✕</button>
                  </div>

                  <div>
                    <label>Filter Questions by Table:</label>
                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {availableTables.map((table) => (
                        <label key={table}>
                          <input type="checkbox" checked={selectedTable.includes(table)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedTable(prev => checked ? [...prev, table] : prev.filter(t => t !== table));
                            }} />
                          {" "}{table}
                        </label>
                      ))}
                    </div>
                    <select style={{ width: '100%' }} onChange={(e) => {
                      if (!e.target.value) return;
                      const preset = JSON.parse(e.target.value);
                      updateQuestion(index, "questionText", preset.question);
                      updateQuestion(index, "answer", preset.answer);
                      const matchedTables = availableTables.filter(t => preset.answer.toLowerCase().includes(t.toLowerCase()));
                      updateQuestion(index, "table", matchedTables.join(", "));
                      updateQuestion(index, "mark", preset.mark);
                      updateQuestion(index, "presetId", preset.id);
                    }}>
                      <option value="">-- Select Preset Question (optional) --</option>
                      {filteredPresets.map(p => <option key={p.id} value={JSON.stringify(p)}>{p.question}</option>)}
                    </select>
                  </div>

                  <textarea placeholder="Write new question..." value={q.questionText}
                    onChange={(e) => updateQuestion(index, "questionText", e.target.value)} style={{ height: "80px" }} />
                  <textarea placeholder="Answer..." value={q.answer}
                    onChange={(e) => updateQuestion(index, "answer", e.target.value)} style={{ height: "80px" }} />
                  <p style={{ color: 'blue' }}><strong>Detected Table:</strong> {q.table || "None"}</p>

                  <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <label>
                      <input type="checkbox" checked={q.orderMatters} onChange={(e) => updateQuestion(index, "orderMatters", e.target.checked)} />
                      {" "}Order Matters
                    </label>
                    <label>
                      <input type="checkbox" checked={q.aliasStrict} onChange={(e) => updateQuestion(index, "aliasStrict", e.target.checked)} />
                      {" "}Alias Strict
                    </label>
                    <label>
                      Question Marks:
                      <input type="Number" min="0" value={q.mark} onChange={(e) => updateQuestion(index, "mark", e.target.value)}
                        style={{ width: "50px", marginLeft: "6px" }} />
                    </label>
                  </div>
                </div>
              </CollapsiblePanel>
            ))}

            {questions.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <button style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "green", color: "white" }} onClick={saveQuestions} disabled={savedCount === questions.length}>
                  Save Questions
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={"corner-container"} style={{position: "fixed", top: "20px", right: "20px"}}>
          <CodeEditor selectedDataset={selectedDataset} />
        </div>
      </>)}
    </div>
  );
}

export default CreateQuestionSet;
