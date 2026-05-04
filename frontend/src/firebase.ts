import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "kochi-metro-train-projec-25477.firebaseapp.com",
  projectId: "kochi-metro-train-projec-25477",
  storageBucket: "kochi-metro-train-projec-25477.firebasestorage.app",
  messagingSenderId: "280630190458",
  appId: "1:280630190458:web:c5e1413f5b4371eb5db6c3",
  measurementId: "G-LY06XJ4W9W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
