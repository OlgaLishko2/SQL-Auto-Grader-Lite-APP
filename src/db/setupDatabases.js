
import Database from 'better-sqlite3';
import { DB_CONFIG } from './dbConfig.js';


export async function setupDatabases() {
    const connections = {};
    for (const [key, config] of Object.entries(DB_CONFIG)) {
        // 1. Create the instance
        const db = new Database(config.name)
        // 2. Execute table creations
        const createTable = (query)=>{
            const sql = query
            db.prepare(sql).run()
        }
        for (const tableSql of config.tables) {
            createTable(tableSql);
        }

        // 3. Store it in the object using the key or config.name
        connections[key] = db;

        console.log(`✅ Database "${config.name}" initialized and stored as "${key}".`);
    }
    return connections; // Returns { datasetA: db, datasetB: db }
}

setupDatabases()