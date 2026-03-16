import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import questionsData from "../../pages/dashboard/teacher/questions.json";

// Run this once to seed questions.json into Firestore presetQuestions collection
export async function seedPresetQuestions() {
  const dbCollection = collection(db, "presetQuestions");
  for (const [datasetName, tables] of Object.entries(questionsData)) {
    for (const [tableName, questions] of Object.entries(tables)) {
      for (const q of questions) {
        const ref = doc(dbCollection);
        await setDoc(ref, { id: ref.id, datasetName, tableName, question: q.question, answer: q.answer });
      }
    }
  }
  console.log("Preset questions seeded!");
}
