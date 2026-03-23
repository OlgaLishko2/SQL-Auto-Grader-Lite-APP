import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

async function getQuizSubmissionsWithDetails() {
  try {
    const snap = await getDocs(collection(db, "student_quizzes"));
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
  } catch (error) {
    console.error(`getQuizSubmissionsWithDetails: ${error}`);
    return [];
  }
}

export { getQuizSubmissionsWithDetails };
