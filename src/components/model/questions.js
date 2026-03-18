import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

//question_id will be create by firestore
//   const question = {
//     assignment_id: "QumeTD0jZAv0LiNBUd7M",
//     prompt:
//       "List all customers (id, name) who signed up in 2026, ordered by signup_date (newest first).",
//     teacher_solution_sql:
//       "SELECT id, name\nFROM customers\nWHERE signup_date >= '2026-01-01' AND signup_date < '2027-01-01'\nORDER BY signup_date DESC;",
//     order_matters: 1,
//     alias_matters: 0,
//     max_attempt_time: 3,
//     created_on: "2026-03-01",
//     updated_on: "2026-03-05",
//   };

const dbCollection = collection(db, "questions");

async function createNewQuestion(question) {
  try {
    const newDocRef = doc(dbCollection);
    const questionId = newDocRef.id;
    await setDoc(newDocRef, {
      ...question,
      question_id: questionId,
    });

    return questionId;
  } catch (error) {
    console.error(`createNewQuestion: ${error}`);
  }
}

//Return an array of questions
async function getAllQuestionByAssignment(assignment_id) {
  try {
    const questionsQuery = query(
      dbCollection,
      where("assignment_id", "==", assignment_id),
    );
    let questions = [];
    const querySnapshot = await getDocs(questionsQuery);
    querySnapshot.forEach((doc) => {
      questions.push(doc.data());
    });
    return questions;
  } catch (error) {
    console.error(`getAllQuestionByAssignment: ${error}`);
  }
}

async function updateQuestion(question) {
  try {
    const questionQuery = query(
      dbCollection,
      where("question_id", "==", question.question_id),
    );
    const objQuestion = await getDocs(questionQuery);

    if (objQuestion.empty) {
      return null;
    }
    const questionDocRef = objQuestion.docs[0].ref;
    await updateDoc(questionDocRef, question);
    return questionDocRef;
  } catch (error) {
    console.error(`updatequestion: ${error}`);
  }
}

// Get Single Question detail by question_id
async function getSingleQuestionDetails(question_id) {
  try {
    const questionQuery = query(
      dbCollection,
      where("question_id", "==", question_id),
    );
    const singleQuestion = await getDocs(questionQuery);

    if (singleQuestion.empty) {
      return null;
    }
    const questionData = singleQuestion.docs[0].data();
    return questionData;
  } catch (error) {
    console.error(`getSingleQuestionDetails: ${error}`);
  }
}
export { createNewQuestion, getAllQuestionByAssignment, updateQuestion,getSingleQuestionDetails };
