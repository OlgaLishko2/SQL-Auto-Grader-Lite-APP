import initSqlJs from "sql.js";
import { loadPersistedDatabase } from "./dbPersistence";

const DATASET_PATHS = {
  datasetA: "/databases/datasetA.sqlite",
  datasetB: "/databases/datasetB.sqlite",
};

let sqlPromise = null;

//Reuses one SQL.js WASM instanc
function getSqlInstance() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: () => "/sql-wasm.wasm",
    });
  }
  return sqlPromise;
}

export async function initDatabase(dataSetKey) {
  const dbPath = DATASET_PATHS[dataSetKey];
  if (!dbPath) {
    throw new Error(`Unknown dataset ${dbPath}`);
  }
  const SQL = await getSqlInstance();
  //getDatset from localStorage
  const persistedBytes = loadPersistedDatabase(dataSetKey);
  //Restores DB from localStorage if present.
  if (persistedBytes) {
    return new SQL.Database(persistedBytes);
  }

  const res = await fetch(dbPath);
  if (!res.ok) {
    throw new Error(`Fetching data in dataset ${dbPath} faild`);
  }
  const buffer = await res.arrayBuffer();
  //Create a database
  return new SQL.Database(new Uint8Array(buffer));
}

export async function initAllDatabases() {
  const [datasetA, datasetB] = await Promise.all([
    initDatabase("datasetA"),
    initDatabase("datasetB"),
  ]);
  return [datasetA, datasetB];
}
