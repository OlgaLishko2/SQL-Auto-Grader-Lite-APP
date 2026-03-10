import React, { useState, useEffect } from 'react';
import { db } from "../../firebase"; 
import { getDocs, doc } from "firebase/firestore";

const CreateQuestionSet = () => {
  const [questionSets, setQuestionSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionSets = async () => {
      try {
        // Reference the "questionSets" collection in Firestore
        const querySnapshot = await getDocs(doc(db, "questionSets"));
        
        // Map documents into a usable array of objects
        const sets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setQuestionSets(sets);
      } catch (error) {
        console.error("Error fetching question sets: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionSets();
  }, []);

  return (
    <div>
      <label htmlFor="question-set">Select a Question Set:</label>
      <select 
        id="question-set"
        value={selectedSet} 
        onChange={(e) => setSelectedSet(e.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading...' : '-- Select a Set --'}</option>
        {questionSets.map((set) => (
          <option key={set.id} value={set.id}>
            {set.setName || `Set ${set.id}`} {/* Use your field name here */}
          </option>
        ))}
      </select>
    </div>
  );
};


export default CreateQuestionSet;