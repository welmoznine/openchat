import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'
import ChatPage from './pages/ChatPage'

import './App.css'

function App () {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegistrationPage />} />
      </Routes>
    </Router>
  )
}

export default App
