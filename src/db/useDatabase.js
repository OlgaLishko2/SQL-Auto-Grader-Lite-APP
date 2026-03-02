import { useState, useEffect } from "react";
import { initAllDatabases } from "./db.worker";

export function useDatabase() {
  const [dbA, setDbA] = useState(null);
  const [dbB, setDbB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDatabase = async () => {
      setLoading(true);
      setError(null);
      try {
        const [databaseA, databaseB] = await initAllDatabases();
        setDbA(databaseA);
        setDbB(databaseB);
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    loadDatabase();
  }, []);

  return { dbA, dbB, loading, error };
}
