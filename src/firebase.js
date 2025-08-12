import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Your Firebase configuration
// Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBgYAPBnjfceq8uQ_yVRiogDAPdIYMAwNA",
    authDomain: "producecart-a1dde.firebaseapp.com",
    projectId: "producecart-a1dde",
    storageBucket: "producecart-a1dde.firebasestorage.app",
    messagingSenderId: "191764996224",
    appId: "1:191764996224:web:18732a4f1c1c43c99ec665",
    measurementId: "G-XK7W59DTR0"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

export default app
