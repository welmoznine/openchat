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

  return (
    <div className='fixed inset-0 z-50 flex items-start pt-65 justify-center text-sm'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/20 backdrop-blur-xs'
        onClick={() => setShowDeleteMessage(false)}
      />
      {/* Modal Content */}
      <div className='relative z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl w-100 py-4 px-6'>
        <h2 className='text-lg mb-4 text-red-400'>Delete Message</h2>

        {error && (
          <div className='mb-4 p-2 bg-red-900 border border-red-700 rounded text-red-200 text-sm'>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className='text-gray-300 mb-4'>
            Are you sure you want to delete this message?
            <div className='mt-2 p-2 bg-slate-700 rounded text-sm italic'>
              "{message.content}"
            </div>
          </div>
          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={() => setShowDeleteMessage(false)}
              className='mt-5 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded cursor-pointer'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='mt-5 bg-red-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded cursor-pointer disabled:opacity-50'
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
