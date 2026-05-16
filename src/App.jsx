import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function PrivateRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return (
        <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
            <div style={{ width:32, height:32, border:'2px solid var(--border2)', borderTopColor:'var(--accent)', borderRadius:'50%' }} className="spin" />
        </div>
    )
    return user ? children : <Navigate to="/login" />
}

export default function App() {
    useTheme()
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    )
}