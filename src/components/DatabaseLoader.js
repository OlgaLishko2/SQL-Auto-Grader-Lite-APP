//Sample file to guide how to get database instance and query data
import { useState } from "react";
import { runSelectQuery } from "../db/sqlOperations";
import { useDatabaseInitializer } from "../db/useDatabaseInitializer";
import { useDatabase } from "../db/useDatabase";

function DatabaseLoader() {
  const { dbA, dbB, loading, error } = useDatabase();
  const { activeDb, setActiveDb, seeded } = useDatabaseInitializer(dbA, dbB);
  const [inputQuery, setInputQuery] = useState("");

  //!loading && seeded && activeDb;
  function changeDataset(event) {
    const value = event.currentTarget.value;
    const nextDb =
      value === "datasetA" ? dbA : value === "datasetB" ? dbB : null;
    if (nextDb) setActiveDb(nextDb);
    console.log(`dataset ${value}`);
  }

  function executeQuery() {
    //console.log(activeDb);
    const queryResult = runSelectQuery(activeDb, inputQuery);
    console.log(queryResult);
  }

  return (
    <>
      <div>
        <button value="datasetA" onClick={changeDataset}>
          Data setA
        </button>
        <button value="datasetB" onClick={changeDataset}>
          Data setB
        </button>
        <div>
          <input
            type="text"
            value={inputQuery}
            onChange={(event) => {
              setInputQuery(event.target.value);
            }}
            placeholder="Type Select query"
          />
          <button onClick={executeQuery}>run query</button>
        </div>
      </div>
    </>
  );
}
export default DatabaseLoader;
