import { collection, doc, getDocs, getDoc, setDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const quizCol = collection(db, "student_quizzes");
const quizzesCol = collection(db, "quizzes");

export async function getAllQuizByOwner(ownerId) {
  try {
    const snap = await getDocs(query(quizzesCol, where("owner_user_id", "==", ownerId)));
    return snap.docs.map(d => d.data());
  } catch (e) {
    console.error("getAllQuizByOwner:", e);
  }
}

export async function createNewQuiz(quiz) {
  try {
    const ref = doc(quizzesCol);
    await setDoc(ref, { ...quiz, quiz_id: ref.id });
    return ref.id;
  } catch (e) {
    console.error("createNewQuiz:", e);
  }
}

export async function getQuizzesForStudent(studentId) {
  try {
    const cohortSnap = await getDocs(query(collection(db, "cohorts"), where("student_uids", "array-contains", studentId)));
    const cohortIds = cohortSnap.docs.map(d => d.data().cohort_id);
    if (!cohortIds.length) return [];

    const quizSnap = await getDocs(query(quizzesCol, where("student_class", "in", cohortIds)));
    const quizzes = quizSnap.docs.map(d => d.data());

    const submissionSnap = await getDocs(query(quizCol, where("student_user_id", "==", studentId)));
    const submissionMap = {};
    submissionSnap.docs.forEach(d => { const s = d.data(); submissionMap[s.quiz_id] = s; });

    return quizzes.map(q => {
      const sub = submissionMap[q.quiz_id];
      return { ...q, status: sub ? "Completed" : "New", achievedMark: sub ? sub.mark : null };
    });
  } catch (e) {
    console.error("getQuizzesForStudent:", e);
    return [];
  }
}

export async function submitStudentQuiz({ quiz_id, student_user_id, submitted_sql, is_correct, mark }) {
  try {
    const ref = doc(quizCol);
    await setDoc(ref, {
      student_quiz_id: ref.id, quiz_id, student_user_id,
      submitted_sql, is_correct, mark,
      status: "submitted",
      submissionDate: new Date().toISOString(),
    });
    return ref.id;
  } catch (e) {
    console.error("submitStudentQuiz:", e);
  }
}

export async function getStudentQuizSubmission(quiz_id, student_user_id) {
  try {
    const snap = await getDocs(query(quizCol, where("quiz_id", "==", quiz_id), where("student_user_id", "==", student_user_id)));
    if (snap.empty) return null;
    return snap.docs[0].data();
  } catch (e) {
    console.error("getStudentQuizSubmission:", e);
    return null;
  }
}


export async function getQuizSubmissionsWithDetails() {
  try {
    const snap = await getDocs(quizCol);
    const submissions = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const userIds = [...new Set(submissions.map(s => s.student_user_id))];
    const quizIds = [...new Set(submissions.map(s => s.quiz_id))];

    const [userSnaps, quizSnaps] = await Promise.all([
      Promise.all(userIds.map(uid => getDoc(doc(db, "users", uid)))),
      Promise.all(quizIds.map(id => getDoc(doc(db, "quizzes", id)))),
    ]);

    const userMap = {};
    userSnaps.forEach((s, i) => { if (s.exists()) userMap[userIds[i]] = s.data(); });
    const quizMap = {};
    quizSnaps.forEach((s, i) => { if (s.exists()) quizMap[quizIds[i]] = s.data(); });

    return submissions.map(s => ({
      ...s,
      studentName: userMap[s.student_user_id]?.fullName || "Unknown",
      quizTitle: quizMap[s.quiz_id]?.title || "Quiz",
    }));
  } catch (e) {
    console.error("getQuizSubmissionsWithDetails:", e);
    return [];
  }
}
