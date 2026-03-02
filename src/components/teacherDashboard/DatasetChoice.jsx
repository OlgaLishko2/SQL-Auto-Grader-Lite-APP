import "./TeacherDashboard.css"
import { useState } from "react";

const DatasetChoice = () => {const [selectedOptions, setSelectedOptions] = useState([]);
     const optionList = ['Dataset A', 'Dataset B'];

    const handleCheckboxChange = (event) => {
        const selectedValue = event.target.value; 
        if (selectedOptions.includes(selectedValue)) {
            setSelectedOptions(selectedOptions.filter(item => item !== selectedValue));
        } else {
            setSelectedOptions([...selectedOptions, selectedValue]);
        }
        console.log("selected options: ", selectedOptions);
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
            <button className='menu-btn'>Show Tables</button>
        </div>
      
        
      </div>
    </div>
  );
};

export default DatasetChoice;