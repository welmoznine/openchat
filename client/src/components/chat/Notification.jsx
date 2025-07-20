// src/components/chat/Notification.jsx
const Notification = ({ notification, onClose }) => (
  <div className='bg-slate-800 border border-slate-600 rounded-lg p-4 max-w-sm shadow-lg animate-in slide-in-from-right'>
    <div className='flex items-start justify-between'>
      <div className='flex items-start space-x-3'>
        <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0'>
          <span className='text-xs text-white'>💬</span>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='text-sm'>
            <span className='text-blue-400'>{notification.title}</span>
          </div>
          <div className='text-sm text-gray-300 mt-1 line-clamp-2'>
            {notification.message}
          </div>
        </div>
      </div>
      <button
        className='text-gray-400 hover:text-white ml-2 flex-shrink-0'
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  </div>
)

export default Notification
