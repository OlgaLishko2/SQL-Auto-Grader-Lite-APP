import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewQuiz, getAllQuizByOwner } from "../../../../components/model/quizzes";
import { getCohortsByOwner, getAllStudents } from "../../../../components/model/cohorts";
import { getPresetQuestions } from "../../../../components/model/presetQuestions";
import { useAppContext } from "../../../../components/db/service/context";
import { sendQuizEmail } from "../../../../components/services/email";
import TableSchema from "../../tableView/TableSchema";
import { CodeEditor } from '../assignmentform/createquestionset/CodeEditor';
import userSession from "../../../../components/services/UserSession";

const QuizForm = ({ onDone }) => {
  const navigate = useNavigate();
  const { allDataset, allTables, getTableSchemaInTable, runSelectQuery} = useAppContext();

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
    tables: '',
    dataset: '',
    selectedPreset: null,
    questionText: '',
    answer: '',
    difficulty: 'easy',
    max_attempts: 1,
    mark: 1,
    orderMatters: false,
    aliasStrict: false,
    student_class: '',
  });

  useEffect(() => {
    allDataset().then((data) => setDatasets(data.map((d) => d.datasetName)));
    getCohortsByOwner(userSession.uid).then(setCohorts);
    getAllQuizByOwner(userSession.uid).then(quizzes => {
      const today = new Date();
      const todayStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });
      const todayCount = quizzes.filter(q => {
        const d = new Date(q.created_on?.seconds ? q.created_on.seconds * 1000 : q.created_on);
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric" }) === todayStr;
      }).length;
      setFormData(prev => ({ ...prev, title: `${todayStr}-${todayCount + 1}` }));
    });
  }, [allDataset]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      orderMatters: preset?.orderMatters || false,
      aliasStrict: preset?.aliasStrict || false,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!formData.title.trim()) return setError("Title is required.");
    if (!formData.questionText.trim()) return setError("Question text is required.");
    if (!formData.answer.trim()) return setError("Answer is required.");
    if (!formData.student_class) return setError("Please select a cohort.");

    try {
      const validation = await runSelectQuery(formData.dataset, formData.answer)
      if (!validation?.isSuccessful) return setError(`Invalid answer SQL: ${validation?.message || "query failed"}.`);
      if (!validation.data?.length || validation.data[0]?.values?.length === 0) return setError("Answer SQL returns no rows, please select another question.");

      const id = await createNewQuiz({
        title: formData.title,
        owner_user_id: userSession.uid,
        dataset: formData.dataset,
        student_class: formData.student_class,
        questionText: formData.questionText,
        answer: formData.answer,
        difficulty: formData.difficulty,
        max_attempts: Number(formData.max_attempts),
        mark: Number(formData.mark),
        tables: availableTables.filter((t) =>
          formData.answer.toLowerCase().includes(t.toLowerCase())
        ),
        orderMatters: formData.orderMatters,
        aliasStrict: formData.aliasStrict,
        created_on: new Date(),
      });
      const cohort = cohorts.find((c) => c.cohort_id === formData.student_class);
      if (cohort?.student_uids?.length) {
        const allStudentsList = await getAllStudents();
        const cohortStudents = allStudentsList.filter((s) => cohort.student_uids.includes(s.uid));
        await Promise.all(cohortStudents.map((s) => sendQuizEmail(s, formData.title, id)));
      }
      onDone();
    } catch (err) {
      setError("Failed to create quiz: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '100%', margin: '20px auto', border: '1px solid #ccc', padding: '20px' }}>
      {onDone && (
        <button type="button" onClick={onDone} style={{ marginBottom: "16px" }}>
          ← Back to Quizzes
        </button>
      )}
      <h2>Create Quiz</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label>Title: <strong>{formData.title}</strong></label>
        </div>

        <div>
          <label>Dataset</label><br />
          <select name="dataset" value={formData.dataset} onChange={handleDatasetChange}>
            <option value="" disabled>-- Select Dataset --</option>
            {datasets.map(ds => <option key={ds} value={ds}>{ds}</option>)}
          </select>
        </div>

        {formData.dataset !== '' && (
          <>
            <div>
              <label>View Table Schema</label><br />
              <select value={selectedTableForSchema} onChange={e => setSelectedTableForSchema(e.target.value)}>
                <option value="" disabled>-- Select Table --</option>
                {availableTables.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {selectedTableForSchema && <TableSchema info={tableSchemas[selectedTableForSchema]} />}
            </div>

            <CodeEditor selectedDataset={formData.dataset} />

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

            <div>
              <label>Preset Question (optional)</label><br />
              <select onChange={handlePresetChange} style={{ maxWidth: '800px', width: '100%' }}>
                <option value="">-- Select a Preset or type below --</option>
                {filteredPresets.map(p => (
                  <option key={p.id} value={JSON.stringify(p)}>{p.question}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Question Text</label><br />
              <textarea name="questionText" value={formData.questionText} onChange={handleChange}
                placeholder="Type your question here..."
                style={{ maxWidth: '800px', width: '100%', height: '80px', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
            </div>

            <div>
              <label>Answer (SQL)</label><br />
              <textarea name="answer" value={formData.answer} onChange={handleChange}
                placeholder="Expected SQL answer..."
                style={{ maxWidth: '800px', width: '100%', height: '80px', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                <label style={{ marginTop: '10px' }}>Difficulty: </label><br />
                <select name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  style={{ width: '80px' }}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                <label style={{ marginTop: '10px' }}>Max Attempts: </label><br />
                <input type="number" name="max_attempts" min="1" value={formData.max_attempts}
                  onChange={handleChange} style={{ width: '80px', height: '80%' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                <label style={{ marginTop: '10px' }}>Mark: </label><br />
                <input type="number" name="mark" min="0" value={formData.mark}
                  onChange={handleChange} style={{ width: '80px', height: '80%' }} />
              </div>

            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <label>
                <input type="checkbox" name="orderMatters" checked={formData.orderMatters} onChange={handleChange} />
                {' '}Order Matters
              </label>
              <label>
                <input type="checkbox" name="aliasStrict" checked={formData.aliasStrict} onChange={handleChange} />
                {' '}Alias Strict
              </label>
            </div>
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
          </>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="button" onClick={handleSubmit}
          style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', cursor: 'pointer' }}>
          Create Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizForm;
