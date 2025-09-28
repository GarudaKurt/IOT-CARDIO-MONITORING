// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Import Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNf6ud5zoSSfpC5CLpK0BhlsQVNjf59rk",
  authDomain: "cardio-and-fall-detector.firebaseapp.com",
  databaseURL: "https://cardio-and-fall-detector-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cardio-and-fall-detector",
  storageBucket: "cardio-and-fall-detector.firebasestorage.app",
  messagingSenderId: "17068599356",
  appId: "1:17068599356:web:0161647645eb18b460bb39"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const database = getDatabase(app); // Initialize Realtime Database