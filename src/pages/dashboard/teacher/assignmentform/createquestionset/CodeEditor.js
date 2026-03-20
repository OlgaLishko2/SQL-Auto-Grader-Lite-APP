import {useState} from 'react'
import { useAppContext } from "../../../../../components/db/service/context";

export const CodeEditor = ({selectedDataset}) => {
    const { runSelectQuery } = useAppContext();
    const [studentQuery, setStudentQuery] = useState("");
      const [queryResult, setQueryResult] = useState("");
    const executeQuery = async (query) => {
        const result = await runSelectQuery(selectedDataset, query);
        const values = result[0]?.values ?? [];
        setQueryResult(values.map((row) => row.join(", ")).join("\n"));
    };
    return (
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
    )
};