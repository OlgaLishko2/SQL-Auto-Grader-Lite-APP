import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";

const dbCollection = collection(db, "student_assignments");
// {
//     "assignment_id": "zaKRITFhoed2KGuswkPA",
//     "student_user_id": "1gO5J2uLppdIZeSBRBoT2stJ8Ch2",
//     "assigned_on": "2026-03-01",
//     "due_on": "2026-03-10",
//     "status": "assigned"
//   };
async function createNewStudentAssignment(studentAssignment) {
  try {
    const newDocRef = doc(dbCollection);
    const studentAssignmentId = newDocRef.id;
    await setDoc(newDocRef, {
      ...studentAssignment,
      student_assignment_id: studentAssignmentId,
    });

    return studentAssignmentId;
  } catch (error) {
    console.error(`createNewStudentAssignment: ${error}`);
  }
}
// assignments = [{
//   assigned_on: "2026-03-01",
//   assignment_id: "QumeTD0jZAv0LiNBUd7M",
//   created_on: "2026-03-01",
//   dataset: "DatasetA",
//   description: "Build a dashboard for Q2 revenue by region and product line.",
//   dueDate: "2026-03-25",
//   owner_user_id: 12,
//   status: "assigned",
//   title: "Q2 Sales Dashboard 1",
//   updated_on: "2026-03-10",
// }]
//Return an array of assignemnts by Student
async function getAllAssignmnetByStudent(studentId) {
  try {
    const studentAssignmentQuery = query(
      dbCollection,
      where("student_user_id", "==", studentId),
      orderBy("assigned_on", "desc"),
    );
    let assignments = [];
    const querySnapshot = await getDocs(studentAssignmentQuery);
    for (const doc of querySnapshot.docs) {
      let assignmentQuery = query(
        collection(db, "assignments"),
        where("assignment_id", "==", doc.data().assignment_id),
      );
      let assignmentSnapShot = await getDocs(assignmentQuery);
      let assignment = assignmentSnapShot.docs[0]?.data();
      if (assignment) {
        assignment.status = doc.data().status;
        assignment.assigned_on = doc.data().assigned_on;
        assignments.push(assignment);
      }
    }
    return assignments;
  } catch (error) {
    console.error(`getAllAssignmnetByStudent: ${error}`);
  }
}

async function updateStudentAssignment(studentAssignment) {
  try {
    const studentAssignmentQuery = query(
      dbCollection,
      where(
        "student_assignment_id",
        "==",
        studentAssignment.studentAssignmentId,
      ),
    );
    const objStudentAssignment = await getDocs(studentAssignmentQuery);

    if (objStudentAssignment.empty) {
      return null;
    }
    const studentAssignmentDocRef = objStudentAssignment.docs[0].ref;
    await updateDoc(studentAssignmentDocRef, studentAssignment);
    return studentAssignmentDocRef;
  } catch (error) {
    console.error(`updatequestion: ${error}`);
  }
}


//Return an array of  completed assignemnts by Student
async function getAllCompletedAssignmnetByStudent(studentId) {

  try {
    const studentAssignmentQuery = query(
      dbCollection,
      where("student_user_id", "==", studentId),
      where("status", "==", "submitted"),
      orderBy("assigned_on", "desc"),
    );
    let assignments = [];
    const querySnapshot = await getDocs(studentAssignmentQuery);
    for (const doc of querySnapshot.docs) {
      let assignmentQuery = query(
        collection(db, "assignments"),
        where("assignment_id", "==", doc.data().assignment_id),
      );
      let assignmentSnapShot = await getDocs(assignmentQuery);
      let assignment = assignmentSnapShot.docs[0]?.data();
      if (assignment) {
        assignment.status = doc.data().status;
        assignment.assigned_on = doc.data().assigned_on;
        assignments.push(assignment);
      }
    }
   
    return assignments;
    
  } catch (error) {
    console.error(`getAllCompletedAssignmnetByStudent: ${error}`);
  }
}


export {
  createNewStudentAssignment,
  getAllAssignmnetByStudent,
  updateStudentAssignment,
  getAllCompletedAssignmnetByStudent,
};
