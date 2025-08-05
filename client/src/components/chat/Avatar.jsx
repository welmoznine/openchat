// src/components/chat/Avatar.jsx
const Avatar = ({ initials, bgColor, size = 'w-8 h-8', textSize = 'text-sm', showStatus = true, status = 'online', onClick, handleBlur }) => {
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-500'
  }

  const normalizedStatus = status.toLowerCase()
  const statusSize = size === 'w-6 h-6' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <div
      className='relative flex-shrink-0 cursor-pointer'
      onClick={onClick}
      onBlur={handleBlur}
    >
      <div className={`${size} ${bgColor} rounded-full flex items-center justify-center`}>
        <span className={`${textSize} text-white`}>{initials}</span>
      </div>
      {showStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${statusSize} ${statusColors[normalizedStatus]} border border-slate-900 rounded-full`} />
      )}
    </div>
  )
}

export default Avatar
