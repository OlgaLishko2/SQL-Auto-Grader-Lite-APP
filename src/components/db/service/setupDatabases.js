import { loadSqliteData, addDataToFirestore } from '../setup/setupFirebaseDb';


const initDB = async (dbname) => {
    const databases = await loadSqliteData();
    return databases[dbname];


};

export const fetchDatasetsDB = async () => {
    const db = await initDB('db');
    const result = db.exec('SELECT datasetName FROM Datasets');
    const dbs = result[0]?.values.map(row => ({ datasetName: row[0] })) || [];
    return dbs;
}

export const fetchTablesDB = async (datasetName) => {
    const db = await initDB('db');
    const result = db.exec(`SELECT * FROM Tables WHERE datasetName = '${datasetName}'`);
    const tables = result[0]?.values.map(row => ({ tableName: row[1] })) || [];
    return tables;
}

export const insertDataset = async (name) => {
    await addDataToFirestore('db', [`INSERT INTO Datasets (datasetName) VALUES ('${name}')`])
    await addDataToFirestore(name);
}

export const insertTable = async (tableName, datasetName) => {
    await addDataToFirestore('db', [`INSERT INTO Tables (tableName, datasetName) VALUES ('${tableName}', '${datasetName}')`])
}

export const getTableSchema = async (tableName, dbname) => {
    const db = await initDB(dbname);
    try {
        // Debug: show all tables
        const allTables = db.exec(`SELECT name FROM sqlite_master WHERE type='table'`);
        console.log('All tables in database:', allTables);

        if (allTables.length === 0) {


            console.warn('No tables found in database, checking localStorage...');
            const schemaKey = `schema_${dbname}`
            const existingSchema = JSON.parse(localStorage.getItem(schemaKey) || '{}');
            console.log('in if loop', existingSchema);
            console.log('Table schema:', existingSchema['Users']);
            console.log('Table schema:', existingSchema[tableName].createSQL);
            return existingSchema['Users']?.createSQL || null;
        }
        const result = db.exec(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
        return result[0]?.values[0]?.[0] || null;
    } catch (error) {
        console.error('Error getting table schema:', error);
        return null;
    }
}


export const generateCreateTableSQL = async (dbname, tableName, columns) => {
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
    await addDataToFirestore(dbname, [createSQL])

    return createSQL;
};

export const fetchData = async (dbname, tableName) => {    
    const db = await initDB(dbname);
    try {
        // 1. Prepare the statement
        const stmt = db.prepare(`SELECT * FROM ${tableName}`);
        const rows = [];

        // 2. Iterate through rows and "Decode" them into objects
        while (stmt.step()) {
            const rowDoc = stmt.getAsObject();
            
            // 3. Ensure a unique ID for Firestore 
            // If the table doesn't have an 'id', we use the SQLite rowid
            if (!rowDoc.id && rowDoc.rowid) {
                rowDoc.id = rowDoc.rowid;
            }
            
            rows.push(rowDoc);
        }

        // 4. Free memory
        stmt.free();
        
        console.log(`Successfully decoded ${rows.length} rows from ${tableName}`);
        return rows;
        
    } catch (error) {
        console.error(`Failed to fetch data from ${tableName}:`, error);
        return [];
    }
};

export const selectQuery = async (dbname, query) => {    
    const db = await initDB(dbname);
    if (!db) {
        console.error(`Database '${dbname}' not found`);
        return [];
    }
    try {
        const result = db.exec(query);
        return result; // returns [{columns: [...], values: [[...]]}]
    } catch (error) {
        console.error(`Failed to fetch data:`, error);
        return [];
    }
};
