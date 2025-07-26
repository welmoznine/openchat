// src/components/chat/ChatHeader.jsx
const ChatHeader = ({ channelName, description, toggleSidebar }) => (

  <div className='px-6 py-3 border-b border-slate-600'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        <div className='md:hidden cursor-pointer' onClick={() => toggleSidebar()}>☰</div>
        <h2 className='ms-5 text-lg md:ms-0'># {channelName}</h2>
        <div className='text-sm text-gray-400'>{description}</div>
      </div>
    </div>
  </div>
)

export default ChatHeader
