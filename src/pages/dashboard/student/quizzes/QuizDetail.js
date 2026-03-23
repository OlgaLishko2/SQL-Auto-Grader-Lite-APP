import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../../../firebase";
import { useAppContext } from "../../../../components/db/service/context";
import { isSelectQuery } from "../../../../components/db/queryValidation";
import { compareQueryResult } from "../../../../components/comparison/sqlComparison";
import { submitStudentQuiz } from "./studentQuizModel";
import "../assignments/AssignmentDetail.css";
import TableSchema from "../../tableView/TableSchema";

const QuizDetail = () => {
  const { runSelectQuery, getTableSchemaInTable, fetchItems } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const quiz = location.state?.quiz;

  const [sqlCode, setSqlCode] = useState("");
  const [expectedResult, setExpectedResult] = useState([]);
  const [studentResult, setStudentResult] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [tableSchemas, setTableSchemas] = useState({});

  useEffect(() => {
    if (!quiz?.dataset || !quiz?.answer) return;
    fetchItems(quiz.dataset, quiz.answer).then(result => {
      const rows = result.data;
    
    // 1. Extract Column Names (the keys from the first object)
    const columns = Object.keys(rows[0]);
    
    // 2. Extract Values (convert each object into an array of its values)
    const values = rows.map(row => Object.values(row));

    // 3. Format it for your JSX
    const formattedData = {
        lc: columns,
        values: values
    };
      setExpectedResult(formattedData ? [formattedData] : []);
    });
    (quiz.tables || []).forEach(table => {
      getTableSchemaInTable(quiz.dataset, table).then(schema =>
        setTableSchemas(prev => ({ ...prev, [table]: schema }))
      );
    });
  }, [quiz]);

  const executeAndCompare = async () => {
    if (!isSelectQuery(sqlCode)) {
      setError("Only SELECT queries are allowed.");
      setStudentResult([]);
      setIsCorrect(false);
      return false;
    }
    const result = await fetchItems(quiz.dataset, sqlCode);
    if (result?.isSuccessful && result.data.length > 0) {
    const rows = result.data;
    
    // 1. Extract Column Names (the keys from the first object)
    const columns = Object.keys(rows[0]);
    
    // 2. Extract Values (convert each object into an array of its values)
    const values = rows.map(row => Object.values(row));

    // 3. Format it for your JSX
    const formattedData = {
        lc: columns,
        values: values
    };

    setError("");
    // Put it in an array since your JSX uses studentResult[0]
    setStudentResult([formattedData]); 
    
    // Note: Use formattedData directly here for comparison if needed
    const correct = compareQueryResult(expectedResult,  [formattedData], quiz?.orderMatters, quiz?.aliasStrict);
    setIsCorrect(correct);
    return correct;
} else {
    setStudentResult([]);
    setError(result?.data?.length === 0 ? "No rows returned." : "Query failed.");
    return false;
}
  };

  const runQuery = async () => {
    if (!sqlCode.trim()) { setError("Please write your answer first."); setShowResults(true); return; }
    setShowResults(true);
    const correct = await executeAndCompare();
    if (!correct && !submitted) {
      setAttemptsLeft(prev => {
        const next = prev - 1;
        return next;
      });
    }
  };

  const submitQuery = async () => {
    const user = auth.currentUser;
    if (!user || submitted) return;
    setShowResults(true);
    const correct = await executeAndCompare();
    await submitStudentQuiz({
      quiz_id: quiz.quiz_id,
      student_user_id: user.uid,
      submitted_sql: sqlCode,
      is_correct: correct,
      mark: correct ? (quiz.mark || 1) : 0,
    });
    setSubmitted(true);
  };

  const [attemptsLeft, setAttemptsLeft] = useState(quiz?.max_attempts || 1);
  const lost = attemptsLeft <= 0;

  if (!quiz) return <p>Quiz not found. <button onClick={() => navigate(-1)}>Go back</button></p>;

  return (
    <div className="workspace-container">
      <div className="workspace-content">
        <div className="instructions-panel">
          <div className="panel-header">
            <button className="back-btn" onClick={() => navigate(-1)}>← Quizzes</button>
          </div>
          <div className="panel-content">
            <span className="badge-problem">{quiz.title}</span>
            <p>{quiz.questionText}</p>
            <p><strong>Difficulty:</strong> {quiz.difficulty} | <strong>Mark:</strong> {quiz.mark} | <strong>Attempts:</strong> {attemptsLeft}</p>
            <p><strong>Order MAtters: </strong>{quiz.orderMatters?"Yes":"No"} | <strong>Alias Strict: </strong>{quiz.aliasStrict?"Yes":"No"}</p>
            {Object.entries(tableSchemas).map(([table, schema]) => (
              <>
              <p style={{marginTop:'20px'}}><strong>{table}</strong></p>
              <TableSchema key={table} info={schema} />
              </>
            ))}
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-section">
            <div className="editor-header"><span>SQL Query Editor</span></div>
            <textarea className="code-input" value={sqlCode}
              onChange={e => setSqlCode(e.target.value)}
              style={{ width: "100%", height: "200px", fontFamily: "monospace", padding: "8px" }}
              spellCheck="false" />
          </div>
          <div className="editor-btns">
            <button className="btn-run" onClick={runQuery} disabled={lost || submitted}>Run Code</button>
            <button className="btn-submit" onClick={submitQuery} disabled={lost || submitted}>
              {submitted ? "Submitted" : "Submit"}
            </button>
          </div>
          {lost && !submitted && (
            <div className="result-status-bar" style={{ background: '#fee2e2' }}>
              <p className="compile-error">You have used all attempts. You lost this quiz.</p>
            </div>
          )}

          {showResults && (
            <div className="result-section">
              {submitted && isCorrect && (
                <section className="points-banner">
                  <h3>You earned {quiz.mark} points!</h3>
                </section>
              )}
              <div className="result-status-bar">
                {isCorrect ? <p className="compile-success">Correct!</p>
                  : error ? <p className="compile-error">Runtime Error</p>
                  : <><p className="compile-error">Wrong Answer</p><p>Attempts left: <strong>{attemptsLeft}</strong></p></>}
              </div>
              {error && <div className="result-status-bar"><p>{error}</p></div>}
              {!error && (
                <>
                  <div className="result-table">
                    <h6>Your Output</h6>
                    {studentResult.length>0 ? (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>{studentResult[0].lc.map(c => <th key={c} style={{ padding: "8px", border: "1px solid #ddd" }}>{c}</th>)}</tr></thead>
                        <tbody>{(studentResult[0].values || []).map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j} style={{ border: "1px solid #ddd", padding: "8px" }}>{v !== null ? String(v) : ""}</td>)}</tr>)}</tbody>
                      </table>
                    ) : <span className="empty-state">~ no output ~</span>}
                  </div>
                  <div className="result-table">
                    <h6>Expected Output</h6>
                    {expectedResult.length>0 ? (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead><tr>{expectedResult[0].lc.map(c => <th key={c} style={{ padding: "8px", border: "1px solid #ddd" }}>{c}</th>)}</tr></thead>
                        <tbody>{(expectedResult[0].values || []).map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j} style={{ border: "1px solid #ddd", padding: "8px" }}>{v !== null ? String(v) : ""}</td>)}</tr>)}</tbody>
                      </table>
                    ) : <span className="empty-state">~ no output ~</span>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
