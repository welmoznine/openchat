import { useState } from 'react'
import { useAddChannelMember } from '../../hooks/channels/useAddChannelMember'

export default function AddMemberModal ({ channel, showAddMember, setShowAddMember, onChannelUpdate }) {
  const [memberName, setMemberName] = useState('')
  const { addChannelMember } = useAddChannelMember()

  if (!showAddMember) return null

  const onSubmit = (e) => {
    e.preventDefault()

    addChannelMember(channel.id, memberName).then(() => {
      setShowAddMember(false)
      onChannelUpdate()
    })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-start pt-65 justify-center text-sm'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/20 backdrop-blur-xs'
        onClick={() => setShowAddMember(false)} // <-- wrapped in function
      />
      {/* Modal Content */}
      <div className='relative z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl w-100 py-4 px-6'>
        <h2 className='text-lg mb-4 text-gray-300'>Add a Member</h2>
        <form onSubmit={onSubmit}>
          <div className='text-gray-300' />
          <label className='block text-sm font-medium mt-5 mb-1' htmlFor='channel-name'>
            Who would you like to add to this channel?
          </label>
          <input
            id='channel-description'
            type='text'
            required
            autoComplete='off'
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            className='w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring focus:ring-slate-500'
          />
          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={() => setShowAddMember(false)}
              className='mt-5 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded cursor-pointer'
            >
              Cancel
            </button>
            <button
              type='submit'
              className=' mt-5 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded cursor-pointer'
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
