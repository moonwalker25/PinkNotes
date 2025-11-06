import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAoxPlEtE-N7C_Ri4KnmuXzCqD9sKjv5zQ",
  authDomain: "pinknotes-5239d.firebaseapp.com",
  projectId: "pinknotes-5239d",
  storageBucket: "pinknotes-5239d.appspot.com",
  messagingSenderId: "497552119263",
  appId: "1:497552119263:web:0e49e05a741c92df90606a",
  measurementId: "G-K5L6BV8YWT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
