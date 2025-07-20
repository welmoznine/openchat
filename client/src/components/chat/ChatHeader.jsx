// src/components/chat/ChatHeader.jsx
const ChatHeader = ({ channelName, description }) => (
  <div className='px-6 py-3 border-b border-slate-600'>
    <div className='flex items-center justify-between'>
      <div>
        <h2 className='text-lg'># {channelName}</h2>
        <div className='text-sm text-gray-400'>{description}</div>
      </div>
    </div>
  </div>
)

export default ChatHeader
