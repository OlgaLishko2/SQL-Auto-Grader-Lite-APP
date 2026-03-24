import { useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../../../../components/db/service/context';
import "./DatabaseManager.css";
import HintPopup from './HintPopup';



function DatabaseManager() {
  const { allDataset, allTables, addDataset, addTable, getTable, createTable, fetchItems, insertData, runSelectQuery } = useAppContext()
  const [datasets, setDatasets] = useState([]);
  const [tables, setTables] = useState([]);
  const [datasetStore, setDatasetStore] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState([]);
  const [tableSchema, setTableSchema] = useState(null);
  const [tableNotExists, setTableNotExists] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [datas, setDatas] = useState([]);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [insertSQL, setInsertSQL] = useState('');
  const [insertResult, setInsertResult] = useState(null);

  
  const loadDatasets = useCallback(async () => {
    const data = await allDataset();
    const dataset = data.map((d, i) => ({
      id: i,
      content: d.datasetName
    }));
    setDatasets(dataset);
  }, [allDataset]);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);




  const loadTables = async (datasetName) => {
    const data = await allTables(datasetName);
    const tabless = data.map((d, i) => ({
      id: i,
      content: d.tableName
    }));
    setTables(tabless);
  };

  const loadSelectedTables = async (dbname, tablename) => {
    const schema = await getTable(dbname, tablename);
    if (schema.exists) {
      setTableSchema(schema.schema);
      setTableNotExists(false);
    } else {
      setTableSchema(null);
      setTableNotExists(true);
    }
    setColumns([]);
    setDatas([])
    setInsertResult(null)
  };

  const insertDataset = async () => {
    if (newDatasetName) {
      await addDataset(newDatasetName);
      await loadDatasets();
      setNewDatasetName('');
    }
  };

  const insertTable = async () => {
    if (newTableName && selectedDataset) {
      await addTable(newTableName, selectedDataset);
      await loadTables(selectedDataset);
      setNewTableName('');
    }
  };
  const handleInsertSubmit = async () => {
    const trimmed = insertSQL.trim().toUpperCase();
    if (!trimmed.startsWith('INSERT INTO')) {
      setInsertResult({ success: false, message: 'Invalid SQL: must start with INSERT INTO' });
      return;
    }
    try {
      const result = await runSelectQuery(selectedDataset, insertSQL)
      if (result.isSuccessful) {
        await insertData(selectedDataset, insertSQL);
        setInsertResult({ success: true, message: 'Row inserted successfully!' });
      }else{
        setInsertResult({ success: false, message: `Error: ${result.message}` });
      }
      setInsertSQL('');
    } catch (e) {
      setInsertResult({ success: false, message: `Error: ${e.message}` });
    }
  };
  const fetchData = async () => {
    const result = await fetchItems(selectedDataset, `SELECT * FROM ${selectedTable}`)
    setDatas(result.data)
  }

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'VARCHAR', nullable: false, key: 'none', refTable: '' }]);
  };

  const updateColumn = (index, field, value) => {
    const updated = [...columns];
    updated[index][field] = value;
    setColumns(updated);
  };

  const removeColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const createNewTable = async () => {
    if (!selectedTable || columns.length === 0) {
      alert('Please enter table name and add columns');
      return;
    }
    createTable(selectedDataset, selectedTable, columns);
    await loadSelectedTables(selectedDataset, selectedTable)
    setDatasetStore({
      ...datasetStore,
      [selectedDataset]: {
        ...datasetStore[selectedDataset],
        tables: [
          ...(datasetStore[selectedDataset]?.tables || []),
          { name: selectedTable, columns: [...columns] }
        ]
      }
    });

    console.log('Table created:', { dataset: selectedDataset, table: selectedTable, columns });
    alert(`Table "${selectedTable}" created successfully!`);
    loadSelectedTables(selectedDataset, selectedTable)
  };

  return (
    
    <div className='container' style={{
      display: 'box', flexDirection: 'column',
      flexWrap: 'nowrap',       /* Prevents items from jumping to new columns */
      alignItems: 'stretch'
    }}>
      
      <HintPopup/>



      <div style={{ display: 'flex', gap: '10%', marginBottom: '30px' }}>
        <section>
          <h2>Dataset</h2>
          <select value={selectedDataset}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedDataset(id);
              setSelectedTable('');
              if (id) {
                loadTables(id);
              } else {
                setTables([]);
              }
            }}>
            <option value="">Select Dataset</option>
            {datasets.map(ds => <option key={ds.id} value={ds.content}>{ds.content}</option>)}
          </select>
          <div className='inlineForm'>
            <input
              value={newDatasetName}
              onChange={(e) => setNewDatasetName((e.target.value).trim().replace(/\s+/g, ''))}
              placeholder="New dataset name"
            />
            <button onClick={insertDataset}>Create Dataset</button>
          </div>
        </section>
        <section>
          <h2>Datasets in Database</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map(ds => (
                <tr key={ds.id}>
                  <td>{ds.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {selectedDataset && (
        <div style={{ display: 'flex', gap: '10%', marginBottom: '30px' }}>
          <section>
            <h2>Tables in {selectedDataset}</h2>
            <select value={selectedTable} onChange={(e) => {
              const tableId = e.target.value
              const table = tables.find(t => t.content === tableId);
              const tableName = table?.content || '';
              setSelectedTable(tableName);
              if (tableName) {
                loadSelectedTables(selectedDataset, tableName);
              }

            }}>
              <option value="">Select Table</option>
              {tables.map(t => <option key={t.id} value={t.content}>{t.content}</option>)}
            </select>
            <div className='inlineForm'>
              <input
                value={newTableName}
                onChange={(e) => setNewTableName((e.target.value).trim().replace(/\s+/g, ''))}
                placeholder="New table name"
              />
              <button onClick={insertTable}>Create New Table</button>
            </div>
          </section>
          <section>
            <h2>Tables in Database</h2>
            <table>
              <thead>
                <tr>
               
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {tables.map(t => (
                  <tr key={t.id}>
                 
                    <td>{t.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {selectedTable && (
        <section style={{ overflowX: 'auto' }}>
          <h2>Define Schema for {selectedTable}</h2>
          {tableNotExists && (
            <><table>
              <thead>
                <tr>
                  <th>Property Name</th>
                  <th>Type</th>
                  <th>Nullable</th>
                  <th>Key Type</th>
                  <th>Reference Table</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((col, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        className='tableInput'
                        value={col.name}
                        onChange={(e) => updateColumn(i, 'name', (e.target.value).trim().replace(/\s+/g, ''))}
                        placeholder="column_name"
                      />
                    </td>
                    <td>
                      <select className='tableInput' value={col.type} onChange={(e) => updateColumn(i, 'type', e.target.value)}>
                        <option>VARCHAR</option>
                        <option>INT</option>
                        <option>BIGINT</option>
                        <option>TEXT</option>
                        <option>DATE</option>
                        <option>TIMESTAMP</option>
                        <option>BOOLEAN</option>
                        <option>DECIMAL</option>
                      </select>
                    </td>
                    <td>
                      <select className='tableInput' value={col.nullable} onChange={(e) => updateColumn(i, 'nullable', e.target.value === 'true')}>
                        <option value="false">NOT NULL</option>
                        <option value="true">NULL</option>
                      </select>
                    </td>
                    <td>
                      <select className='tableInput' value={col.key} onChange={(e) => updateColumn(i, 'key', e.target.value)}>
                        <option value="none">None</option>
                        <option value="primary">Primary Key</option>
                        <option value="foreign">Foreign Key</option>
                      </select>
                    </td>
                    <td>
                      {col.key === 'foreign' && (
                        <select className='tableInput' value={col.refTable} onChange={(e) => updateColumn(i, 'refTable', e.target.value)}>
                          <option value="">Select table</option>
                          {tables.filter(t => t.content !== selectedTable).map((t) => <option key={t.id} value={t.content}>{t.content}</option>)}
                        </select>
                      )}
                    </td>
                    <td>
                      <button onClick={() => removeColumn(i)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              <button onClick={addColumn}>Add Column</button>
              <button className='createBtn' onClick={createNewTable}>Create Table</button></>)}
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <strong>Current Store:</strong>
            <pre style={{ fontSize: '12px', overflow: 'auto', maxWidth: '100%', whiteSpace: 'pre-wrap' }}>
              {tableSchema}
            </pre>
          </div>
        </section>
      )}
      {(tableSchema && selectedTable &&
        <section style={{ marginTop: '30px' }}>
          <h2>DATA INTO {selectedTable}</h2>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <button onClick={() => {
              setShowInsertForm(false);
              fetchData()
            }}>Fetch Data</button>
            <button onClick={() => {
              setDatas([]);
              setShowInsertForm(!showInsertForm)
            }}>Insert Data</button>
          </div>
          {(datas.length > 0 &&
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', marginBottom: '30px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    {/* 1. Extract keys from the first object to create Headers */}
                    {Object.keys(datas[0]).map((key) => (
                      <th key={key} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datas.map((ds, i) => {
                    return (
                      <tr key={ds.id || i}>
                        {Object.values(ds).map((val, index) => (
                          <td key={index} style={{ padding: '10px', border: '1px solid #ddd' }}>
                            {val !== null ? String(val) : ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {showInsertForm && (
            <div className='inlineForm'>
              <input
                type='text'
                value={insertSQL}
                onChange={(e) => setInsertSQL(e.target.value)}
                placeholder={`INSERT INTO ${selectedTable} (...) VALUES (...)`}
                className="insert-input"
              />
              <button onClick={handleInsertSubmit}>Submit</button>
              {insertResult && (
                <p style={{ color: insertResult.success ? 'green' : 'red' }}>
                  {insertResult.message}
                </p>
              )}
            </div>
          )}

        </section>
      )}
      

    </div>
  );
}

export default DatabaseManager