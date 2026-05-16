import { useState, useEffect, useCallback } from 'react'
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, query, where, orderBy
} from 'firebase/firestore'
import { db, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../firebase'
import { extractText } from '../utils/extractText'
import { analyzeWithAI } from '../utils/aiAnalyze'

export function getFileType(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['pdf'].includes(ext)) return 'pdf'
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'image'
  if (['mp4','mov','avi','mkv','webm'].includes(ext)) return 'video'
  if (['doc','docx','odt'].includes(ext)) return 'doc'
  if (['xls','xlsx','csv'].includes(ext)) return 'sheet'
  if (['zip','rar','7z','tar'].includes(ext)) return 'archive'
  if (['mp3','wav','ogg','aac'].includes(ext)) return 'audio'
  return 'other'
}

export function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000) return "Aujourd'hui"
  if (diff < 172800000) return "Hier"
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'cloudvault')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        resolve({ url: data.secure_url, publicId: data.public_id })
      } else {
        reject(new Error('Erreur Cloudinary'))
      }
    }
    xhr.onerror = () => reject(new Error('Erreur réseau'))
    xhr.send(formData)
  })
}

export function useFiles(userId) {
  const [files, setFiles]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(
        collection(db, 'files'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setFiles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [userId])

  // Upload + extraction texte + analyse IA
  const uploadFile = useCallback(async (file, tags = [], folder = '', onProgress, onStage) => {
    const type = getFileType(file.name)

    // Étape 1 : Upload Cloudinary
    onStage?.('upload')
    const { url, publicId } = await uploadToCloudinary(file, onProgress)

    // Étape 2 : Extraction texte (OCR / PDF.js)
    onStage?.('extract')
    const extractedText = await extractText(file, type)

    // Étape 3 : Analyse IA (résumé + tags auto)
    onStage?.('ai')
    const { summary, aiTags } = await analyzeWithAI(extractedText, file.name)

    // Étape 4 : Sauvegarde Firestore
    onStage?.('save')
    const docRef = doc(collection(db, 'files'))
    await setDoc(docRef, {
      userId,
      name: file.name,
      size: file.size,
      type,
      url,
      publicId,
      tags,
      folder: folder || '',
      favorite: false,
      createdAt: new Date(),
      // Données pour la recherche intelligente
      extractedText: extractedText.slice(0, 5000), // max 5000 chars
      summary,
      aiTags,
      searchIndex: buildSearchIndex(file.name, tags, aiTags, summary, extractedText),
    })
  }, [userId])

  const deleteFile = useCallback(async (fileDoc) => {
    await deleteDoc(doc(db, 'files', fileDoc.id))
  }, [])

  const toggleFavorite = useCallback(async (fileDoc) => {
    await setDoc(doc(db, 'files', fileDoc.id), { favorite: !fileDoc.favorite }, { merge: true })
  }, [])

  const updateTags = useCallback(async (fileDoc, tags) => {
    const newIndex = buildSearchIndex(fileDoc.name, tags, fileDoc.aiTags || [], fileDoc.summary || '', fileDoc.extractedText || '')
    await setDoc(doc(db, 'files', fileDoc.id), { tags, searchIndex: newIndex }, { merge: true })
  }, [])

  const updateFolder = useCallback(async (fileDoc, folder) => {
    await setDoc(doc(db, 'files', fileDoc.id), { folder }, { merge: true })
  }, [])

  // Recherche intelligente : nom + tags + aiTags + summary + texte extrait
  const searchFiles = useCallback((query) => {
    if (!query.trim()) return files
    const q = query.toLowerCase()
    return files.filter(f => {
      const idx = f.searchIndex || ''
      return idx.includes(q)
    })
  }, [files])

  const stats = {
    total: files.length,
    totalSize: files.reduce((a, f) => a + (f.size || 0), 0),
    byType: files.reduce((acc, f) => {
      acc[f.type] = acc[f.type] || { count: 0, size: 0 }
      acc[f.type].count++
      acc[f.type].size += f.size || 0
      return acc
    }, {}),
    folders: [...new Set(files.map(f => f.folder).filter(Boolean))],
  }

  return { files, loading, uploadFile, deleteFile, toggleFavorite, updateTags, updateFolder, searchFiles, stats }
}

// Construit un index de recherche à plat
function buildSearchIndex(name, tags, aiTags, summary, extractedText) {
  return [
    name,
    ...(tags || []),
    ...(aiTags || []),
    summary,
    extractedText.slice(0, 2000)
  ].join(' ').toLowerCase()
}