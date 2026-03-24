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

    const submitted = submissions.map(s => ({
      ...s,
      studentName: userMap[s.student_user_id]?.fullName || "Unknown",
      quizTitle: quizMap[s.quiz_id]?.title || "Quiz",
    }));

    // Find all quizzes and their assigned cohorts, then add not-submitted students
    const allQuizzesSnap = await getDocs(quizzesCol);
    const allQuizzes = allQuizzesSnap.docs.map(d => d.data());
    const cohortIds = [...new Set(allQuizzes.map(q => q.student_class).filter(Boolean))];
    if (!cohortIds.length) return submitted;

    const cohortSnaps = await getDocs(query(collection(db, "cohorts"), where("cohort_id", "in", cohortIds)));
    const cohortMap = {};
    cohortSnaps.docs.forEach(d => { const c = d.data(); cohortMap[c.cohort_id] = c.student_uids || []; });

    const allStudentIds = [...new Set(Object.values(cohortMap).flat())];
    const studentSnaps = await Promise.all(allStudentIds.map(uid => getDoc(doc(db, "users", uid))));
    const studentMap = {};
    studentSnaps.forEach((s, i) => { if (s.exists()) studentMap[allStudentIds[i]] = s.data(); });

    const submissionMap2 = {};
    submissions.forEach(s => { submissionMap2[`${s.quiz_id}_${s.student_user_id}`] = s; });

    const result = [];
    allQuizzes.forEach(q => {
      const students = cohortMap[q.student_class] || [];
      students.forEach(uid => {
        const sub = submissionMap2[`${q.quiz_id}_${uid}`];
        result.push({
          id: `${q.quiz_id}_${uid}`,
          quiz_id: q.quiz_id,
          student_user_id: uid,
          studentName: studentMap[uid]?.fullName || "Unknown",
          quizTitle: q.title || "Quiz",
          status: sub ? "Submitted" : "Assigned",
          submissionDate: sub?.submissionDate || "-",
          mark: sub?.mark ?? "-",
        });
      });
    });

    return result;
  } catch (e) {
    console.error("getQuizSubmissionsWithDetails:", e);
    return [];
  }
}
