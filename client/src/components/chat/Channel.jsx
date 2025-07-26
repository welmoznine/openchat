// src/components/chat/Channel.jsx
const Channel = ({ name, isActive = false, isPrivate, unreadCount = 0, onClick }) => (
  <div
    className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-slate-700 ${
      isActive ? 'bg-slate-700 text-white' : 'text-gray-300'
    }`}
    onClick={onClick}
  >
    <div className='flex items-center space-x-2'>
      <span className='text-gray-400'>#</span>
      <span className='text-sm'>{name}</span>
      { isPrivate && (<span title="Private Channel">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </span>)}
    </div>
    {unreadCount > 0 && (
      <div className='bg-red-500 text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center text-white'>
        {unreadCount}
      </div>
    )}
  </div>
)

export default Channel
