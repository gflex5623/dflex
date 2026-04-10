import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="logo"><span>d</span>Flex</Link>
        <nav>
          <Link to="/">Browse</Link>
          {user ? (
            <>
              <Link to="/my-adverts">My Adverts</Link>
              <Link to="/post">Post Advert</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register"><button className="btn-primary">Register</button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
