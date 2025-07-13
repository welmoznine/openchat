import React from 'react'

function ChatPage() {
  return (
    <div className="chat-page">
      <h2>Welcome to the Chat Room</h2>

      <div className="chat-messages">
        {/* Chat messages will go here */}
      </div>

      <form className="chat-input">
        <input type="text" placeholder="Type your message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default ChatPage
