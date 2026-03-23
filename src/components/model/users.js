import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUser(uid, data) {
  await setDoc(doc(db, "users", uid), data);
}
