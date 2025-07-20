import { useEffect, useState, useRef, useContext } from 'react'
import { io } from 'socket.io-client'
import { UserContext } from '../contexts/UserContext'
import { useLogout } from '../hooks/auth/useLogout'
import SettingsMenu from '../components/SettingsMenu'

const socket = io('http://localhost:3000')

function ChatPage () {
  const [message, setMessage] = useState('');
  const [user] = useContext(UserContext);
  const logout = useLogout();

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
    <div className="h-screen flex bg-slate-800 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 flex flex-col">
        {/* Profile section */}
        <div className="p-4 border-b border-slate-700 relative">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm">AR</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm">archie.mcquown</div>
              <div className="text-xs text-green-400">● Online</div>
            </div>
              <SettingsMenu onLogout={logout} />
          </div>
        </div>


        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Channels</h3>
            <div className="space-y-1">
              {[
                { name: "general", unread: 3 },
                { name: "random" },
                { name: "development", unread: 1 },
              ].map((c) => (
                <div
                  key={c.name}
                  className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-slate-700 ${
                    c.name === "general" ? "bg-slate-700 text-white" : "text-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">#</span>
                    <span className="text-sm">{c.name}</span>
                  </div>
                  {c.unread && (
                    <div className="bg-red-500 text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center text-white">
                      {c.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DMs (can extend this for dynamic data) */}
          <div className="px-4 py-2">
            <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Direct Messages</h3>
            {/* Reuse logic as needed */}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-slate-700">
        <div className="px-6 py-3 border-b border-slate-600">
          <h2 className="text-lg"># general</h2>
          <div className="text-sm text-gray-400">Team-wide communication</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Rendered messages could go here */}
        </div>

        {/* Message input */}
        <div className="px-6 py-4 border-t border-slate-600">
          <form className="relative">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <textarea
                  placeholder="Message #general"
                  className="w-full px-4 py-3 bg-slate-600 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  rows={1}
                  style={{ minHeight: 44, maxHeight: 120, height: 44 }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={!message.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[44px]"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage
