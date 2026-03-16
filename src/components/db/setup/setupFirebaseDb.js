import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase.js';
import initSqlJs from 'sql.js';
import sqliteData from './db-config.json' with { type: 'json' };

const uploadSqliteConfig = async () => {
   await setDoc(doc(db, 'sqliteConfigs', 'mainConfig'), sqliteData);
   console.log('Uploaded successfully');
};

// Run once to upload initial data
// uploadSqliteConfig().then(() => console.log('Reset complete'));
let SQL = null;
let runtimeConfig = {}; // Mutable copy

// Upload once
// Initialize SQL.js once
export const initSQL = async () => {
    if (!SQL) {
        SQL = await initSqlJs({
            locateFile: () => `/sql-wasm.wasm` // located in public
        });
    }
    return SQL;
};

// Add data such as create Dataset, table, and table Schema in Firestore
export const addDataToFirestore = async (dbname, query = []) => {
    runtimeConfig = await getSqliteConfig();
    // If no config exists, start with empty object
    if (!runtimeConfig[dbname]) {
        runtimeConfig[dbname] = {
            name: `${dbname}.sqlite`,
            queries: []
        };
    }
    if (runtimeConfig) {
        runtimeConfig[dbname].queries.push(...query);
        // await deleteDoc(doc(db, 'sqliteConfigs', 'mainConfig'));
        await setDoc(doc(db, 'sqliteConfigs', 'mainConfig'), runtimeConfig);
        console.log('Saved to Firestore');
    }

};

// Retrieve anytime
export const getSqliteConfig = async () => {
    const docSnap = await getDoc(doc(db, 'sqliteConfigs', 'mainConfig'));
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
};
// Use it
export const loadSqliteData = async () => {
    const databases = {};
    await initSQL();
    runtimeConfig = await getSqliteConfig();
    if (!runtimeConfig) {
        console.error('No config found in Firestore');
        return {};
    }
    for (const [key, config] of Object.entries(runtimeConfig)) {
        // Execute queries for main db
        const sqliteDb = new SQL.Database()
        // 2. Execute table creations
        for (const query of config.queries)
            try {
                sqliteDb.run(query);
            } catch (error) {
                console.error(`Error in ${key}:`, error.message);
                console.error('Failed query:', query);
                throw error; // Or continue to skip bad queries
            }
        databases[key] = sqliteDb
    }
    return (databases)
};
