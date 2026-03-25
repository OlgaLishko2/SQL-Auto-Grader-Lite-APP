import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getBestAttemptByUserQuestion, getAttemptByPolicy } from "./questionAttempts";

const dbCollection = collection(db, "student_assignments");



async function createNewStudentAssignment(studentAssignment) {
  try {
    const newDocRef = doc(dbCollection);
    const studentAssignmentId = newDocRef.id;
    await setDoc(newDocRef, {
      ...studentAssignment,
      student_assignment_id: studentAssignmentId,
    });
    console.log(
      "Assignment created in student_assignments with id: ",
      studentAssignmentId,
    );
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
  const today = new Date().toLocaleDateString("en-CA");
  try {
    const studentAssignmentQuery = query(
      dbCollection,
      where("student_user_id", "==", studentId),
      where("status", "==", "assigned"),
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
    let studentAssignmentDocRef;
    const studentAssignmentQuery = query(
      dbCollection,
      where("student_user_id", "==", studentAssignment.student_user_id),
      where("assignment_id", "==", studentAssignment.assignment_id),
      limit(1),
    );
    const objStudentAssignment = await getDocs(studentAssignmentQuery);

    if (objStudentAssignment.empty) {
      console.error(
        "updateStudentAssignment: no matching student assignment found",
        studentAssignment,
      );
      return null;
    }

    studentAssignmentDocRef = objStudentAssignment.docs[0].ref;
    console.log(studentAssignmentDocRef);
    await updateDoc(studentAssignmentDocRef, studentAssignment);
    return studentAssignmentDocRef;
  } catch (error) {
    console.error(`updateStudentAssignment: ${error}`);
    return null;
  }
}

//Return an array of  completed assignemnts by Student
async function getAllCompletedAssignmnetByStudent(studentId) {
  try {
    const snap1 = await getDocs(query(dbCollection, where("student_user_id", "==", studentId), where("status", "==", "submitted"), orderBy("assigned_on", "desc")));
    const snap2 = await getDocs(query(dbCollection, where("student_user_id", "==", studentId), where("status", "==", "completed"), orderBy("assigned_on", "desc")));
    const allDocs = [...snap1.docs, ...snap2.docs];
    let assignments = [];
    for (const doc of allDocs) {
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
      where("assignment_id", "==", assignment_id),
    );
    const objStudentAssignment = await getDocs(studentAssignmentQuery);
    if (objStudentAssignment.empty) {
      return null;
    }
    const students = objStudentAssignment.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    const assignmentIdFromData =
      objStudentAssignment.docs[0].data().assignment_id;
    //console.log(assignmentIdFromData)

    const assignmentRef = query(
      collection(db, "assignments"),
      where("assignment_id", "==", assignmentIdFromData),
    );

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
    let q;
    if (cohortId === "all") {
      q = query(usersCol, where("role", "==", "student"));
    } else {
      //q = query(usersCol, where("cohort_id", "==", cohortId));
      q = query(
        usersCol,
        where("role", "==", "student"),
        where("cohort_id", "==", cohortId),
      );
    }
    const snapshot = await getDocs(q);
    const students = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
    return students;
  } catch (err) {
    console.error("getStudentsByCohort:", err);
    return [];
  }
}

async function getStudentAssignmentsWithDetails() {
  try {
    const snap = await getDocs(collection(db, "student_assignments"));
    const assignments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const userIds = [...new Set(        
        assignments
          .flatMap(a =>
            Array.isArray(a.student_user_id)
              ? a.student_user_id
              : [a.student_user_id]
          )
          .filter(id => typeof id === "string")
      )];
      
    const assignmentIds = [...new Set(assignments.map(a => a.assignment_id))];

    const [userSnaps, assignmentSnaps] = await Promise.all([
      Promise.all(userIds.map((uid) => getDoc(doc(db, "users", uid)))),
      Promise.all(
        assignmentIds.map((id) => getDoc(doc(db, "assignments", id))),
      ),
    ]);

    const userMap = {};
    userSnaps.forEach((s, i) => {
      if (s.exists()) userMap[userIds[i]] = s.data();
    });

    const assignmentMap = {};
    assignmentSnaps.forEach((s, i) => {
      if (s.exists()) assignmentMap[assignmentIds[i]] = s.data();
    });

    const results = await Promise.all(assignments.map(async (a) => {
      const assignmentData = assignmentMap[a.assignment_id];
      const questions = assignmentData?.questions || [];
      const totalMarks = questions.reduce((s, q) => s + (q.mark || 1), 0);
      const attempts = await Promise.all(questions.map(q => getAttemptByPolicy(a.student_user_id, q.question_id, assignmentData?.grading_policy || 'best')));
      const earnedMarks = attempts.reduce((s, att, i) => s + (att?.is_correct ? (questions[i].mark || 1) : 0), 0);
      return {
        ...a,
        studentName: userMap[a.student_user_id]?.fullName || "Unknown",
        assignmentTitle: assignmentData?.title || "Assignment",
        dueDate: assignmentData?.dueDate || null,
        earnedMarks,
        totalMarks,
      };
    }));
    return results;
  } catch (error) {
    console.error(`getStudentAssignmentsWithDetails: ${error}`);
    return [];
  }
}

async function publishAssignmentToStudents(assignmentId, cohortId, dueDate) {
  try {
    const cohortSnap = await getDocs(
      query(collection(db, "cohorts"), where("cohort_id", "==", cohortId)),
    );
    if (cohortSnap.empty)
      return { success: false, message: "Cohort not found." };

    const studentUids = cohortSnap.docs[0].data().student_uids || [];
    if (!studentUids.length)
      return { success: false, message: "No students in this cohort." };

    await Promise.all(
      studentUids.map((uid) => {
        const ref = doc(dbCollection);
        return setDoc(ref, {
          student_assignment_id: ref.id,
          assignment_id: assignmentId,
          student_user_id: uid,
          status: "assigned",
          assigned_on: new Date(),
          submissionDate: null,
          due_on: dueDate,
        });
      }),
    );
    return { success: true };
  } catch (err) {
    console.error("publishAssignmentToStudents:", err);
    return { success: false, message: err.message };
  }
}

async function isAssignmentPublished(assignmentId) {
  try {
    const snap = await getDocs(
      query(dbCollection, where("assignment_id", "==", assignmentId)),
    );
    return !snap.empty;
  } catch (e) {
    console.error("isAssignmentPublished:", e);
    return false;
  }
}

async function getDashboardDataForTeacher(teacherId) {
  try {
    const assignmentsSnap = await getDocs(
      query(
        collection(db, "assignments"),
        where("owner_user_id", "==", teacherId),
      ),
    );
    const assignments = assignmentsSnap.docs.map((d) => ({
      assignment_id: d.id,
      ...d.data(),
    }));

    if (!assignments.length)
      return {
        assignments: [],
        studentAssignments: [],
        studentsCount: 0,
        needsGrading: [],
      };

    const assignmentIds = assignments.map((a) => a.assignment_id);
    let studentAssignments = [];
    for (let i = 0; i < assignmentIds.length; i += 10) {
      const snap = await getDocs(
        query(
          dbCollection,
          where("assignment_id", "in", assignmentIds.slice(i, i + 10)),
        ),
      );
      studentAssignments.push(...snap.docs.map((d) => d.data()));
    }

    const studentsCount = new Set(
      studentAssignments.map((sa) => sa.student_user_id),
    ).size;
    const needsGrading = studentAssignments.filter(
      (sa) => sa.status === "submitted",
    );

    return { assignments, studentAssignments, studentsCount, needsGrading };
  } catch (e) {
    console.error("getDashboardDataForTeacher:", e);
    return {
      assignments: [],
      studentAssignments: [],
      studentsCount: 0,
      needsGrading: [],
    };
  }
}

export {
  createNewStudentAssignment,
  getAllAssignmnetByStudent,
  getAllCompletedAssignmnetByStudent,
  updateStudentAssignment,
  getAssignmentDetailsByAssignmentId,
  getStudentsByCohort,
  getStudentAssignmentsWithDetails,
  publishAssignmentToStudents,
  isAssignmentPublished,
  getDashboardDataForTeacher,
};
