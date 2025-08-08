import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Your Firebase configuration
// Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyAAT2PUeQq1EoFf6AHSisRUeTRujXEVTrU",
    authDomain: "producecart-4872a.firebaseapp.com",
    projectId: "producecart-4872a",
    storageBucket: "producecart-4872a.firebasestorage.app",
    messagingSenderId: "631258963285",
    appId: "1:631258963285:web:06fe7631b7a44843a8a3dc",
    measurementId: "G-F1EXL7GSD9"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

export default app
