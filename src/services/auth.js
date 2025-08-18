import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from '../firebase'

// User state management
let currentUser = null
const authStateListeners = []

export const getCurrentUser = () => currentUser

export const onAuthStateChange = (callback) => {
  authStateListeners.push(callback)
  return () => {
    const index = authStateListeners.indexOf(callback)
    if (index > -1) {
      authStateListeners.splice(index, 1)
    }
  }
}

// Initialize auth state listener
onAuthStateChanged(auth, (user) => {
  currentUser = user
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
    
    return user
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

// Login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
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