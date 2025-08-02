// src/components/chat/Channel.jsx
import { EllipsisHorizontalIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'

const Channel = ({ name, isActive = false, isPrivate, unreadCount = 0, onClick }) => {
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const channelmenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside (e) {
      if (channelmenuRef.current && !channelmenuRef.current.contains(e.target)) {
        setShowChannelMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <div className={`flex items-center justify-between group px-2 py-1 rounded cursor-pointer hover:bg-slate-700 ${
            isActive ? 'bg-slate-800 text-white font-semibold' : 'text-gray-300'
          }`}
      >
        <div
          className='flex-1'
          onClick={onClick}
        >
          <div className='flex items-center space-x-2'>
            <span className='text-gray-400'>#</span>
            <span className='text-sm'>{name}</span>
            {isPrivate && (
              <span title='Private Channel'>
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='size-3'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z' />
                </svg>
              </span>)}
          </div>
        </div>
        <div className='flex' ref={channelmenuRef}>
          <EllipsisHorizontalIcon
            onClick={() => setShowChannelMenu((prev) => !prev)}
            className='h-6 w-6 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer'
          />
          {unreadCount > 0 && (
            <div className='bg-red-500 text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center text-white'>
              {unreadCount}
            </div>
          )}
        </div>
      </div>
      <div>
        {showChannelMenu &&
          <div className='absolute right-2 w-40 rounded-md shadow-lg bg-slate-800 text-white ring-1 ring-slate-600 ring-opacity-5 z-50'>
            <div className='py-1 text-sm text-gray-700'>
              <button className='flex block px-4 py-2 w-full text-left text-red-500 hover:bg-slate-700 cursor-pointer'>
                <TrashIcon className='h-5 w-5' />
                <div className='ms-2'>Delete</div>
              </button>
            </div>
          </div>}
      </div>
    </>
  )
}

export default Channel
