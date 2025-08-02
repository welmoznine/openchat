import { useEffect } from 'react'

export default function DeleteChannelModal ({ channel, showDeleteChannel, setShowDeleteChannel }) {
  if (!showDeleteChannel) return null

  const onSubmit = (e) => {
    e.preventDefault()
    console.log(channel.id)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-start pt-65 justify-center text-sm'>
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/20 backdrop-blur-xs'
        onClick={() => setShowDeleteChannel(false)} // <-- wrapped in function
      />
      {/* Modal Content */}
      <div className='relative z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl w-100 py-4 px-6'>
        <h2 className='text-lg mb-4 text-red-400'>Delete Channel</h2>
        <form onSubmit={onSubmit}>
          <div className='text-gray-300'>Are you sure you want to delete this channel?</div>
          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={() => setShowDeleteChannel(false)}
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
