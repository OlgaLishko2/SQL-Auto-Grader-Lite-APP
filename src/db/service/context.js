import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { fetchTablesDB, fetchDatasetsDB, insertDataset, insertTable, getTableSchema, generateCreateTableSQL} from "./setupDatabases";

// Create a Context object to hold global data
// Creates the 'Context' object—the global storage container for your Todo data.
const AppContext = createContext();
// Extract the Provider component to wrap the app and share data
// Pulls out the 'Provider' component used to wrap the app and "broadcast" the data.
const { Provider } = AppContext;

const AppProvider = ({ children }) => {
    const allDataset = useCallback(async()=>{
        const data = await fetchDatasetsDB()
        return data
    }, [])
    const allTables = useCallback(async(name)=>{
        const data = await fetchTablesDB(name)
        return data
    }, [])
    const addDataset = useCallback(async(name)=>{
        insertDataset(name)
        // const data = await fetchDatasetsDB()
        // return data
    }, [])
    const addTable = useCallback(async(name, db_name)=>{
        insertTable(name, db_name)
    }, [])

    const getTable = useCallback(async (datasetName, tableName) => {
    const schema = await getTableSchema(tableName, datasetName);
    if (schema) {
        return { exists: true, schema };
    }
    return { exists: false, schema }
 },[])
 const createTable=useCallback((dbname, tableName, columns)=>{
    const data = generateCreateTableSQL(dbname, tableName, columns)
    return data
 },[])
// useMemo: Memoizes the data object so child components don't re-render 
// unless the todoList or functions actually change.
    const value = useMemo(() => ({
        allDataset,
        allTables,
        addDataset,
        addTable,
        getTable,
        createTable
    }), [allDataset, allTables, addDataset, addTable, getTable, createTable])
    return <Provider value={value}>{children}</Provider>
}

/**
 * A custom hook that allows components to "consume" the Todo data.
 * It includes a safety check to ensure it's only used within an AppProvider.
 */
export const useAppContext = () => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error(
            "useAppContext must be used inside an AppProvider"
        );
    }

    return context;
}

export default AppProvider;