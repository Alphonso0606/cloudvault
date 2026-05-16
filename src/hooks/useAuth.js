import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(undefined)
  useEffect(() => { const u = onAuthStateChanged(auth, setUser); return u }, [])
  return { user, loading: user === undefined }
}