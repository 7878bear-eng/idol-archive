import { initializeApp }
from "firebase/app";

import {
getFirestore
}
from "firebase/firestore";

const firebaseConfig = {

apiKey:
"너 apiKey",

authDomain:
"idol-mv-archive.firebaseapp.com",

projectId:
"idol-mv-archive",

storageBucket:
"idol-mv-archive.appspot.com",

messagingSenderId:
"너 sender",

appId:
"너 appId",

};

const app =
initializeApp(
firebaseConfig
);

export const db =
getFirestore(
app
);