import { useState, useEffect } from 'react'

export const THEMES = [
    { id:'dark',     label:'Dark',    emoji:'🌙', preview:'#0f1117' },
    { id:'rose',     label:'Rose',    emoji:'🌸', preview:'#fce7ef' },
    { id:'lavender', label:'Lavande', emoji:'💜', preview:'#ede9fe' },
    { id:'beige',    label:'Beige',   emoji:'🤍', preview:'#f0ebe3' },
]

export function useTheme() {
    const [theme, setTheme] = useState(() => localStorage.getItem('cv-theme') || 'dark')
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('cv-theme', theme)
    }, [theme])
    return { theme, setTheme, themes: THEMES }
}