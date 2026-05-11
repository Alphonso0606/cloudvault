import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDn01zX_yJTTagxp4m1kOoNs3wYtyH0OJQ",
  authDomain: "claudvault-6ebbb.firebaseapp.com",
  projectId: "claudvault-6ebbb",
  messagingSenderId: "1001431478842",
  appId: "1:1001431478842:web:cee73dc32a1bd56c5efb03",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

export const CLOUDINARY_CLOUD_NAME = "dl9rvxnel"
export const CLOUDINARY_UPLOAD_PRESET = "cloudvault_preset"