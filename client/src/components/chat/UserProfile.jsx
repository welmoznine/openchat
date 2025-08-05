// src/components/chat/UserProfile.jsx
import { useState, useRef, useEffect } from 'react'
import Avatar from './Avatar'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

const statusOptions = [
  { label: 'Online', color: 'bg-green-500' },
  { label: 'Away', color: 'bg-yellow-400' },
  { label: 'Busy', color: 'bg-red-500' },
  { label: 'Offline', color: 'bg-gray-400' }
]

const UserProfile = ({ user, onLogout, isConnected, toggleSidebar, currentStatus = 'Online', onStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false)
        setShowStatusDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const statusObject = statusOptions.find(s => s.label === currentStatus)

  const toggleMenu = () => {
    setMenuOpen(prev => !prev)
    setShowStatusDropdown(false)
  }

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(prev => !prev)
  }

  return (
    <div className='p-4 border-b border-slate-700 relative'>
      <div className='flex items-center space-x-3'>
        <div className='relative'>
          <Avatar
            initials={user.initials}
            bgColor={user.bgColor}
            status={user.status}
            onClick={toggleMenu}
          />

          {/* Dropdown now positioned relative to the avatar */}
          {menuOpen && (
            <div
              ref={dropdownRef}
              className='absolute top-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 w-40 py-1'
            >
              <button
                onClick={toggleStatusDropdown}
                className='w-full flex justify-between items-center px-4 py-2 text-sm hover:bg-slate-700'
              >
                <div className='flex items-center gap-2'>
                  <span className={`h-2 w-2 rounded-full ${statusObject?.color}`} />
                  <span>{currentStatus}</span>
                </div>
                <ChevronRightIcon className={`h-4 w-4 text-gray-300 transition-transform ${showStatusDropdown ? 'rotate-90' : ''}`} />
              </button>

              {showStatusDropdown && (
                <div className='absolute left-full top-0 mt-0 ml-1 w-40 bg-slate-800 border border-slate-600 rounded-lg shadow-md z-50'>
                  {statusOptions.map(option => (
                    <button
                      key={option.label}
                      onClick={() => {
                        console.log('Status changed to:', option.label)
                        onStatusChange(option.label)
                        setShowStatusDropdown(false)
                        setMenuOpen(false)
                      }}
                      className='w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-700'
                    >
                      <span className={`h-2 w-2 rounded-full ${option.color}`} />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              <hr className='border-slate-700 my-1' />
              <button
                onClick={() => {
                  setMenuOpen(false)
                }}
                className='w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700'
              >
                ⚙️ Settings
              </button>
              <button
                onClick={onLogout}
                className='w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700'
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
        <div className='flex-1'>
          <div className='text-sm'>{user.name}</div>
          <div className={`text-xs ${
                currentStatus === 'Online'
            ? 'text-green-400'
                : currentStatus === 'Away'
            ? 'text-yellow-400'
                : currentStatus === 'Busy'
            ? 'text-red-500'
                : 'text-gray-400'
              }`}
          >
            ● {currentStatus}
          </div>
        </div>
        <div className='relative' ref={dropdownRef}>
          <button
            className='md:hidden inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 px-2.5 text-gray-400 hover:text-white'
            title='Menu'
            onClick={() => toggleSidebar()}
          >
            ☰
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
