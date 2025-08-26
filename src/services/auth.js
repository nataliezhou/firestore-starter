import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { createCart } from './firestore';
import { auth } from '../firebase'

// User state management
let currentUser = null
const authStateListeners = []

// Promise to indicate when Firebase auth is initialized
let authReadyResolver = null
export const authReady = new Promise(resolve => {
  authReadyResolver = resolve })

export const getCurrentUser = () => currentUser

export const onAuthStateChange = (callback) => {
  authStateListeners.push(callback);
  callback(currentUser); // Immediately call with current state
  return () => {
    const index = authStateListeners.indexOf(callback)
    if (index > -1) {
      authStateListeners.splice(index, 1)
    }
  }
}


// Initialize auth state listener
onAuthStateChanged(auth, (user) => { // listening to firebase 
  console.log("auth state listener called in auth.js")
  currentUser = user
  if (authReadyResolver) {
    authReadyResolver()
    authReadyResolver = null
  }
  authStateListeners.forEach(callback => callback(user))
})

// Registration
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: displayName
    })

  await createCart(user.uid);
    
    return user
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

// Login
export const loginUser = async (email, password) => {
  try {
    await setPersistence(auth, browserSessionPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error logging out:', error)
    throw error
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!currentUser
}

// Get user ID
export const getUserId = () => {
  return currentUser?.uid
}

// Get user display name
export const getUserDisplayName = () => {
  return currentUser?.displayName
}