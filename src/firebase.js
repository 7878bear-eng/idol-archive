import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9_QochfHnsxSO0Kjvt_2qTnCV5QUmYVg",
  authDomain: "idol-mv-archive.firebaseapp.com",
  projectId: "idol-mv-archive",
  storageBucket: "idol-mv-archive.firebasestorage.app",
  messagingSenderId: "221694301572",
  appId: "1:221694301572:web:cccb1b12b3a49a16e239d1",
  measurementId: "G-N4QGPPN57J",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
