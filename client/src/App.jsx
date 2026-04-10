import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdvertDetail from './pages/AdvertDetail'
import PostAdvert from './pages/PostAdvert'
import MyAdverts from './pages/MyAdverts'

export default function App() {
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
