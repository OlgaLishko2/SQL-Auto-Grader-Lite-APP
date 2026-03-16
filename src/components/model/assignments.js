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

export { createNewAssignment, getAllAssignmentByOwner, updateAssignment };
