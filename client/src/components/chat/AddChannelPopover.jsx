import { useEffect, useState } from 'react'
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
export default function AddChannelPopover ({ showAddChannel, setShowAddChannel }) {
  // State for form inputs
  const [channelName, setChannelName] = useState('')
  const [channelDescription, setChannelDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  // Custom hook to add a new channel
  const { addChannel } = useAddChannel()

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowAddChannel(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [setShowAddChannel])

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

    addChannel(channelData)
    setShowAddChannel(false)
  }

  if (!showAddChannel) return null

  return (
    <div className='fixed inset-0 z-50 flex items-start pt-50 justify-center'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/20 backdrop-blur-xs'
        onClick={() => setShowAddChannel(false)} // <-- wrapped in function
      />
      {/* Modal Content */}
      <div className='relative z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl w-100 py-4 px-6'>
        <h2 className='text-white text-lg mb-4'>Add Channel</h2>
        <form onSubmit={onSubmit}>
          <div>
            <label className='block text-sm font-medium mb-1' htmlFor='channel-name'>
              Name
            </label>
            <input
              id='channel-name'
              type='text'
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              required
              autoComplete='off'
              className='w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring focus:ring-slate-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mt-5 mb-1' htmlFor='channel-name'>
              Description
            </label>
            <input
              id='channel-description'
              type='text'
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              required
              autoComplete='off'
              className='w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring focus:ring-slate-500'
            />
          </div>
          <div className='flex items-center space-x-2 mt-5'>
            <input
              id='is-private'
              type='checkbox'
              checked={isPrivate}
              onChange={() => setIsPrivate((prev) => !prev)}
              className='h-4 w-4 text-slate-500 bg-slate-600 border-gray-500 focus:ring-slate-500'
            />
            <label htmlFor='is-private' className='text-sm'>
              Private Channel
            </label>
          </div>
          <button
            type='submit'
            className='w-full mt-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded'
          >
            Create Channel
          </button>
        </form>
      </div>
    </div>
  )
}
