import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAddChannelMember } from '../../hooks/channels/useAddChannelMember'

export default function AddMemberModal ({
  channel,
  showAddMember,
  setShowAddMember,
  onChannelUpdate
}) {
  const [memberName, setMemberName] = useState('')
  const { addChannelMember } = useAddChannelMember()

  if (!showAddMember) return null

  const onSubmit = (e) => {
    e.preventDefault()

    addChannelMember(channel.id, memberName).then(() => {
      setShowAddMember(false)
      setMemberName('') // Clear input
      onChannelUpdate()
    })
  }

  const handleClose = () => {
    setShowAddMember(false)
    setMemberName('') // Clear input on close
  }

  return (
    <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/20 backdrop-blur-xs'>
      <div className='bg-slate-800 rounded-lg w-full max-w-md mx-4 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-700'>
          <h2 className='text-lg font-semibold text-white'>Add Member</h2>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-4'>
          <div className='text-gray-300 mb-4'>
            Add a new member to <span className='font-medium text-white'>#{channel?.name}</span>
          </div>

          <form onSubmit={onSubmit}>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-white mb-2' htmlFor='member-name'>
                Username
              </label>
              <input
                id='member-name'
                type='text'
                required
                autoComplete='off'
                autoFocus
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder='Enter username...'
                className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={handleClose}
                className='px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded transition-colors'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors'
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
