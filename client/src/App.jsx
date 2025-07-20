import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import React, { useState } from 'react'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'
import ChatPage from './pages/ChatPage'
import { UserContext } from './contexts/UserContext'

import './App.css'

function App () {
  const [user, setUser] = useState(null)
  return (
    <UserContext.Provider value={[user, setUser]}>
      <Router>
        <Routes>
          <Route path='/' element={<ChatPage />} />
          {/* <Route path='/' element={<ProtectedRoute><ChatPage /></ProtectedRoute>} /> */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegistrationPage />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  )
}

export default App
