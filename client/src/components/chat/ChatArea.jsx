// src/components/chat/ChatArea.jsx
import ChatHeader from './ChatHeader'
import Message from './Message'
import MessageInput from './MessageInput'

const ChatArea = ({ channelName, description, messages, onSendMessage }) => (
  <div className='flex-1 flex flex-col bg-slate-700'>
    <ChatHeader channelName={channelName} description={description} />

    <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4'>
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
    </div>

    <MessageInput onSendMessage={onSendMessage} />
  </div>
)

export default ChatArea
