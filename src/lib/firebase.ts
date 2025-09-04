// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOdfpweJteu4fnmYgD7rH2TV1KYCB20CI",
  authDomain: "identitymakernextjs.firebaseapp.com",
  projectId: "identitymakernextjs",
  storageBucket: "identitymakernextjs.firebasestorage.app",
  messagingSenderId: "346068275288",
  appId: "1:346068275288:web:fd035b298adf8b24a4ba2d",
  measurementId: "G-MEX0RR3FK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
