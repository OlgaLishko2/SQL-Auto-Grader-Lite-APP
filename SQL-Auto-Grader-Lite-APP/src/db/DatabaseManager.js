import React, { useEffect, useState } from 'react';
import "./DatabaseManager.css";
import { useAppContext } from './service/context';
// import { table } from 'fontawesome';

function DatabaseManager() {
  const { allDataset, allTables, addDataset, addTable, getTable,createTable } = useAppContext()
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

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    const data = await allDataset();
    const dataset = data.map((d, i) => ({
      id: i,
      content: d.datasetName
    }));
    setDatasets(dataset);
  };

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
      setColumns([]);
    } else {
      setTableSchema(null);
      setTableNotExists(true);
      setColumns([]);
    }
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

  const createNewTable = async() => {
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
    loadSelectedTables(selectedDataset,selectedTable)
  };

  return (
    <div className='container'>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
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
              onChange={(e) => setNewDatasetName(e.target.value)}
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
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
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
                onChange={(e) => setNewTableName(e.target.value)}
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
                  <th>ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {tables.map(t => (
                  <tr key={t.id}>
                    <td>{t.id+1}</td>
                    <td>{t.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {selectedTable && (
        <section>
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
                      onChange={(e) => updateColumn(i, 'name', e.target.value)}
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
                      <input
                        className='tableInput'
                        value={col.refTable}
                        onChange={(e) => updateColumn(i, 'refTable', e.target.value)}
                        placeholder="referenced_table"
                      />
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
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {tableSchema}
              </pre>
          </div>
        </section>
      )}
    </div>
  );
}

export default DatabaseManager;