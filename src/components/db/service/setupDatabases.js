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
        // console.log('All tables in database:', allTables);

        if (allTables.length === 0) {


            console.warn('No tables found in database, checking localStorage...');
            const schemaKey = `schema_${dbname}`
            const existingSchema = JSON.parse(localStorage.getItem(schemaKey) || '{}');
            // console.log('Table schema:', existingSchema[tableName].createSQL);
            return existingSchema['Users']?.createSQL || null;
        }
        const result = db.exec(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
        return result[0]?.values[0]?.[0] || null;
    } catch (error) {
        console.error('Error getting table schema:', error);
        return null;
    }
}

export const getTableInTable = async (tableName, dbname) => {
    const createSQL = await getTableSchema(tableName, dbname);

    if (!createSQL) return [];
    // extract content inside the last parentheses block at the end of the SQL string
    const match = createSQL.match(/\((.+)\)$/s);
    if (!match) return [];
    // Decimal(15,2)
    const splitCols = (str) => {
        const cols = [];
        let depth = 0, cur = '';
        for (const ch of str) {
            if (ch === '(') depth++;
            else if (ch === ')') depth--;
            else if (ch === ',' && depth === 0) { cols.push(cur.trim()); cur = ''; continue; }
            cur += ch;
        }
        if (cur.trim()) cols.push(cur.trim());
        return cols;
    };
    const allCols = splitCols(match[1]).filter(Boolean);
    // console.log(allCols);
    
    const fkCols = new Set(
        allCols
            .filter(col => col.toUpperCase().startsWith('FOREIGN KEY'))
            .map(col => { const m = col.match(/FOREIGN KEY\s*\((\w+)\)/i); return m?.[1]; })
            .filter(Boolean)
    );
    console.log(fkCols);
    
    return allCols.filter(col => !col.toUpperCase().startsWith('FOREIGN KEY') && !col.toUpperCase().startsWith('PRIMARY KEY')).map(col => {
        const parts = col.split(/\s+/);
        return {
            name: parts[0],
            type: parts[1] || '',
            notNull: col.toUpperCase().includes('NOT NULL'),
            primaryKey: col.toUpperCase().includes('PRIMARY KEY'),
            foreignKey: fkCols.has(parts[0]),
        };
    });
};

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

export const fetchData = async (dbname, query) => {
    const db = await initDB(dbname);
    if (!db) {
        console.error(`Database '${dbname}' not found`);
        return [];
    }
   try {
        // 1. Prepare the statement
        const stmt = db.prepare(query);
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

        console.log(`Successfully decoded ${rows.length} rows`);
        return {isSuccessful:true, data:rows};

    } catch (error) {
        console.error(`Failed to fetch data:`, error);
        return {isSuccessful:false, message:error.message};
    }
};
//  if sql.js doesn’t return before timeoutMs, the timeout error is raised.
// But because db.exec() is synchronous in sql.js, the timeout may not interrupt a blocking query; it only wins the race if the timeout can actually run.
export const selectQuery = async (dbname, query, timeoutMs = 5000) => {
    const db = await initDB(dbname);
    if (!db) {
        console.error(`Database '${dbname}' not found`);
        return [];
    }
    try {
        // new Promise((resolve, reject)=>{})
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Query timed out")), timeoutMs)
        );
        // const execution = new Promise((resolve) => resolve(db.exec(query)));
        const execution = Promise.resolve().then(() => db.exec(query));
        const result = await Promise.race([execution, timeout]);
        return {isSuccessful:true, data:result};
    } catch (error) {
        console.error(`Failed to fetch data:`, error.message);
        return {isSuccessful:false, message:error.message};
    }
};
