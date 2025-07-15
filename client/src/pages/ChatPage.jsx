import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useLogout } from '../hooks/auth/useLogout';

function ChatPage() {

  const user = useContext(UserContext);
  const logout = useLogout();
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const socketRef = useRef(null)

  useEffect(() => {
    // connect to socket server
    socketRef.current = io()

    // listen for incoming messages
    socketRef.current.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socketRef.current.disconnect();
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socketRef.current.emit('chat message', input)
      setInput('')
    }
  }

function ChatPage() {

  return (
    <div className="chat-page">
      <h2>Welcome to the Chat Room {user?.username}</h2>

      <div className="chat-messages">
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <button onClick= {logout}>Logout</button>
    </div>
  )
}

export default ChatPage
