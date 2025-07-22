// src/components/chat/Message.jsx
import Avatar from './Avatar'

const Message = ({ message }) => {
  if (message.isSystem) {
    return (
      <div className='flex space-x-3 px-2 py-1'>
        <div className='w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0'>
          <span className='text-sm text-white'>ℹ️</span>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='text-gray-300 italic text-sm'>
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex space-x-3 hover:bg-slate-600 hover:bg-opacity-30 px-2 py-1 rounded ${
      message.isOwn ? 'bg-slate-600 bg-opacity-20' : ''
    }`}
    >
      <Avatar
        initials={message.user.initials}
        bgColor={message.user.bgColor}
        size='w-10 h-10'
        showStatus={false}
      />
      <div className='flex-1 min-w-0'>
        <div className='flex items-baseline space-x-2 mb-1'>
          <span className={`font-medium ${message.isOwn ? 'text-blue-300' : 'text-white'}`}>
            {message.user.name}
          </span>
          <span className='text-xs text-gray-400'>{message.timestamp}</span>
        </div>
        <div className='text-gray-200 break-words'>
          {message.content}
        </div>
      </div>
    </div>
  )
}

export default Message
