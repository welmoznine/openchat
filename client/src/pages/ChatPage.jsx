import { useContext } from 'react';
import { UserContext } from "../contexts/UserContext"

function ChatPage() {

  const user = useContext(UserContext);

  return (
    <div className="chat-page">
      <h2>Welcome to the Chat Room {user?.username}</h2>

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
