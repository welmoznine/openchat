// src/components/SettingsMenu.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function SettingsMenu ({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='relative' ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='p-2 rounded-full hover:bg-gray-100'
      >
        <Cog6ToothIcon className='h-6 w-6 text-gray-600' />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-44 bg-slate-800 shadow-lg rounded-lg z-50 border border-slate-600'>
          <button
            onClick={() => {
              setIsOpen(false)
            }}
            className='w-full text-left px-4 py-2 text-sm hover:bg-slate-700'
          >
            Settings
          </button>
          <button
            onClick={onLogout}
            className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-700'
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
