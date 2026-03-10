import "./TeacherDashboard.css"
import { useState } from "react";
import { runSelectQuery } from "../../db/sqlOperations";
import { useDatabaseInitializer } from "../../db/useDatabaseInitializer";
import { useDatabase } from "../../db/useDatabase";
import Table from 'react-bootstrap/Table';


import { useNavigate } from "react-router-dom";

const DatasetChoice = ({type_of_question}) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const optionList = ['datasetA', 'datasetB'];
    const [showTables, setShowTables] = useState(false);
    const { dbA, dbB, loading, error } = useDatabase();
    const { activeDb, setActiveDb, seeded } = useDatabaseInitializer(dbA, dbB);
    const [inputQuery, setInputQuery] = useState("");
    
    const navigate = useNavigate();

      const customers = [
        {"customerid":"fleebetter0","firstname":"Fifine","lastname":"Leebetter","email":"fleebetter0@noaa.gov","city":42,"country":1},
        {"customerid":"rfrancie1","firstname":"Riccardo","lastname":"Francie","email":"rfrancie1@twitpic.com","city":96,"country":2},
        {"customerid":"jarnall2","firstname":"Jacqueline","lastname":"Arnall","email":"jarnall2@miitbeian.gov.cn","city":78,"country":3},
        {"customerid":"gcassely3","firstname":"Grove","lastname":"Cassely","email":"gcassely3@umich.edu","city":59,"country":4},
        {"customerid":"epagel4","firstname":"Erin","lastname":"Pagel","email":"epagel4@uiuc.edu","city":65,"country":5}
      ]
    
    //!loading && seeded && activeDb;
    function changeDataset(event) {
        const value = event.currentTarget.value;
        const nextDb =
        value === "datasetA" ? dbA : value === "datasetB" ? dbB : null;
        if (nextDb) setActiveDb(nextDb);
        console.log(`dataset ${value}`);
    }
    
    function executeQuery() {
        //console.log(activeDb);
        const queryResult = runSelectQuery(activeDb, inputQuery);
        console.log(queryResult);
    }

    const handleCheckboxChange = (event) => {
        const selectedValue = event.target.value; 
        if (selectedOptions.includes(selectedValue)) {
            setSelectedOptions(selectedOptions.filter(item => item !== selectedValue));
        } else {
            setSelectedOptions([...selectedOptions, selectedValue]);
        }
        //setting active db as per user's choice
        console.log("selected options: ", selectedOptions);       
    }

    const handleShowDatabase = (e) => {
        e.preventDefault();
        setShowTables(true);
        console.log(selectedOptions[0]);
        setActiveDb(selectedOptions[0]);
        console.log("activeDb:", activeDb);
        //const input_query = `SELECT name FROM ${activeDb} WHERE type='table'`;
        let input_query = ''
        if(activeDb === 'datasetA')
            input_query = `SELECT * FROM Departments`;
        else
            input_query = `SELECT * FROM Customers`;
        setInputQuery(input_query);

        console.log(inputQuery);

        if(inputQuery!= ''){
            const result = executeQuery();
            console.log(result);
        }

    }
    const handleCreateAssignmnet = (e) =>{
        e.preventDefault();
        setShowTables(false);
        navigate('/teacher-dashboard/assignment-form');
    }

  return (
    <div>      
      <div className="dashboard-container">
       
        <h1>Teacher's Dashboard</h1>
        <p>
            {
            optionList?.map((option) => (
            <label key={option}>
            <input
                type="checkbox"
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={handleCheckboxChange} 
            />
            {option}
            </label>        
        ))}
        </p>
        <div>
            <button className='menu-btn' onClick={(e) => handleShowDatabase(e)}>Show Tables</button>
        </div>
        { showTables&&
            <div>
                <table>
                    <thead>
                        <tr>
                        <th>Customerid</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Country</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Use .map() to create a row for each object in the array */}
                        {customers.map((customer) => (
                        <tr key={customer.customerid}>
                            <td>{customer.firstname}</td>
                            <td>{customer.lastname}</td>
                            <td>{customer.email}</td>
                            <td>{customer.city}</td>
                            <td>{customer.country}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                <button className="menu-btn" onClick={(e) => handleCreateAssignmnet(e)}>Create Assignment</button>
            </div>
        }
        
      </div>
    </div>
  );
};

export default DatasetChoice;