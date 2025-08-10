import Avatar from './Avatar'

const OnlineMember = ({ user }) => {
  // Map status to display text
  const statusLabels = {
    away: 'Away',
    busy: 'Busy',
    offline: 'Offline'
  }

  // Only show label if status is one of the above
  const statusLabel = statusLabels[user.status] ? ` (${statusLabels[user.status]})` : ''

  return (
    <div className='flex items-center space-x-2 px-2'>
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
          <span className='text-gray-400 text-xs'>{statusLabel}</span>
        </div>
      </div>
    </div>
  )
}

export default OnlineMember
