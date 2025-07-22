// src/components/chat/Sidebar.jsx
import UserProfile from './UserProfile'
import ChannelItem from './Channel'
import DirectMessageItem from './DirectMessageItem'
import OnlineMember from './OnlineMember'

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
}) => (
  <div className='w-64 bg-slate-900 flex flex-col'>
    <UserProfile
      user={currentUser}
      onLogout={onLogout}
      isConnected={isConnected}
    />

    <div className='flex-1 overflow-y-auto'>
      <div className='px-4 py-2'>
        <h3 className='text-xs text-gray-400 uppercase tracking-wide mb-2'>
          Channels
        </h3>
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

export default Sidebar
