import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../../../firebase";
import { createNewQuiz } from "../../../../components/model/assignments";
import { getCohortsByOwner } from "../../../../components/model/cohorts";
import { getPresetQuestions } from "../../../../components/model/presetQuestions";
import { useAppContext } from "../../../../components/db/service/context";
import { getAllStudents } from "../../../../components/model/cohorts";
import { sendQuizEmail } from "../../../../components/services/email";

import TableSchema from "../../tableView/TableSchema";

const QuizForm = ({ onDone }) => {
  const navigate = useNavigate();
  const { allDataset, allTables, getTableSchemaInTable } = useAppContext();

  const [datasets, setDatasets] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [tableSchemas, setTableSchemas] = useState({});
  const [selectedTableForSchema, setSelectedTableForSchema] = useState("");
  const [selectedTables, setSelectedTables] = useState([]);
  const [presets, setPresets] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: '',
    dataset: '',
    selectedPreset: null,
    questionText: '',
    answer: '',
    difficulty: 'easy',
    max_attempts: 1,
    mark: 1,
    student_class: '',
  });

  useEffect(() => {
    allDataset().then((data) => setDatasets(data.map((d) => d.datasetName)));
    getCohortsByOwner(auth.currentUser.uid).then(setCohorts);
  }, [allDataset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDatasetChange = (e) => {
    const dataset = e.target.value;
    setFormData(prev => ({ ...prev, dataset, selectedPreset: null }));
    setSelectedTables([]);
    setSelectedTableForSchema("");
    setAvailableTables([]);
    setTableSchemas({});
    setPresets([]);
    if (!dataset) return;

    allTables(dataset).then((tables) => {
      const names = tables.map((t) => t.tableName);
      setAvailableTables(names);
      names.forEach((table) =>
        getTableSchemaInTable(dataset, table).then((schema) =>
          setTableSchemas((prev) => ({ ...prev, [table]: schema }))
        )
      );
    });
    getPresetQuestions(dataset).then(setPresets);
  };

  const toggleTable = (table, checked) => {
    setSelectedTables(prev => checked ? [...prev, table] : prev.filter(t => t !== table));
  };

  const filteredPresets = selectedTables.length > 0
    ? presets.filter(p => selectedTables.every(t => p.answer?.toLowerCase().includes(t.toLowerCase())))
    : presets;

  const handlePresetChange = (e) => {
    const preset = e.target.value ? JSON.parse(e.target.value) : null;
    setFormData(prev => ({
      ...prev,
      selectedPreset: preset,
      questionText: preset?.question || '',
      answer: preset?.answer || '',
      difficulty: preset?.difficulty || 'easy',
      max_attempts: preset?.max_attempts || 1,
      mark: preset?.mark || 1,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!formData.title.trim()) return setError("Title is required.");
    if (!formData.questionText.trim()) return setError("Question text is required.");
    if (!formData.answer.trim()) return setError("Answer is required.");
    if (!formData.student_class) return setError("Please select a cohort.");

    try {
      const id = await createNewQuiz({
        title: formData.title,
        due_date: new Date(),
        owner_user_id: auth.currentUser.uid,
        dataset: formData.dataset,
        student_class: formData.student_class,
        question: {
          ...(formData.selectedPreset || {}),
          questionText: formData.questionText,
          answer: formData.answer,
          difficulty: formData.difficulty,
          max_attempts: Number(formData.max_attempts),
          mark: Number(formData.mark),
        },
        created_on: new Date(),
        updated_on: new Date(),
      });
      const cohort = cohorts.find((c) => c.cohort_id === formData.student_class);
      if (cohort?.student_uids?.length) {
        const allStudents = await getAllStudents();
        const cohortStudents = allStudents.filter((s) => cohort.student_uids.includes(s.uid));
        await Promise.all(
          cohortStudents.map((s) => sendQuizEmail(s, formData.title, id))
        );
      }
      onDone();
    } catch (err) {
      setError("Failed to create quiz: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', border: '1px solid #ccc', padding: '20px' }}>
      {onDone && (
        <button type="button" onClick={onDone} style={{ marginBottom: "16px" }}>
          ← Back to Quizzes
        </button>
      )}
      <h2>Create Quiz</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label>Title</label><br />
          <input name="title" value={formData.title} onChange={handleChange}
            placeholder="Quiz title" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        {/* Dataset */}
        <div>
          <label>Dataset</label><br />
          <select name="dataset" value={formData.dataset} onChange={handleDatasetChange}>
            <option value="">-- Select Dataset --</option>
            {datasets.map(ds => <option key={ds} value={ds}>{ds}</option>)}
          </select>
        </div>

        {/* Table Schema Viewer */}
        {availableTables.length > 0 && (
          <div>
            <label>View Table Schema</label><br />
            <select value={selectedTableForSchema} onChange={e => setSelectedTableForSchema(e.target.value)}>
              <option value="">-- Select Table --</option>
              {availableTables.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {selectedTableForSchema && <TableSchema info={tableSchemas[selectedTableForSchema]} />}
          </div>
        )}

        {/* Filter presets by table */}
        {availableTables.length > 0 && (
          <div>
            <label>Filter Questions by Table</label><br />
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
              {availableTables.map(table => (
                <label key={table}>
                  <input type="checkbox" checked={selectedTables.includes(table)}
                    onChange={e => toggleTable(table, e.target.checked)} />
                  {' '}{table}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Question picker (optional preset) */}
        {formData.dataset && (
          <div>
            <label>Preset Question (optional)</label><br />
            <select onChange={handlePresetChange} style={{ width: '100%' }}>
              <option value="">-- Select a Preset or type below --</option>
              {filteredPresets.map(p => (
                <option key={p.id} value={JSON.stringify(p)}>{p.question}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label>Question Text</label><br />
          <textarea name="questionText" value={formData.questionText} onChange={handleChange}
            placeholder="Type your question here..."
            style={{ width: '100%', height: '80px', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
        </div>

        <div>
          <label>Answer (SQL)</label><br />
          <textarea name="answer" value={formData.answer} onChange={handleChange}
            placeholder="Expected SQL answer..."
            style={{ width: '100%', height: '80px', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <label>Difficulty</label><br />
            <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label>Max Attempts</label><br />
            <input type="number" name="max_attempts" min="1" value={formData.max_attempts}
              onChange={handleChange} style={{ width: '80px', padding: '6px' }} />
          </div>
          <div>
            <label>Mark</label><br />
            <input type="number" name="mark" min="0" value={formData.mark}
              onChange={handleChange} style={{ width: '80px', padding: '6px' }} />
          </div>
        </div>

        {/* Cohort */}
        <div>
          <label>Assign to Cohort</label><br />
          {cohorts.length === 0 ? (
            <p style={{ color: 'red' }}>
              No cohorts found.{' '}
              <span onClick={() => navigate('/dashboard/cohorts')}
                style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>
                Create a cohort first
              </span>
            </p>
          ) : (
            <select name="student_class" value={formData.student_class} onChange={handleChange}>
              <option value="">-- Select Cohort --</option>
              {cohorts.map(c => <option key={c.cohort_id} value={c.cohort_id}>{c.name}</option>)}
            </select>
          )}
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="button" onClick={handleSubmit}
          style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', cursor: 'pointer' }}>
          Create Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizForm;
