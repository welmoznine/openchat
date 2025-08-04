import { useLeaveChannel } from '../../hooks/channels/useLeaveChannel'

export default function LeaveChannelModal ({ channel, showLeaveChannel, setShowLeaveChannel, onChannelUpdate }) {
  const { leaveChannel } = useLeaveChannel()

  if (!showLeaveChannel) return null

  const onSubmit = (e) => {
    e.preventDefault()

    leaveChannel(channel.id).then(() => {
      setShowLeaveChannel(false)
      onChannelUpdate()
    })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-start pt-65 justify-center text-sm'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/20 backdrop-blur-xs'
        onClick={() => setShowLeaveChannel(false)} // <-- wrapped in function
      />
      {/* Modal Content */}
      <div className='relative z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl w-100 py-4 px-6'>
        <h2 className='text-lg mb-4 text-red-400'>Leave Channel</h2>
        <form onSubmit={onSubmit}>
          <div className='text-gray-300'>Are you sure you want to leave this channel?</div>
          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={() => setShowLeaveChannel(false)}
              className='mt-5 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded cursor-pointer'
            >
              Cancel
            </button>
            <button
              type='submit'
              className=' mt-5 bg-red-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded cursor-pointer'
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
