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

async function getAllCompletedAssignmnetByStudent(studentId) {
  try {
    const studentAssignmentQuery = query(
      dbCollection,
      where("student_user_id", "==", studentId),
      where("status", "==", "submitted"),
      orderBy("assigned_on", "desc")
    );

    let assignments = [];
    const querySnapshot = await getDocs(studentAssignmentQuery);

    for (const docSnap of querySnapshot.docs) {
      const studentAssignmentData = docSnap.data();

      const assignmentQuery = query(
        collection(db, "assignments"),
        where("assignment_id", "==", studentAssignmentData.assignment_id)
      );

      const assignmentSnapShot = await getDocs(assignmentQuery);
      const assignment = assignmentSnapShot.docs[0]?.data();

      if (assignment) {
        assignment.status = studentAssignmentData.status;
        assignment.assigned_on = studentAssignmentData.assigned_on;
        assignments.push(assignment);
      }
    }

    return assignments;
  } catch (error) {
    console.error(`getAllCompletedAssignmnetByStudent: ${error}`);
    return [];
  }
}

async function getAllAssignmnetByStudent(studentId) {
  try {
    const studentAssignmentQuery = query(
      dbCollection,
      where("student_user_id", "==", studentId),
      orderBy("assigned_on", "desc")
    );
    let assignments = [];
    const querySnapshot = await getDocs(studentAssignmentQuery);
    for (const doc of querySnapshot.docs) {
      let assignmentQuery = query(
        collection(db, "assignments"),
        where("assignment_id", "==", doc.data().assignment_id)
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
        studentAssignment.studentAssignmentId
      )
    );
    const objStudentAssignment = await getDocs(studentAssignmentQuery);

    if (objStudentAssignment.empty) {
      return null;
    }
    const studentAssignmentDocRef = objStudentAssignment.docs[0].ref;
    await updateDoc(studentAssignmentDocRef, studentAssignment);
    return studentAssignmentDocRef;
  } catch (error) {
    console.error(`updateStudentAssignment: ${error}`);
  }
}


async function getStudentsByCohort(cohortId) {
  try {
    const usersCol = collection(db, "users"); 
    let q;
    if (cohortId === "all") {
      q = query(usersCol, where("role", "==", "student")); 
    } else {
      q = query(usersCol, where("cohort_id", "==", cohortId));
    }
    const snapshot = await getDocs(q);
    const students = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    return students;
  } catch (err) {
    console.error("getStudentsByCohort:", err);
    return [];
  }
}



export {
  createNewStudentAssignment,
  getAllAssignmnetByStudent,
  getAllCompletedAssignmnetByStudent,
  updateStudentAssignment,
  getStudentsByCohort,
};