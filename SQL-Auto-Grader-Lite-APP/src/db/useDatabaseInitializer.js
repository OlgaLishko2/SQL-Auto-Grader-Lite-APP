import { useEffect, useState } from "react";
import { initDataToDataset } from "../db/sqlOperations";

//Initialize datasets once and expose currently selected database.
export function useDatabaseInitializer(dbA, dbB) {
  const [activeDb, setActiveDb] = useState(null);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!dbA || !dbB || seeded) return;
    // Seed only when both DBs are ready and not seeded yet.
    const statusA = initDataToDataset(dbA, "datasetA");
    const statusB = initDataToDataset(dbB, "datasetB");
    if (statusA && statusB) {
      console.log("DatabaseInitialize successfully");
      setSeeded(true);
    }
  }, [dbA, dbB, seeded]);

  useEffect(() => {
    // Default active DB is datasetA on first load.
    if (dbA && !activeDb) setActiveDb(dbA);
  }, [dbA, activeDb]);
  return { activeDb, setActiveDb, seeded };
}
