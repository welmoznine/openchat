import { useEffect, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAddChannel } from '../../hooks/channels/useAddChannel'

/**
 * A modal popover component for adding a new channel.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.showAddChannel - Whether the modal is visible.
 * @param {Function} props.setShowAddChannel - Function to toggle modal visibility.
 *
 * @returns {JSX.Element|null} The rendered modal form or null if not visible.
 */
export default function AddChannelModal ({ showAddChannel, setShowAddChannel, onChannelUpdate }) {
  // State for form inputs
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  // Custom hook to add a new channel
  const { addChannel } = useAddChannel()

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  /**
    * Handles form submission. Prevents page reload,
    * submits the form data, creates new channel, and closes the modal.
    *
    * @param {React.FormEvent} e - The form submit event
    */
  const onSubmit = (e) => {
    e.preventDefault()

    const channelData = {
      name: channelName,
      description: channelDescription,
      isPrivate
    }

    addChannel(channelData).then(() => {
      setShowAddChannel(false)
      setChannelName('')
      setChannelDescription('')
      setIsPrivate(false)
      onChannelUpdate()
    })
  }

  const handleClose = () => {
    setShowAddChannel(false)
    setChannelName('')
    setChannelDescription('')
    setIsPrivate(false)
  }

  if (!showAddChannel) return null

  return (
    <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/20 backdrop-blur-xs'>
      <div className='bg-slate-800 rounded-lg w-full max-w-md mx-4 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-700'>
          <h2 className='text-lg font-semibold text-white'>Add Channel</h2>
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
            <div className='mb-4'>
              <label className='block text-sm font-medium text-white mb-2' htmlFor='channel-name'>
                Name
              </label>
              <input
                id='channel-name'
                type='text'
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                required
                autoComplete='off'
                autoFocus
                placeholder='Enter channel name...'
                className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-white mb-2' htmlFor='channel-description'>
                Description
              </label>
              <input
                id='channel-description'
                type='text'
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
                required
                autoComplete='off'
                placeholder='Enter channel description...'
                className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='flex items-center space-x-2 mb-6'>
              <input
                id='is-private'
                type='checkbox'
                checked={isPrivate}
                onChange={() => setIsPrivate((prev) => !prev)}
                className='h-4 w-4 text-slate-500 bg-slate-600 border-gray-500 focus:ring-slate-500'
              />
              <label htmlFor='is-private' className='text-sm text-white'>
                Private Channel
              </label>
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
                Create Channel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
