import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfxlfVi2g-V8RskK_igzdFiiJQHf1rqME",
  authDomain: "sql-auto-grader-lite.firebaseapp.com",
  projectId: "sql-auto-grader-lite",
  storageBucket: "sql-auto-grader-lite.firebasestorage.app",
  messagingSenderId: "744339852849",
  appId: "1:744339852849:web:139b25e1a67214cecb0f10"
};

// Initialize Firebase app instance
const app = initializeApp(firebaseConfig);

// Export instances to be used in Feature 1 (Auth & Firestore)
export const auth = getAuth(app);
export const db = getFirestore(app);