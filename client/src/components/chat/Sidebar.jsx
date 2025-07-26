// src/components/chat/Sidebar.jsx
import UserProfile from './UserProfile'
import ChannelItem from './Channel'
import DirectMessageItem from './DirectMessageItem'
import OnlineMember from './OnlineMember'
import AddChannelPopover from './AddChannelPopover'
import { useState } from 'react'

const Sidebar = ({
  currentUser,
  channels,
  activeChannel,
  onChannelSelect,
  directMessages,
  onDirectMessageSelect,
  onlineMembers,
  onLogout,
  isConnected,
  toggleSidebar
}) => {
  const [showAddChannel, setShowAddChannel] = useState(false)

  return (
    <div className='h-screen w-screen bg-slate-900 md:w-64 md:flex md:flex-col'>
      <UserProfile
        user={currentUser}
        onLogout={onLogout}
        isConnected={isConnected}
        toggleSidebar={toggleSidebar}
      />

      <div className='flex-1 overflow-y-auto'>
        <div className='relative px-4 py-2'>
          <div className='flex items-center mb-2'>
            <h3 className='text-xs text-gray-400 uppercase tracking-wide'>
              Channels
            </h3>
            <div className='ml-auto cursor-pointer hover:text-gray-500' onClick={() => setShowAddChannel(true)}>
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='size-4'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
              </svg>
            </div>
            {showAddChannel && <AddChannelPopover showAddChannel={showAddChannel} setShowAddChannel={setShowAddChannel} />}
          </div>
          <div />
          <div className='space-y-1'>
            {channels.map((channel) => (
              <ChannelItem
                key={channel.id}
                name={channel.name}
                isActive={activeChannel === channel.name}
                unreadCount={channel.unreadCount}
                onClick={() => onChannelSelect(channel.name)}
              />
            ))}
          </div>
        </div>

        {directMessages.length > 0 && (
          <div className='px-4 py-2'>
            <h3 className='text-xs text-gray-400 uppercase tracking-wide mb-2'>
              Direct Messages
            </h3>
            <div className='space-y-1'>
              {directMessages.map((dm) => (
                <DirectMessageItem
                  key={dm.user.name}
                  user={dm.user}
                  unreadCount={dm.unreadCount}
                  onClick={() => onDirectMessageSelect(dm.user.name)}
                />
              ))}
            </div>
          </div>
        )}

        <div className='px-4 py-2 border-t border-slate-700 mt-auto'>
          <h3 className='text-xs text-gray-400 uppercase tracking-wide mb-2'>
            Members Online —{' '}
            {onlineMembers.filter((m) => m.status === 'online').length}
          </h3>
          <div className='space-y-2'>
            {onlineMembers.map((member) => (
              <OnlineMember key={member.name} user={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
