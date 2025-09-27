// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Import Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCydydJqBzGlQi8ywpvCsx2UyGIyLhZXtY",
  authDomain: "smart-waste-davao.firebaseapp.com",
  databaseURL: "https://smart-waste-davao-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "smart-waste-davao",
  storageBucket: "smart-waste-davao.firebasestorage.app",
  messagingSenderId: "479420187394",
  appId: "1:479420187394:web:3a5b6f0f3e2e4f4e8e4e8e",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const database = getDatabase(app); // Initialize Realtime Database