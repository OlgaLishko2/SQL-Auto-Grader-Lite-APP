import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
  updateDoc,
  arrayUnion,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
// import { question } from "fontawesome";

  // const assignment = {
  //   assignment_id: "QumeTD0jZAv0LiNBUd7M", //assignment_id will be created by firestore
  //   title: "Q2 Sales Dashboard 1",
  //   description: "Build a dashboard for Q2 revenue by region and product line.",
  //   owner_user_id: 12,
  //   dataset: "DatasetA",
  //   created_on: "2026-03-01",
  //   updated_on: "2026-03-10",
  //   dueDate: "2026-03-25",
  // };

const dbCollection = collection(db, "assignments");

async function createNewAssignment(assignment) {
  try {
    const newDocRef = doc(dbCollection);
    const assignmentId = newDocRef.id;
    await setDoc(newDocRef, {
      ...assignment,
      assignment_id: assignmentId,
    });

    return assignmentId;
  } catch (error) {
    console.error(`createNewAssignment: ${error}`);
  }
}

//Return an array of assignment
async function getAllAssignmentByOwner(ownerId) {
  try {
    const assignmentsQuery = query(
      dbCollection,
      where("owner_user_id", "==", ownerId),
    );
    let assignments = [];
    const querySnapshot = await getDocs(assignmentsQuery);
    querySnapshot.forEach((doc) => {
      assignments.push(doc.data());
    });
    return assignments;
  } catch (error) {
    console.error(`getAllAssignmentByOwner: ${error}`);
  }
}
//Return an array of assignment
async function getAllQuizByOwner(ownerId) {
  try {
    const assignmentsQuery = query(
      collection(db, "quizes"),
      where("owner_user_id", "==", ownerId),
    );
    let assignments = [];
    const querySnapshot = await getDocs(assignmentsQuery);
    querySnapshot.forEach((doc) => {
      assignments.push(doc.data());
    });
    return assignments;
  } catch (error) {
    console.error(`getAllQuizByOwner: ${error}`);
  }
}

async function updateAssignment(assignment) {
  try {
    const assignmentQuery = query(
      dbCollection,
      where("assignment_id", "==", assignment.assignment_id),
    );
    const objAssignment = await getDocs(assignmentQuery);

    if (objAssignment.empty) {
      return null;
    }
    const assignmentDocRef = objAssignment.docs[0].ref;
    await updateDoc(assignmentDocRef, assignment);
    return assignmentDocRef;
  } catch (error) {
    console.error(`updateAssignment: ${error}`);
  }
}

async function getAssignmentsForStudent(cohortIds) {
  try {
    // includes assignments assigned to "all" or any of the student's cohorts
    const targets = ["all", ...cohortIds];
    const assignmentsQuery = query(dbCollection, where("student_class", "in", targets));
    const querySnapshot = await getDocs(assignmentsQuery);
    return querySnapshot.docs.map((d) => d.data());
  } catch (error) {
    console.error(`getAssignmentsForStudent: ${error}`);
    return [];
  }
}

async function addQuestionToAssignment(assignmentId, incomeQuestion) {
  try {
    const docSnap = await getDoc(doc(db, 'assignments', assignmentId));
    if (!docSnap.exists()) return null;

    const existing = docSnap.data().questions || [];
    await updateDoc(docSnap.ref, { questions: [...existing, incomeQuestion] });
  } catch (error) {
    console.error(`addQuestionToAssignment: ${error}`);
  }
}

async function createNewQuiz(quiz) {
  try {
    const quizCollection = collection(db, "quizes");
    const newDocRef = doc(quizCollection);
    await setDoc(newDocRef, { ...quiz, quiz_id: newDocRef.id });
    return newDocRef.id;
  } catch (error) {
    console.error(`createNewQuiz: ${error}`);
  }
}

export { createNewAssignment, getAllAssignmentByOwner, updateAssignment, getAssignmentsForStudent, addQuestionToAssignment, getAllQuizByOwner, createNewQuiz };
