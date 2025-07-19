import { useEffect, useState, useRef, useContext } from 'react'
import { io } from 'socket.io-client'
import { UserContext } from '../contexts/UserContext'
import { useLogout } from '../hooks/auth/useLogout'

const socket = io('http://localhost:3000')

function ChatPage () {
  const user = useContext(UserContext)
  const logout = useLogout()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const socketRef = useRef(socket)

  useEffect(() => {
    // listen for incoming messages
    socketRef.current.on('message', (data) => {
      setMessages((prev) => [...prev, data])
    })

    return () => {
      socketRef.current.off('message')
      socketRef.disconnect()
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      socketRef.current.emit('message', {
        user: user?.username,
        text: input
      })
      setInput('')
    }
  }
  return (
    <div className='chat-page'>
      <h2>Welcome to the Chat Room {user?.username}</h2>

      <ul className='messages'>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.user}:   </strong>
            {msg.text}
          </li>
        ))}
      </ul>

      <form className='chat-input' onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Type your message...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type='submit'>Send</button>
      </form>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default ChatPage
