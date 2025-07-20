// src/components/chat/MessageInput.jsx
import { useState } from 'react'

const MessageInput = ({
  onSendMessage,
  onInputChange,
  isConnected,
  placeholder = 'Message #general',
}) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && isConnected) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setMessage(value)
    if (onInputChange) {
      onInputChange(value)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className='px-6 py-4 border-t border-slate-600'>
      <div className='relative'>
        <div className='flex items-center space-x-2'>
          <div className='flex-1 relative'>
            <textarea
              placeholder={
                isConnected
                  ? placeholder
                  : 'Disconnected - cannot send messages'
              }
              className='w-full px-4 py-3 bg-slate-600 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 disabled:opacity-50'
              rows='1'
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={!isConnected}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isConnected || !message.trim()}
            className='px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[44px]'
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageInput
