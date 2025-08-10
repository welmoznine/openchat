import { XMarkIcon } from '@heroicons/react/24/outline'
import { useDeleteMessages } from '../../hooks/messages/useDeleteMessages'

export default function DeleteMessageModal ({
  message,
  showDeleteMessage,
  setShowDeleteMessage,
  onMessageUpdate,
  socket
}) {
  // Custom hook to delete a message
  const { deleteMessage, loading, error } = useDeleteMessages()

  if (!showDeleteMessage) return null

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      // Determine message type from the message object
      const messageType = message.messageType

      // Call the deleteMessage function with the message ID and type
      await deleteMessage(message.id, messageType)

      // Emit the appropriate delete event based on message type
      if (socket) {
        if (messageType === 'direct_message') {
          socket.emit('delete_direct_message', { messageId: message.id })
        } else {
          socket.emit('delete_message', { messageId: message.id })
        }
      }

      // Close the modal
      setShowDeleteMessage(false)

      if (onMessageUpdate) {
        onMessageUpdate(message.id)
      }
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  const handleClose = () => {
    setShowDeleteMessage(false)
  }

  return (
    <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/20 backdrop-blur-xs'>
      <div className='bg-slate-800 rounded-lg w-full max-w-md mx-4 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-700'>
          <h2 className='text-lg font-semibold text-red-400'>Delete Message</h2>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-4'>
          {error && (
            <div className='mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className='text-gray-300 mb-4'>
              Are you sure you want to delete this message?
              <div className='mt-3 p-3 bg-slate-700 rounded text-sm italic border-l-4 border-slate-600'>
                "{message.content}"
              </div>
            </div>

            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={handleClose}
                className='px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded transition-colors'
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded transition-colors disabled:opacity-50'
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
