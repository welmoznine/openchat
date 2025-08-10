// src/components/chat/ChatHeader.jsx
const ChatHeader = ({ channelName, description, toggleSidebar }) => (

  <div className='px-6 py-3 border-b border-slate-600'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        {/* Hamburger icon for mobile sidebar toggle */}
        <div className='md:hidden cursor-pointer text-white text-2xl' onClick={() => toggleSidebar()}>☰</div>
        <div className='flex flex-col md:flex-row md:items-baseline md:ms-0'> {/* Flex column on mobile, row on desktop */}
          <h2 className='ms-5 text-lg font-bold text-white md:ms-0 md:me-2'># {channelName}</h2> {/* Bold for channel name */}
          <div className='ms-5 text-sm text-gray-400 md:ms-0'>{description}</div> {/* Description below channel name on mobile */}
        </div>
      </div>

    </div>
  </div>
)

export default ChatHeader
