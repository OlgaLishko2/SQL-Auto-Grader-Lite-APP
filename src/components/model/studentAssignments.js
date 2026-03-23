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
    console.log("Assignment created in student_assignments with id: ", studentAssignmentId);
    return studentAssignmentId;
  } catch (error) {
    console.error(`createNewStudentAssignment: ${error}`);
  }
}

// async function getAllCompletedAssignmnetByStudent(studentId) {
//   try {
//     const studentAssignmentQuery = query(
//       dbCollection,
//       where("student_user_id", "==", studentId),
//       where("status", "==", "submitted"),
//       orderBy("assigned_on", "desc"),
//     );

//     let assignments = [];
//     const querySnapshot = await getDocs(studentAssignmentQuery);

//     for (const docSnap of querySnapshot.docs) {
//       const studentAssignmentData = docSnap.data();

//       const assignmentQuery = query(
//         collection(db, "assignments"),
//         where("assignment_id", "==", studentAssignmentData.assignment_id),
//       );

//       const assignmentSnapShot = await getDocs(assignmentQuery);
//       const assignment = assignmentSnapShot.docs[0]?.data();

//       if (assignment) {
//         assignment.status = studentAssignmentData.status;
//         assignment.assigned_on = studentAssignmentData.assigned_on;
//         assignments.push(assignment);
//       }
//     }

//     return assignments;
//   } catch (error) {
//     console.error(`getAllCompletedAssignmnetByStudent: ${error}`);
//     return [];
//   }
// }

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
    console.error(`updateStudentAssignment: ${error}`);
  }
}


//Return an array of  completed assignemnts by Student
async function getAllCompletedAssignmnetByStudent(studentId) {
// console.log(studentId);
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
      //  console.log( doc.data().assignment_id);
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

// Get Assignment detail by Assignment id
async function getAssignmentDetailsByAssignmentId(assignment_id) {

  try {
     const studentAssignmentQuery = query(
      dbCollection,
      where(
        "assignment_id",
        "==",
       assignment_id,
      ),
    );
    const objStudentAssignment = await getDocs(studentAssignmentQuery);
    if (objStudentAssignment.empty) {
      return null;
    }
    const students = objStudentAssignment.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data()
    }));
    const assignmentIdFromData = objStudentAssignment.docs[0].data().assignment_id;
    //console.log(assignmentIdFromData)
 
    const assignmentRef =  query(collection(db, "assignments"), 
    where("assignment_id", "==", assignmentIdFromData));

    const assignmentSnap = await getDocs(assignmentRef);
      if (assignmentSnap.empty) {
        return null;
      }
        const assignmentData = assignmentSnap.docs[0].data();
      //console.log(assignmentData);
    return assignmentData;

    } catch (error) {
      console.error(`getAssignmentDetailsByAssignmentId: ${error}`);
      return [];
    }
}

async function getStudentsByCohort(cohortId) {
  try {
    const usersCol = collection(db, "users");
    const cohortCol = collection(db, "cohorts");
    let q;
    if (cohortId === "all") {
      q = query(usersCol, where("role", "==", "student"));
    } else {
      //q = query(usersCol, where("cohort_id", "==", cohortId));
      q = query(cohortCol, where("cohort_id", "==", cohortId));
    }
    const snapshot = await getDocs(q);
    console.log("cohortId, snapshot: ", cohortId, snapshot);

    const students = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    console.log("returning value of students: ", students);

    return students;
  } catch (err) {
    console.error("getStudentsByCohort:", err);
    return [];
  }
}

export {
  createNewStudentAssignment,
  getAllAssignmnetByStudent,
  updateStudentAssignment,
  // getAllCompletedAssignmnetByStudent,
  getAssignmentDetailsByAssignmentId,
  getStudentsByCohort,
  getAllCompletedAssignmnetByStudent
};
