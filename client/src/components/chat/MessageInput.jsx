// src/components/chat/MessageInput.jsx
import { useState, useRef } from 'react'
import EmojiPicker from 'emoji-picker-react'

const MessageInput = ({
  onSendMessage,
  onInputChange,
  isConnected,
  placeholder = 'Message #general',
}) => {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef(null)

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

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev)
  }

  const insertEmoji = (emojiData) => {
    const emoji = emojiData.emoji
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newMessage = message.slice(0, start) + emoji + message.slice(end)
    setMessage(newMessage)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  return (
    <div className='px-6 py-4 border-t border-slate-600 relative'>
      <div className='flex items-center space-x-2'>

        <div className='flex-1'>
          <textarea
            ref={textareaRef}
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

        <div className='relative'>
          <button
            onClick={toggleEmojiPicker}
            type='button'
            className='p-2 bg-slate-500 rounded-lg hover:bg-slate-400 text-white'
            title='Add emoji'
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className='absolute bottom-full right-0 mb-2 z-50'>
              <EmojiPicker onEmojiClick={insertEmoji} theme='dark' />
            </div>
          )}
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
  )
}

export default MessageInput
