import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdvertDetail from './pages/AdvertDetail'
import PostAdvert from './pages/PostAdvert'
import MyAdverts from './pages/MyAdverts'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  const { loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'1.2rem',color:'#888'}}>Loading...</div>
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/advert/:id" element={<AdvertDetail />} />
          <Route path="/post" element={<PostAdvert />} />
          <Route path="/edit/:id" element={<PostAdvert />} />
          <Route path="/my-adverts" element={<MyAdverts />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
