// src/components/chat/UserProfile.jsx
import { useState, useRef } from 'react'
import Avatar from './Avatar'

const UserProfile = ({ user, onLogout, isConnected }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev)
  }

  const handleBlur = (e) => {
    if (!dropdownRef.current?.contains(e.relatedTarget)) {
      setMenuOpen(false)
    }
  }

  const handleSettings = () => {
    setMenuOpen(false)
  }

  return (
    <div className='p-4 border-b border-slate-700 relative'>
      <div className='flex items-center space-x-3'>
        <Avatar
          initials={user.initials}
          bgColor={user.bgColor}
          status={user.status}
        />
        <div className='flex-1'>
          <div className='text-sm'>{user.name}</div>
          <div className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? '● Online' : '● Offline'}
          </div>
        </div>
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={handleToggleMenu}
            onBlur={handleBlur}
            className='inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:bg-accent dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 px-2.5 text-gray-400 hover:text-white'
            title='Menu'
          >
            ☰
          </button>
          {menuOpen && (
            <div className='absolute top-full right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 w-40 py-1'>
              <button
                onClick={handleSettings}
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
      </div>
    </div>
  )
}

export default UserProfile
