import { collection, doc, getDocs, setDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const dbCollection = collection(db, "cohorts");

export async function getAllStudents() {
  const q = query(collection(db, "users"), where("role", "==", "student"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function getCohortsByOwner(ownerUid) {
  const q = query(dbCollection, where("owner_user_id", "==", ownerUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function createCohort(cohort) {
  const ref = doc(dbCollection);
  await setDoc(ref, { ...cohort, cohort_id: ref.id });
  return ref.id;
}

export async function updateCohort(cohortId, student_uids) {
  await setDoc(doc(dbCollection, cohortId), { student_uids }, { merge: true });
}
