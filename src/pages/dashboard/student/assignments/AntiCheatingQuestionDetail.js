import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../../../firebase";
import "./AssignmentDetail.css";
import { useAppContext } from "../../../../components/db/service/context";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { SQL_KEYWORDS } from "../../../../components/db/common";
import { autocompletion, completeFromList } from "@codemirror/autocomplete";
import { isSelectQuery } from "../../../../components/db/queryValidation";
import { createAttempt } from "../../../../components/model/questionAttempts";
import { compareQueryResult } from "../../../../components/comparison/sqlComparison";

const AntiCheatingQuestionDetail = () => {
  const { runSelectQuery } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const question = location.state?.question;
  const dataset = location.state?.dataset;

  const earnedPoints = 10;
  const [sqlCode, setSqlCode] = useState("");
  const [expectedResult, setExpectedResult] = useState([]);
  const [studentResult, setStudentResult] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [error, setError] = useState("");
  const isRunQuery = false;
  const isSubmit = false;

  useEffect(() => {
    if (!dataset || !question?.answer) return;

    const loadExpectedResult = async () => {
      const result = await runSelectQuery(dataset, question.answer);
      setExpectedResult(result);
    };

    loadExpectedResult();
  }, [dataset, question?.answer, runSelectQuery]);

  async function runQuery() {
    if (!isSelectQuery(sqlCode)) {
      setError("Only SELECT queries are allowed.");
      return;
    }

    setError("");
    const result = await runSelectQuery(dataset, sqlCode);
    setStudentResult(result);

    const comparationResult = compareQueryResult(
      expectedResult,
      result,
      question?.orderMatters,
      question?.aliasStrict,
    );
    setIsCorrect(comparationResult);
  }

  function submitQuery() {
    const user = auth.currentUser;
    if (!user) return;

    const comparationResult = compareQueryResult(
      expectedResult,
      studentResult,
      question?.orderMatters,
      question?.aliasStrict,
    );

    setIsCorrect(comparationResult);

    const attemptObj = {
      question_id: question?.question_id,
      student_user_id: user.uid,
      submitted_on: Date.now(),
      submitted_sql: sqlCode,
      is_correct: comparationResult,
    };

    createAttempt(attemptObj);
  }

  const sqlKeywordCompletions = completeFromList(
    SQL_KEYWORDS.map((keyword) => ({
      label: keyword,
      type: "keyword",
    })),
  );

  return (
    <div className="workspace-container">
      <div className="workspace-content">
        <div className="instructions-panel">
          <div className="panel-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              Back to Assignments
            </button>
          </div>

          <div className="panel-content">
            <span className="badge-problem">
              Problem {question?.question_id}
            </span>
            <p>{question?.questionText}</p>

            <div className="table-schema">
              <h3>Table: CITY</h3>
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ID</td>
                    <td>NUMBER</td>
                  </tr>
                  <tr>
                    <td>NAME</td>
                    <td>VARCHAR2(17)</td>
                  </tr>
                  <tr>
                    <td>COUNTRYCODE</td>
                    <td>VARCHAR2(3)</td>
                  </tr>
                  <tr>
                    <td>POPULATION</td>
                    <td>NUMBER</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
              Run Query
            </button>
            <button className="btn-submit" onClick={submitQuery}>
              Submit
            </button>
          </div>

          <div className="result-section">
            <section className="points-banner hidingTag">
              <div className="points-copy">
                <h3>You have earned {question.mark} points!</h3>
              </div>
            </section>
            {studentResult.length > 0 && (
              <div className="result-status-bar">
                {isCorrect ? (
                  <>
                    <p className="compile-success">Congratulations!</p>
                    <p>You have passed the sample test cases.</p>
                  </>
                ) : (
                  <>
                    <p className="compile-error">Wrong Answer</p>
                    <p>Your result doesn&apos;t match the expected output.</p>
                  </>
                )}
              </div>
            )}

            <div className="result-status-bar">
              <h6>Compiler Message</h6>
              {error ? (
                <p>{error}</p>
              ) : (
                <p>Run your query to view the result.</p>
              )}
            </div>

            <div className="result-table">
              <h6>Your Output (stdout)</h6>
              {studentResult.length === 0 && (
                <span className="empty-state">~ no response on stdout ~</span>
              )}
              <div className="table-placeholder">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {studentResult[0]?.lc?.map((col) => (
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
                    {studentResult[0]?.values?.map((row, i) => (
                      <tr key={i}>
                        {row.map((val, j) => (
                          <td
                            key={j}
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="result-table">
              <h6>Expected Output</h6>
              <div className="table-placeholder">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {expectedResult[0]?.lc?.map((col) => (
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
                    {expectedResult[0]?.values?.map((row, i) => (
                      <tr key={i}>
                        {row.map((val, j) => (
                          <td
                            key={j}
                            style={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntiCheatingQuestionDetail;
