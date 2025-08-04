import { useState } from 'react'
import Avatar from './Avatar'
import { TrashIcon } from '@heroicons/react/24/outline'
import DeleteMessageModal from './DeleteMessageModal'

const Message = ({ message, onDeleteMessage, socket }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteMessageModal, setShowDeleteMessageModal] = useState(false)

  const handleDeleteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteMessageModal(true)
  }

  const handleConfirmDelete = async () => {
    if (isDeleting) return

    try {
      setIsDeleting(true)
      await onDeleteMessage(message.id)
      setShowDeleteMessageModal(false)
    } catch (error) {
    } finally {
      setIsDeleting(false)
    }
  }

  if (message.isSystem) {
    return (
      <div className='flex space-x-3 px-2 py-1'>
        <div className='w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0'>
          <span className='text-sm text-white'>ℹ️</span>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='text-gray-300 italic text-sm'>
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex space-x-3 hover:bg-slate-600 hover:bg-opacity-30 px-2 py-1 rounded ${
        message.isOwn ? 'bg-slate-600 bg-opacity-20' : ''
      } ${isDeleting ? 'opacity-50' : ''}`}
    >
      <Avatar
        initials={message.user.initials}
        bgColor={message.user.bgColor}
        size='w-10 h-10'
        showStatus={false}
      />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between mb-1'>
          <div className='flex items-baseline space-x-2'>
            <span className={`font-medium ${message.isOwn ? 'text-blue-300' : 'text-white'}`}>
              {message.user.name}
            </span>
            <span className='text-xs text-gray-400'>
              {message.timestamp}
            </span>
          </div>

          {message.isOwn && (
            <div className='flex space-x-2 items-center'>
              <button
                type='button'
                onClick={handleDeleteClick}
                className='text-gray-400 hover:text-red-400'
                title='Delete message'
              >
                <TrashIcon className='h-4 w-4' />
              </button>
            </div>
          )}
        </div>

        <div className='text-gray-200 break-words'>
          {message.content}
        </div>
      </div>

      <DeleteMessageModal
        message={message}
        showDeleteMessage={showDeleteMessageModal}
        setShowDeleteMessage={setShowDeleteMessageModal}
        onMessageUpdate={handleConfirmDelete}
        socket={socket}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default Message
