import { db_seeded } from "./seedDatabase";
import { persistDatabase } from "./dbPersistence";

function isDatasetSeeded(db, dataset) {
  const table = dataset === "datasetA" ? "Departments" : "Customers";
  const result = db.exec(`SELECT COUNT(*) AS total FROM ${table}`);
  const total = result?.[0]?.values?.[0]?.[0] ?? 0;
  return total > 0;
}

export function initDataToDataset(db, dataset) {
  if (!db) return false;

  try {
    const insertQueries = db_seeded?.[dataset];
    if (!insertQueries) return false;
    if (isDatasetSeeded(db, dataset)) return true;
    if (dataset === "datasetA") {
      db.run(insertQueries.departmentQuery);
      db.run(insertQueries.employeesQuery);
    } else if (dataset === "datasetB") {
      db.run(insertQueries.customersQuery);
      db.run(insertQueries.ordersQuery);
    } else {
      throw new Error(`Unknown dataset: ${dataset}`);
    }
    persistDatabase(dataset, db);
    return true;
  } catch (e) {
    console.error(`initDataToDataset failed: ${e.message}`);
    return false;
  }
}

export function runSelectQuery(db, query) {
  if (!db) return [];
  try {
    console.log(`runSelectQuery db: ${db}, query: ${query}`);
    const res = db.exec(query);
    console.log("sql result:", res);
    return res;
  } catch (e) {
    console.error("Query failed Query failed:", e.message);
    return [];
  }
}
