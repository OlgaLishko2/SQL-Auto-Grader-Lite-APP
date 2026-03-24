import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

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

async function getStudentCohortIds(studentUid) {
  try {
    const snap = await getDocs(query(collection(db, "cohorts"), where("student_uids", "array-contains", studentUid)));
    return snap.docs.map(d => d.data().cohort_id);
  } catch (error) {
    console.error(`getStudentCohortIds: ${error}`);
    return [];
  }
}

export { createNewAssignment, getAllAssignmentByOwner, updateAssignment, getAssignmentsForStudent, addQuestionToAssignment };
