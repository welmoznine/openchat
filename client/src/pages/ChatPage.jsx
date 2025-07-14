import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

function ChatPage() {
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

  return (
    <div className="chat-page">
      <h2>Welcome to the Chat Room</h2>

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
    </div>
  )
}

export default ChatPage
