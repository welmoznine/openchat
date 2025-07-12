import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ChatPage from './pages/ChatPage'

import './App.css';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        
      </Routes>
    </Router>
  )
}

export default App
