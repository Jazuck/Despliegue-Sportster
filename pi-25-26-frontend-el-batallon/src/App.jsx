import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegistrarMarca from './pages/RegistrarMarca'

import Profile from './pages/Profile'
import Ranking from './pages/Ranking'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/marca"  element={<RegistrarMarca />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/ranking/:idDeporte" element={<Ranking />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
