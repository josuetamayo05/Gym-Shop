import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA3jBzLJaZO0xjmIne94f25W7UoAkI6Dp0",
  authDomain: "gym-shop-442e2.firebaseapp.com",
  projectId: "gym-shop-442e2",
  storageBucket: "gym-shop-442e2.firebasestorage.app",
  messagingSenderId: "986652603992",
  appId: "1:986652603992:web:fa172259d9dce92d11bc2d",
  measurementId: "G-VBH3FVT8HS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);