import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  getDoc,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getAssignmentDetailsByAssignmentId } from "./studentAssignments";

const dbCollection = collection(db, "question_attempts");
const questionCollection = collection(db, "questions");

function toComparableDate(value) {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsedDate = new Date(value).getTime();
  return Number.isNaN(parsedDate) ? Number.NEGATIVE_INFINITY : parsedDate;
}

function pickBetterAttempt(currentBest, candidate) {
  if (!currentBest) {
    return candidate;
  }

  const bestIsCorrect = Boolean(currentBest.is_correct);
  const candidateIsCorrect = Boolean(candidate.is_correct);

  if (candidateIsCorrect && !bestIsCorrect) {
    return candidate;
  }

  if (!candidateIsCorrect && bestIsCorrect) {
    return currentBest;
  }

  return toComparableDate(candidate.submitted_on) >
    toComparableDate(currentBest.submitted_on)
    ? candidate
    : currentBest;
}

async function createAttempt(questionAttempt) {
  try {
    const newDocRef = doc(dbCollection);
    const attemptId = newDocRef.id;
    await setDoc(newDocRef, {
      ...questionAttempt,
      attempt_id: attemptId,
    });

    return attemptId;
  } catch (error) {
    console.error(`createAttempt: ${error}`);
    return null;
  }
}

async function getAttemptByUserQuestion(userId, questionId) {
  try {
    const questionQuery = query(
      questionCollection,
      where("question_id", "==", questionId),
    );
    const questionSnapshot = await getDocs(questionQuery);
    const question = questionSnapshot.docs[0]?.data() ?? null;

    const attemptsQuery = query(
      dbCollection,
      where("question_id", "==", questionId),
      where("student_user_id", "==", userId),
    );
    const attemptSnap = await getDocs(attemptsQuery);

    return attemptSnap.docs.map((attemptDoc) => ({
      ...attemptDoc.data(),
      prompt: question?.prompt ?? question?.questionText ?? null,
    }));
  } catch (error) {
    console.error(`getAttemptByUserQuestion: ${error}`);
    return [];
  }
}

async function countAttempt(questionId, userId) {
  try {
    const attemptsQuery = query(
      dbCollection,
      where("question_id", "==", questionId),
      where("student_user_id", "==", userId),
    );
    const snapshot = await getCountFromServer(attemptsQuery);
    return snapshot.data().count;
  } catch (error) {
    console.error(`countAttempt: ${error}`);
    return 0;
  }
}

async function getBestAttemptByUserQuestion(userId, questionId) {
  const attempts = await getAttemptByUserQuestion(userId, questionId);

  if (attempts.length === 0) {
    return null;
  }

  return attempts.reduce(pickBetterAttempt, null);
}

async function getStudentInfo(studentId) {
  try {
    const snap = await getDoc(doc(db, "users", studentId));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error(`getStudentInfo: ${error}`);
    return null;
  }
}

async function getAttemptsByStudent(studentId) {
  try {
    const q = query(dbCollection, where("student_user_id", "==", studentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error(`getAttemptsByStudent: ${error}`);
    return [];
  }
}


 async function getAssignmentWithStudentAttempts(assignment_id, userId) {
  try {
    const assignment = await getAssignmentDetailsByAssignmentId(assignment_id);

    if (!assignment) return null;

    const questionIds = assignment.questions.map(q => q.question_id);

    if (questionIds.length === 0) {
      return { ...assignment, questions: [] };
    }

    const attemptsQuery = query(
      collection(db, "question_attempts"),
      where("student_user_id", "==", userId),
      where("question_id", "in", questionIds)
    );

    const attemptSnap = await getDocs(attemptsQuery);

    const attempts = attemptSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const attemptsMap = {};
    attempts.forEach(a => {
      if (!attemptsMap[a.question_id]) {
        attemptsMap[a.question_id] = [];
      }
      attemptsMap[a.question_id].push(a);
    });

    return {
      ...assignment,
      questions: assignment.questions.map(q => ({
        ...q,
        attempts: attemptsMap[q.question_id] || []
      }))
    };

  } catch (error) {
    console.error(error);
    return null;
  }
}



export {
  countAttempt,
  createAttempt,
  getBestAttemptByUserQuestion,
  getAttemptByUserQuestion,
  getStudentInfo,
  getAttemptsByStudent,
  getAssignmentWithStudentAttempts,
};
