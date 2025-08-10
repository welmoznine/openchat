import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLeaveChannel } from '../../hooks/channels/useLeaveChannel'

export default function LeaveChannelModal ({
  channel,
  showLeaveChannel,
  setShowLeaveChannel,
  onChannelUpdate
}) {
  const { leaveChannel } = useLeaveChannel()

  if (!showLeaveChannel) return null

  const onSubmit = (e) => {
    e.preventDefault()

    leaveChannel(channel.id).then(() => {
      setShowLeaveChannel(false)
      onChannelUpdate()
    })
  }

  const handleClose = () => {
    setShowLeaveChannel(false)
  }

  return (
    <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/20 backdrop-blur-xs'>
      <div className='bg-slate-800 rounded-lg w-full max-w-md mx-4 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-700'>
          <h2 className='text-lg font-semibold text-red-400'>Leave Channel</h2>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-4'>
          <form onSubmit={onSubmit}>
            <div className='text-gray-300 mb-6'>
              Are you sure you want to leave <span className='font-medium text-white'>#{channel?.name}</span>?
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
                className='px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded transition-colors'
              >
                Leave Channel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
