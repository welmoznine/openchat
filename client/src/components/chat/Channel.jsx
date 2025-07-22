// src/components/chat/Channel.jsx
const Channel = ({ name, isActive = false, unreadCount = 0, onClick }) => (
  <div
    className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-slate-700 ${
      isActive ? 'bg-slate-700 text-white' : 'text-gray-300'
    }`}
    onClick={onClick}
  >
    <div className='flex items-center space-x-2'>
      <span className='text-gray-400'>#</span>
      <span className='text-sm'>{name}</span>
    </div>
    {unreadCount > 0 && (
      <div className='bg-red-500 text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center text-white'>
        {unreadCount}
      </div>
    )}
  </div>
)

export default Channel
