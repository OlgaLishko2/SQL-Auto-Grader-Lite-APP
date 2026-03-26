import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AssignmentDetail.css";
import { useAppContext } from "../../../../components/db/service/context";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { SQL_KEYWORDS } from "../../../../components/db/common";
import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { EditorView, keymap } from "@codemirror/view";
import {
  isSelectQuery,
  normalizeQuery,
} from "../../../../components/db/queryValidation";
import { createAttempt } from "../../../../components/model/questionAttempts";
import { compareQueryResult } from "../../../../components/comparison/sqlComparison";
import LoadingOverlay from "../LoadingOverlay";
import userSession from "../../../../components/services/UserSession";
import { useAntiCheat } from "../../../../components/hooks/useAntiCheat";
import ResultTable from "./ResultTable";

const AntiCheatingQuestionDetail = () => {
  const { fetchItems } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const assignment_id = location.state?.assignment_id;
  const question = location.state?.question;
  const dataset = location.state?.dataset;
  const [sqlCode, setSqlCode] = useState("");
  const [expectedResult, setExpectedResult] = useState([]);
  const [studentResult, setStudentResult] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [error, setError] = useState("");
  const [tableSchemas, setTableSchemas] = useState([]);
  const { getTableSchemaInTable } = useAppContext();
  const [isSubmit, setIsSubmmit] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(question?.attemptTime);
  const [isLoading, setIsLoading] = useState(true);
  // const [bestRunResult, setBestRunResult] = useState({ isCorrect: false, sql: "" });
  useAntiCheat(undefined, { enableFullscreen: true });
  const [antiCheatMessage, setAntiCheatMessage] = useState("");

  const { violations } = useAntiCheat((violation) => {
    setAntiCheatMessage(
      `Anti-cheat violation detected: ${violation.type.replaceAll("_", " ")}`,
    );
  });

  useEffect(() => {
    if (!dataset || !question?.answer) return;

    const loadExpectedResult = async () => {
      const result = await fetchItems(dataset, question.answer);
      if (result?.isSuccessful && result.data?.length > 0) {
        const columns = Object.keys(result.data[0]);
        const values = result.data.map((row) => Object.values(row));
        const formatted = [{ lc: columns, values }];
        setExpectedResult(formatted);
        setIsLoading(false);
      }
    };

    loadExpectedResult();
  }, [dataset, question?.answer, fetchItems]);

  useEffect(() => {
    if (!dataset || !question?.table) {
      console.log(`${dataset}, ${question?.table}`);
      return;
    }
    const loadSchema = async () => {
      const tables = question.table.split(",").map((t) => t.trim());
      const results = await Promise.all(
        tables.map(async (table) => {
          const schema = await getTableSchemaInTable(dataset, table);
          return [table, schema];
        }),
      );
      setTableSchemas(results);
      setIsLoading(false);
    };
    loadSchema();
  }, [dataset, question?.table]);

  async function excuteQueryAndCompare() {
    if (!isSelectQuery(sqlCode)) {
      setError("Only SELECT queries are allowed.");
      setStudentResult([]);
      setIsCorrect(false);
      return false;
    }

    const result = await fetchItems(dataset, normalizeQuery(sqlCode));
    if (result?.isSuccessful && result.data?.length > 0) {
      const rows = result.data;
      const columns = Object.keys(rows[0]);

      // 2. Extract Values (convert each object into an array of its values)
      const values = rows.map((row) => Object.values(row));

      // 3. Format it for your JSX
      const formattedData = {
        lc: columns,
        values: values,
      };
      setError("");
      setStudentResult([formattedData]);
      const correct = compareQueryResult(
        expectedResult,
        [formattedData],
        question?.orderMatters,
        question?.aliasStrict,
      );
      setIsCorrect(correct);
      return correct;
    } else {
      setStudentResult([]);
      setError(result.message);
      setIsCorrect(false);
      return false;
    }
  }

  async function runQuery() {
    setShowResults(true);
    // const correct = await excuteQueryAndCompare();
    // Track best run result for submit
    // if (correct || !bestRunResult.isCorrect) {
    //   setBestRunResult({ isCorrect: correct, sql: normalizeQuery(sqlCode) });
    // }
    setIsSubmmit(false);
    await excuteQueryAndCompare();
    setIsLoading(false);
    setShowResults(true);
  }

  async function submitQuery() {
    const nextAttempt = (currentAttempt ?? 0) + 1;
    if (currentAttempt >= 1) {
      alert("You have reached the max attempt");
      return;
    }
    setShowResults(true);
    const currentResult = await excuteQueryAndCompare();
    // const finalCorrect = currentResult || bestRunResult.isCorrect;
    // const finalSql = finalCorrect && !currentResult ? bestRunResult.sql : normalizeQuery(sqlCode);
    setCurrentAttempt(nextAttempt);
    const comparationResult = await excuteQueryAndCompare();
    const attemptObj = {
      question_id: question?.question_id,
      student_user_id: userSession.uid,
      submitted_on: new Date().toLocaleDateString("en-CA"),
      submitted_sql: sqlCode,
      is_correct: comparationResult,
    };

    await createAttempt(attemptObj);
    setIsSubmmit(true);
    alert("Your code has been submitted");
  }

  const sqlKeywordCompletions = completeFromList(
    SQL_KEYWORDS.map((keyword) => ({
      label: keyword,
      type: "keyword",
    })),
  );

  return (
    <>
      <LoadingOverlay isOpen={isLoading} message="Loading..." />
      <div className="workspace-container">
        <div className="workspace-content">
          <div className="instructions-panel">
            <div className="panel-header">
              <button
                className="back-btn"
                onClick={() =>
                  navigate(`/dashboard/questions/${assignment_id}`, {
                    state: { assignment: location.state?.assignment },
                  })
                }
              >
                Back to Assignment
              </button>
            </div>

            <div className="panel-content">
              <div className="problem-badge-group">
                <span className="badge-problem">
                  Problem {question?.question_id}
                </span>

                <div className="problem-rule-badges">
                  {question?.orderMatters === true && (
                    <span className="badge-problem">Order Matter</span>
                  )}

                  {question?.aliasStrict === true && (
                    <span className="badge-problem">Alias Strict</span>
                  )}
                </div>
              </div>

              <p>{question?.questionText}</p>

              {tableSchemas.map((schema) => (
                <div className="table-schema" key={schema[0]}>
                  <h3>{`Table: ${schema[0]}`}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema[1].map((row) => (
                        <tr key={`${schema[0]}-${row.name}`}>
                          <td>{row.name}</td>
                          <td>{row.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          <div className="editor-panel">
            {antiCheatMessage && (
              <div className="result-status-bar">
                <p className="compile-error">{antiCheatMessage}</p>
              </div>
            )}
            <div className="editor-section">
              <div className="editor-header">
                <span>SQL Query Editor</span>
              </div>
              <CodeMirror
                value={sqlCode}
                className="code-input"
                height="200px"
                basicSetup={{ lineNumbers: true, foldGutter: false }}
                extensions={[
                  sql(),
                  autocompletion({ override: [sqlKeywordCompletions] }),
                  EditorView.lineWrapping,
                  keymap.of([
                    { key: "Mod-v", run: () => true },
                    { key: "Mod-c", run: () => true },
                  ]),
                ]}
                onChange={(value) => setSqlCode(value)}
              />
            </div>

            <div className="editor-btns">
              <button className="btn-run" onClick={runQuery}>
                Run Code
              </button>
              <button className="btn-submit" onClick={submitQuery}>
                Submit Code
              </button>
            </div>
            {showResults && (
              <div className="result-section">
                {isSubmit && isCorrect && (
                  <section className="points-banner">
                    <div className="points-copy">
                      <h4>You have earned {question.mark} points!</h4>
                    </div>
                  </section>
                )}

                <div className="result-status-bar">
                  {isCorrect ? (
                    <>
                      <p className="compile-success">Congratulations!</p>
                      <p>You have passed the sample test cases.</p>
                    </>
                  ) : error ? (
                    <>
                      <p className="compile-error">Runtime Error</p>
                    </>
                  ) : (
                    <>
                      <p className="compile-error">Wrong Answer</p>
                      <p>Your result doesn&apos;t match the expected output.</p>
                    </>
                  )}
                </div>

                {error && (
                  <div className="result-status-bar">
                    <h6>Compiler Message</h6>
                    <p>{error}</p>
                  </div>
                )}

                {showResults && !error && (
                  <>
                    <ResultTable
                      title="Your Output (stdout)"
                      result={studentResult}
                    />
                    <ResultTable
                      title="Expected Output"
                      result={expectedResult}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AntiCheatingQuestionDetail;
