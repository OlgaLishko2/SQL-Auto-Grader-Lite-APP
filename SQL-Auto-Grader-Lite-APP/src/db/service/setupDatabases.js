import initSqlJs from 'sql.js';
import { DB_CONFIG } from '../setup/dbConfig';

let SQL;
let databases = {}; // Store multiple databases
let runtimeConfig = { ...DB_CONFIG }; // Mutable copy

export const addDatabaseConfig = (dbname, config) => {
    runtimeConfig[dbname] = {
        name: `./databases/${dbname}.sqlite`,
        tables: [],
        queries: []
    };

};
const initDB = async (dbname) => {
    if (!SQL) {
        SQL = await initSqlJs({
            locateFile: () => `/sql-wasm.wasm`
        });
    }

    if (!databases[dbname]) {
        const config = runtimeConfig[dbname];
        // if (!config) throw new Error(`Database config not found for: ${dbname}`);
        if (!config) {
            console.log(`Creating new database: ${dbname}`);
            databases[dbname] = new SQL.Database();
            return databases[dbname];
        }

        try {
            const response = await fetch(`/${config.name}`);
            if (!response.ok) throw new Error('Database file not found');
            const arrayBuffer = await response.arrayBuffer();
            databases[dbname] = new SQL.Database(new Uint8Array(arrayBuffer));
            console.log(`✅ Database "${config.name}" loaded successfully`);
        } catch (error) {
            console.error('Failed to load database:', error);
            databases[dbname] = new SQL.Database();
            for (const tableSql of config.tables) {
                databases[dbname].run(tableSql);
            }
        }
    }
    return databases[dbname];
};

const saveDB = (dbname) => {
    if (databases[dbname]) {
        const data = databases[dbname].export();
        localStorage.setItem(dbname, JSON.stringify(Array.from(data)));
    }
};

export const fetchDatasetsDB = async () => {
    const db = await initDB('db');
    const result = db.exec('SELECT datasetName FROM Datasets');
    const datasets = result[0]?.values.map(row => ({ datasetName: row[0] })) || [];
    return datasets;
}

export const fetchTablesDB = async (datasetName) => {
    const db = await initDB('db');
    const result = db.exec(`SELECT * FROM Tables WHERE datasetName = '${datasetName}'`);
    const tables = result[0]?.values.map(row => ({tableName: row[1] })) || [];
    return tables;
}

export const insertDataset = async (name) => {
    const db = await initDB('db');
    db.run(`INSERT INTO Datasets (datasetName) VALUES ('${name}')`);
    saveDB('db');
}

export const insertTable = async (tableName, datasetName) => {
    const db = await initDB('db');
    db.run(`INSERT INTO Tables (tableName, datasetName) VALUES ('${tableName}', '${datasetName}')`, [tableName, datasetName]);
    saveDB('db');
}

export const getTableSchema = async (tableName, dbname) => {
    const db = await initDB(dbname);
    const allTables = db.exec(`SELECT name FROM sqlite_master WHERE type='table'`);    
    if (allTables.length === 0) return null;

    const result = db.exec(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`);    
    return result[0]?.values[0]?.[0] || null;
}


export const generateCreateTableSQL = (dbname, tableName, columns) => {
  const columnDefs = columns.map(col => {
    let def = `${col.name} ${col.type}`;
    if (!col.nullable) def += ' NOT NULL';
    if (col.key === 'primary') def += ' PRIMARY KEY';
    return def;
  });
  
  const foreignKeys = columns
    .filter(col => col.key === 'foreign')
    .map(col => `FOREIGN KEY (${col.name}) REFERENCES ${col.refTable}(id)`);
  
  const allDefs = [...columnDefs, ...foreignKeys];
  const createSQL = `CREATE TABLE ${tableName} (${allDefs.join(', ')})`;

  databases[dbname].run(createSQL);
  return createSQL;
};