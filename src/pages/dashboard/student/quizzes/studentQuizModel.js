import { collection, doc, getDocs, setDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../../firebase";

const quizCol = collection(db, "student_quizzes");

export async function getQuizzesForStudent(studentId) {
  try {
    const cohortSnap = await getDocs(query(collection(db, "cohorts"), where("student_uids", "array-contains", studentId)));
    const cohortIds = cohortSnap.docs.map(d => d.data().cohort_id);
    if (!cohortIds.length) return [];

    const quizSnap = await getDocs(query(collection(db, "quizzes"), where("student_class", "in", cohortIds)));
    const quizzes = quizSnap.docs.map(d => d.data());

    const submissionSnap = await getDocs(query(quizCol, where("student_user_id", "==", studentId)));
    const submittedIds = new Set(submissionSnap.docs.map(d => d.data().quiz_id));

    return quizzes.map(q => ({ ...q, status: submittedIds.has(q.quiz_id) ? "Completed" : "New" }));
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
