import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../../../firebase";
import "./AssignmentDetail.css";
import { useAppContext } from "../../../../components/db/service/context";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { SQL_KEYWORDS } from "../../../../components/db/common";
import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { isSelectQuery, normalizeQuery } from "../../../../components/db/queryValidation";
import { createAttempt } from "../../../../components/model/questionAttempts";
import { compareQueryResult } from "../../../../components/comparison/sqlComparison";
import LoadingOverlay from "../LoadingOverlay";
import userSession from "../../../../services/UserSession";

const AntiCheatingQuestionDetail = () => {
  const { runSelectQuery } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    if (!dataset || !question?.answer) return;

    const loadExpectedResult = async () => {
      const result = await runSelectQuery(dataset, question.answer);
      const resultData = Array.isArray(result?.data) ? result.data[0] : null;
      setExpectedResult(resultData || []);
      setIsLoading(false);
    };

    loadExpectedResult();
  }, [dataset, question?.answer, runSelectQuery]);

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

    const result = await runSelectQuery(dataset, sqlCode);
    const resultData = Array.isArray(result?.data) ? result.data[0] : null;

    if (!result?.isSuccessful || !resultData) {
      setError(result?.message || "Query execution failed.");
      setStudentResult([]);
      setIsCorrect(false);
      return false;
    }

    setError("");
    setStudentResult(resultData);

    const comparationResult = compareQueryResult(
      expectedResult,
      resultData,
      question?.orderMatters,
      question?.aliasStrict,
    );
    setIsCorrect(comparationResult);
    return comparationResult;
  }

  async function runQuery() {
    setShowResults(true);
    await excuteQueryAndCompare();
    setIsSubmmit(false);
    setIsLoading(false);
  }

  async function submitQuery() {
    setCurrentAttempt((prev) => prev + 1);
    setShowResults(true);
    const comparationResult = await excuteQueryAndCompare();
    console.log(currentAttempt);
    if (currentAttempt >= 1) {
      alert("You have reached the max attempt");
    } else {
      const attemptObj = {
        question_id: question?.question_id,
        student_user_id: userSession.uid,
        submitted_on: new Date().toLocaleDateString("en-CA"),
        submitted_sql: normalizeQuery(sqlCode),
        is_correct: comparationResult,
      };

      createAttempt(attemptObj);
      setIsSubmmit(true);
      setIsLoading(false);
    }
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
              <button className="back-btn" onClick={() => navigate(-1)}>
                Back to Assignments
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
            <div className="editor-section">
              <div className="editor-header">
                <span>SQL Query Editor</span>
              </div>

              <CodeMirror
                value={sqlCode}
                className="code-input"
                extensions={[
                  sql(),
                  autocompletion({
                    override: [sqlKeywordCompletions],
                  }),
                ]}
                onChange={(value) => {
                  setSqlCode(value);
                }}
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
                    <div className="result-table">
                      <h6>Your Output (stdout)</h6>
                      {!studentResult?.lc ? (
                        <span className="empty-state">
                          ~ no response on stdout ~
                        </span>
                      ) : (
                        <div className="table-placeholder">
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr>
                                {studentResult?.lc?.map((col) => (
                                  <th
                                    key={col}
                                    style={{
                                      padding: "10px",
                                      border: "1px solid #ddd",
                                      textAlign: "left",
                                    }}
                                  >
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {studentResult?.values?.map((row, i) => (
                                <tr key={i}>
                                  {row.map((val, j) => (
                                    <td
                                      key={j}
                                      style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                      }}
                                    >
                                      {val}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="result-table">
                      <h6>Expected Output</h6>
                      {!expectedResult?.lc ? (
                        <span className="empty-state">
                          ~ no response on stdout ~
                        </span>
                      ) : (
                        <div className="table-placeholder">
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr>
                                {expectedResult?.lc?.map((col) => (
                                  <th
                                    key={col}
                                    style={{
                                      padding: "10px",
                                      border: "1px solid #ddd",
                                      textAlign: "left",
                                    }}
                                  >
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {expectedResult?.values?.map((row, i) => (
                                <tr key={i}>
                                  {row.map((val, j) => (
                                    <td
                                      key={j}
                                      style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                      }}
                                    >
                                      {val}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
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
