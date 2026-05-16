import { useState, useEffect, useCallback } from 'react'
import {
    collection, doc, setDoc, deleteDoc,
    onSnapshot, query, where, orderBy, arrayUnion, arrayRemove
} from 'firebase/firestore'
import { db } from '../firebase'

export const BOARD_COVERS = [
    { id: 'gradient-rose',     label: 'Rose',     style: 'linear-gradient(135deg, #fce7ef, #fbcfe8, #f9a8d4)' },
    { id: 'gradient-lavender', label: 'Lavande',  style: 'linear-gradient(135deg, #ede9fe, #ddd6fe, #c4b5fd)' },
    { id: 'gradient-mint',     label: 'Menthe',   style: 'linear-gradient(135deg, #d1fae5, #a7f3d0, #6ee7b7)' },
    { id: 'gradient-peach',    label: 'Pêche',    style: 'linear-gradient(135deg, #fed7aa, #fdba74, #fb923c)' },
    { id: 'gradient-sky',      label: 'Ciel',     style: 'linear-gradient(135deg, #e0f2fe, #bae6fd, #7dd3fc)' },
    { id: 'gradient-gold',     label: 'Gold',     style: 'linear-gradient(135deg, #fef9c3, #fde68a, #fcd34d)' },
    { id: 'gradient-night',    label: 'Nuit',     style: 'linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)' },
    { id: 'gradient-forest',   label: 'Forêt',    style: 'linear-gradient(135deg, #d1fae5, #6ee7b7, #059669)' },
]

export function useBoards(userId) {
    const [boards, setBoards] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) return
        const q = query(
            collection(db, 'boards'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        )
        const unsub = onSnapshot(q, snap => {
            setBoards(snap.docs.map(d => ({ id: d.id, ...d.data() })))
            setLoading(false)
        })
        return unsub
    }, [userId])

    const createBoard = useCallback(async ({ name, description, cover, emoji }) => {
        const ref = doc(collection(db, 'boards'))
        await setDoc(ref, {
            userId,
            name,
            description: description || '',
            cover: cover || BOARD_COVERS[0].id,
            emoji: emoji || '✨',
            fileIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        return ref.id
    }, [userId])

    const updateBoard = useCallback(async (boardId, data) => {
        await setDoc(doc(db, 'boards', boardId), { ...data, updatedAt: new Date() }, { merge: true })
    }, [])

    const deleteBoard = useCallback(async (boardId) => {
        await deleteDoc(doc(db, 'boards', boardId))
    }, [])

    const addFileToBoard = useCallback(async (boardId, fileId) => {
        await setDoc(doc(db, 'boards', boardId), {
            fileIds: arrayUnion(fileId),
            updatedAt: new Date()
        }, { merge: true })
    }, [])

    const removeFileFromBoard = useCallback(async (boardId, fileId) => {
        await setDoc(doc(db, 'boards', boardId), {
            fileIds: arrayRemove(fileId),
            updatedAt: new Date()
        }, { merge: true })
    }, [])

    return { boards, loading, createBoard, updateBoard, deleteBoard, addFileToBoard, removeFileFromBoard }
}