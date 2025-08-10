import { useState, useEffect } from 'react'
import { generateUserInitials, generateUserColor } from '../../utils/chatUtils.js'

const StartDMModal = ({
  showModal,
  setShowModal,
  allUsers,
  connectedUsers,
  onStartDM,
  existingContacts = []
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])

  // Filter users based on search term
  useEffect(() => {
    if (!allUsers) return

    const filtered = allUsers.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [allUsers, searchTerm])

  // Get user online status
  const getUserStatus = (userId) => {
    const onlineUser = connectedUsers.find(u => u.userId === userId)
    return onlineUser?.status?.toLowerCase() || 'offline'
  }

  const handleStartDM = (user) => {
    onStartDM(user.id, user)
    setShowModal(false)
    setSearchTerm('')
  }

  const handleClose = () => {
    setShowModal(false)
    setSearchTerm('')
  }

  if (!showModal) return null

  return (
    <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/20 backdrop-blur-xs'>
      <div className='bg-slate-800 rounded-lg w-full max-w-md mx-4 max-h-96 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-700'>
          <h2 className='text-lg font-semibold text-white'>Start Direct Message</h2>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className='p-4'>
          <input
            type='text'
            placeholder='Search users...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
            autoFocus
          />
        </div>

        {/* Users List */}
        <div className='flex-1 overflow-y-auto px-4 pb-4'>
          {filteredUsers.length === 0
            ? (
              <div className='text-center text-gray-400 py-4'>
                {searchTerm
                  ? 'No users found'
                  : 'No users available'}
              </div>)
            : (
              <div className='space-y-1'>
                {filteredUsers.map((user) => {
                  const status = getUserStatus(user.id)
                  const userInitials = generateUserInitials(user.username)
                  const userBgColor = generateUserColor(user.username)

                  return (
                    <button
                      key={user.id}
                      onClick={() => handleStartDM(user)}
                      className='w-full flex items-center p-2 rounded-md hover:bg-slate-700 transition-colors text-left'
                    >
                      {/* User Avatar with consistent styling */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${userBgColor}`}>
                        {userInitials}
                      </div>

                      {/* User Info */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='text-white font-medium truncate'>
                            {user.username}
                          </span>
                        </div>

                        {/* Status */}
                        <div className='flex items-center gap-1 mt-0.5'>
                          <div className={`w-2 h-2 rounded-full ${
                          status === 'online'
                          ? 'bg-green-500'
                          : status === 'away'
                          ? 'bg-yellow-500'
                          : status === 'busy'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                        }`}
                          />
                          <span className='text-xs text-gray-400 capitalize'>
                            {status}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                      </svg>
                    </button>
                  )
                })}
              </div>
              )}
        </div>
      </div>
    </div>
  )
}

export default StartDMModal
