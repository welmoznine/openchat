import UserProfile from './UserProfile'
import ChannelItem from './Channel'
import DirectMessageItem from './DirectMessageItem'
import OnlineMember from './OnlineMember'
import AddChannelModal from './AddChannelModal'
import StartDMModal from './StartDMModal'
import { useState } from 'react'

const Sidebar = ({
  currentUser,
  channels,
  activeChannel,
  activeDmId,
  onChannelSelect,
  directMessages,
  onDirectMessageSelect,
  onlineMembers,
  onLogout,
  isConnected,
  toggleSidebar,
  onChannelUpdate,
  onStatusChange,
  currentStatus,
  allUsers,
  connectedUsers,
  dmContacts,
  onStartNewDM
}) => {
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [showStartDM, setShowStartDM] = useState(false)

  const handleStartDM = (userId, userInfo) => {
    onStartNewDM(userId, userInfo)
  }

  return (
    <div className='h-screen w-screen bg-slate-900 md:w-64 md:flex md:flex-col'>
      <UserProfile
        user={currentUser}
        onLogout={onLogout}
        isConnected={isConnected}
        toggleSidebar={toggleSidebar}
        currentStatus={currentStatus}
        onStatusChange={onStatusChange}
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
            {showAddChannel && <AddChannelModal showAddChannel={showAddChannel} setShowAddChannel={setShowAddChannel} onChannelUpdate={onChannelUpdate} />}
          </div>
          <div className='space-y-1'>
            {channels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                name={channel.name}
                isActive={activeChannel === channel.id}
                isPrivate={channel.isPrivate}
                unreadCount={channel.unreadCount}
                onChannelUpdate={onChannelUpdate}
                onClick={() => onChannelSelect(channel.id)}
              />
            ))}
          </div>
        </div>

        <div className='px-4 py-2'>
          <div className='flex items-center mb-2'>
            <h3 className='text-xs text-gray-400 uppercase tracking-wide'>
              Direct Messages
            </h3>
            <div
              className='ml-auto cursor-pointer hover:text-gray-500'
              onClick={() => setShowStartDM(true)}
              title='Start new direct message'
            >
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='size-4'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
              </svg>
            </div>
          </div>

          <div className='space-y-1'>
            {/* Existing DM conversations */}
            {dmContacts.map((contact) => {
              const onlineUser = connectedUsers.find(u => u.userId === contact.user.id)
              // const status = onlineUser?.status?.toLowerCase() || 'offline'

              return (
                <DirectMessageItem
                  key={contact.user.id}
                  user={contact.user}
                  unreadCount={contact.unreadCount}
                  onClick={() => onDirectMessageSelect(contact.user.id)}
                  isActive={activeDmId === contact.user.id}
                />
              )
            })}

            {/* Start New DM Button - always show if no conversations exist */}
            {dmContacts.length === 0 && (
              <button
                onClick={() => setShowStartDM(true)}
                className='w-full flex items-center p-2 rounded-md hover:bg-slate-700 transition-colors text-left text-gray-400 hover:text-white'
              >
                <div className='w-8 h-8 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center mr-3'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.5v15m7.5-7.5h-15' />
                  </svg>
                </div>
                <span className='text-sm'>Start a direct message</span>
              </button>
            )}
          </div>

          {/* Start DM Modal */}
          {showStartDM && (
            <StartDMModal
              showModal={showStartDM}
              setShowModal={setShowStartDM}
              allUsers={allUsers}
              connectedUsers={connectedUsers}
              existingContacts={dmContacts}
              onStartDM={handleStartDM}
            />
          )}
        </div>

        <div className='px-4 py-2 border-t border-slate-700 mt-auto'>
          <h3 className='text-xs text-gray-400 uppercase tracking-wide mb-2'>
            Members Online —{' '}
            {onlineMembers.filter((m) => m.status !== 'offline').length}
          </h3>
          <div className='space-y-2'>
            {onlineMembers
              .slice()
              .sort((a, b) => {
                const statusPriority = {
                  online: 1,
                  away: 2,
                  busy: 3,
                  offline: 4
                }
                return statusPriority[a.status] - statusPriority[b.status]
              })
              .map((member) => (
                <OnlineMember key={member.userId} user={member} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
