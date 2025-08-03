// src/components/chat/Channel.jsx
import { EllipsisHorizontalIcon, TrashIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'
import AddMemberModal from './AddMemberModal'
import LeaveChannelModal from './LeaveChannelModal'
import DeleteChannelModal from './DeleteChannelModal'

const Channel = ({ channel, name, isActive = false, isPrivate, unreadCount = 0, onClick, onChannelUpdate }) => {
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showDeleteChannel, setShowDeleteChannel] = useState(false)
  const [showLeaveChannel, setShowLeaveChannel] = useState(false)
  const channelmenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside (e) {
      if (channelmenuRef.current && !channelmenuRef.current.contains(e.target)) {
        setShowChannelMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <>
      <div className={`flex items-center justify-between group  rounded cursor-pointer hover:bg-slate-700 ${
            isActive ? 'bg-slate-800 text-white font-semibold' : 'text-gray-300'
          }`}
      >
        <div
          className='flex-1 px-2 py-1'
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
        <div className='flex pe-2' ref={channelmenuRef}>
          <EllipsisHorizontalIcon
            onMouseDown={(e) => {
              e.stopPropagation() // Prevents bubbling to the document
              setShowChannelMenu((prev) => !prev)
            }}
            className='h-6 w-6 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer'
          />
          {unreadCount > 0 && (
            <div className='bg-red-500 text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center text-white'>
              {unreadCount}
            </div>
          )}
          <div>
            {showChannelMenu &&
              <div className='absolute mt-4 right-2 w-40 rounded-md shadow-lg bg-slate-800 text-white ring-1 ring-slate-600 ring-opacity-5 z-50'>
                <div className='py-1 text-sm'>
                  {isPrivate && (
                    <div>
                      <button
                        onClick={() => setShowAddMember(true)}
                        className='flex px-4 py-2 w-full text-gray-300 hover:bg-slate-700 cursor-pointer'
                      >
                        <UserPlusIcon className='h-5 w-5' />
                        <div className='ms-2'>Add Member</div>
                      </button>
                      <button
                        onClick={() => setShowLeaveChannel(true)}
                        className='flex block px-4 py-2 w-full text-left text-gray-300 hover:bg-slate-700 cursor-pointer'
                      >
                        <UserMinusIcon className='h-5 w-5' />
                        <div className='ms-2'>Leave Channel</div>
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowDeleteChannel(true)}
                    className='flex block px-4 py-2 w-full text-left text-red-500 hover:bg-slate-700 cursor-pointer'
                  >
                    <TrashIcon className='h-5 w-5' />
                    <div className='ms-2'>Delete</div>
                  </button>
                </div>
              </div>}
          </div>
        </div>
      </div>
      {showAddMember && <AddMemberModal channel={channel} showAddMember={showAddMember} setShowAddMember={setShowAddMember} onChannelUpdate={onChannelUpdate} />}
      {showDeleteChannel && <DeleteChannelModal channel={channel} showDeleteChannel={showDeleteChannel} setShowDeleteChannel={setShowDeleteChannel} onChannelUpdate={onChannelUpdate} />}
      {showLeaveChannel && <LeaveChannelModal channel={channel} showLeaveChannel={showLeaveChannel} setShowLeaveChannel={setShowLeaveChannel} onChannelUpdate={onChannelUpdate} />}
    </>
  )
}

export default Channel
