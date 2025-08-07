// src/components/chat/DirectMessageItem.jsx
import Avatar from './Avatar'

const DirectMessageItem = ({ user, unreadCount = 0, onClick, isActive }) => (
  <div
    className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-slate-700 ${
    isActive ? 'bg-slate-800 text-white font-semibold' : 'text-gray-300'
  }`} onClick={onClick}
  >
    <div className='flex items-center space-x-2 min-w-0 flex-1'>
      <Avatar
        initials={user.initials}
        bgColor={user.bgColor}
        size='w-6 h-6'
        textSize='text-xs'
        status={user.status}
      />
      <span className='text-sm text-white truncate'>{user.name}</span>
    </div>
    {unreadCount > 0 && (
      <div className='bg-red-500 text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center text-white flex-shrink-0'>
        {unreadCount}
      </div>
    )}
  </div>
)

export default DirectMessageItem
