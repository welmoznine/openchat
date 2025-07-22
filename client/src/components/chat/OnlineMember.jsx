// src/components/chat/OnlineMember.jsx
import Avatar from './Avatar'

const OnlineMember = ({ user }) => (
  <div className='flex items-center space-x-2'>
    <Avatar
      initials={user.initials}
      bgColor={user.bgColor}
      size='w-6 h-6'
      textSize='text-xs'
      status={user.status}
    />
    <div className='flex-1 min-w-0'>
      <div className='text-sm text-white'>
        {user.name}
        {user.statusText && <span className='text-gray-400 text-xs'> ({user.statusText})</span>}
      </div>
    </div>
  </div>
)

export default OnlineMember
