import { collection, doc, getDocs, setDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

const dbCollection = collection(db, "cohorts");

export async function getAllStudents() {
  const q = query(collection(db, "users"), where("role", "==", "student"), orderBy("fullName", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function getCohortsByOwner(ownerUid) {
  const q = query(dbCollection, where("owner_user_id", "==", ownerUid), orderBy("name", "asc"));
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

export async function getAllCohorts() {
  const q = query(dbCollection, orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function getAllStudentsPerCohorts(cohortId) {
  console.log("Inside getAllStudentsPerCohorts: cohortId: ", cohortId)
  const q = query(dbCollection, 
    where("cohort_id", "==", cohortId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

