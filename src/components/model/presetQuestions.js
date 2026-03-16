import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../../firebase";

const dbCollection = collection(db, "presetQuestions");

// Fetch preset questions for a given dataset and table
export async function getPresetQuestions(datasetName, tableName) {
  const q = query(
    dbCollection,
    where("datasetName", "==", datasetName),
    where("tableName", "==", tableName)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Push a new preset question { datasetName, tableName, question, answer }
export async function addPresetQuestion(preset) {
  const newDocRef = doc(dbCollection);
  await setDoc(newDocRef, { ...preset, id: newDocRef.id });
  return newDocRef.id;
}
