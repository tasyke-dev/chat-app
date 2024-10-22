import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "none",
  authDomain: "none",
  projectId: "none",
  storageBucket: "none",
  messagingSenderId: "none",
  appId: "none",
  measurementId: "none"
};

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


const db = getFirestore(app);

export { auth, db };
