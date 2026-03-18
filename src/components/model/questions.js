import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  
} from "firebase/firestore";
import {
  countAttempt,
  getBestAttemptByUserQuestion,
} from "./questionAttempts";
import { db } from "../../firebase";

const questionCollection = collection(db, "questions");

function normalizeQuestion(question) {
  const maxAttempts =
    question.max_number_of_attempts ?? question.max_attempt_time ?? 1;

  return {
    ...question,
    prompt: question.prompt ?? question.questionText ?? "",
    answer: question.answer ?? question.teacher_solution_sql ?? "",
    orderMatters: question.orderMatters ?? Boolean(question.order_matters),
    aliasStrict: question.aliasStrict ?? Boolean(question.alias_matters),
    max_number_of_attempts: Number(maxAttempts)
  };
}

async function createNewQuestion(question) {
  try {
    const newDocRef = doc(questionCollection);
    const questionId = newDocRef.id;

    await setDoc(newDocRef, {
      ...question,
      question_id: questionId,
    });

    return questionId;
  } catch (error) {
    console.error(`createNewQuestion: ${error}`);
    return null;
  }
}

async function getAllQuestionByAssignment(assignmentId) {
  try {
    const questionsQuery = query(
      questionCollection,
      where("assignment_id", "==", assignmentId),
    );
    const snapshot = await getDocs(questionsQuery);

    return snapshot.docs.map((questionDoc) =>
      normalizeQuestion(questionDoc.data()),
    );
  } catch (error) {
    console.error(`getAllQuestionByAssignment: ${error}`);
    return [];
  }
}

async function getAllQuestionAndAttempt(assignmentId, userId) {
  try {
    const questions = await getAllQuestionByAssignment(assignmentId);

    return Promise.all(
      questions.map(async (question) => {
        const attemptTime = await countAttempt(question.question_id, userId);
        const bestAttempt = await getBestAttemptByUserQuestion(
          userId,
          question.question_id,
        );
        const isSolved = Boolean(bestAttempt?.is_correct);
        const status =
          attemptTime === 0
            ? "Not Started"
            : isSolved
              ? "Correct"
              : "Incorrect";

        return {
          ...question,
          attemptTime,
          isSolved,
          status
        };
      }),
    );
  } catch (error) {
    console.error(`getAllQuestionAndAttempt: ${error}`);
    return [];
  }
}

async function updateQuestion(question) {
  try {
    const questionsQuery = query(
      questionCollection,
      where("question_id", "==", question.question_id),
    );
    const snapshot = await getDocs(questionsQuery);

    if (snapshot.empty) {
      return null;
    }

    const questionDocRef = snapshot.docs[0].ref;
    await updateDoc(questionDocRef, normalizeQuestion(question));
    return questionDocRef;
  } catch (error) {
    console.error(`updateQuestion: ${error}`);
    return null;
  }
}

// Get Single Question detail by question_id
async function getSingleQuestionDetails(question_id) {
  try {
    const questionQuery = query(
      questionCollection,
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
export { createNewQuestion,
   getAllQuestionByAssignment,
   getAllQuestionAndAttempt,
    updateQuestion,
    getSingleQuestionDetails };
