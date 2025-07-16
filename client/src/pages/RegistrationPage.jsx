import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { isAuthenticated } from '../utils/auth'

/**
 * RegistrationPage component allows users to create a new account by
 * providing a username, email, password, and confirming the password.
 *
 * On mount, it checks if the user is already authenticated by verifying
 * the stored token via the `isAuthenticated` utility function.
 * If authenticated, it redirects the user to the main page (`/`).
 * Otherwise, it renders the registration form.
 *
 * Handles user registration by sending the form data to the
 * `/api/auth/register` endpoint. On successful registration,
 * saves the received token in localStorage and redirects to `/`.
 *
 * Displays status messages for validation errors, registration success,
 * failure, and other errors.
 *
 * @component
 * @returns {JSX.Element} The registration form UI or a blank div while loading auth status.
 */
const RegistrationPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Welcome to OpenChat'

    // Checking if user is authenticated already, redirect if so
    async function checkAuth () {
      const isAuth = await isAuthenticated()
      if (isAuth) {
        navigate('/')
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  const handleRegistration = async (e) => {
    e.preventDefault()

    try {
      if (password !== confirmPassword) {
        setMessage('Passwords do not match.')
        return
      }

      const resp = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      })

      const data = await resp.json()

      if (resp.ok) {
        setMessage('Account created!')
        localStorage.setItem('token', data.token)
        navigate('/')
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      console.error(error)
      setMessage('An error occurred')
    }
  }

  if (loading) {
    return <div />
  }

  return (
    <div className='w-screen h-screen bg-slate-900 text-white'>
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='flex flex-col gap-6 rounded-xl border w-full max-w-md bg-slate-800 border-slate-700'>
          <div className='grid px-6 pt-6 text-center'>
            <h4 className='text-2xl text-white'>Sign Up</h4>
            <p className='text-gray-400 text-sm my-1'>Create an account to start chatting</p>
          </div>
          <div className='px-6'>
            <form onSubmit={handleRegistration} className='space-y-4'>
              <div className='space-y-2'>
                <label className='flex font-medium select-none my-1 text-sm' htmlFor='username'>Username</label>
                <input
                  type='text'
                  className='flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none md:text-sm bg-slate-700 border-slate-600 text-white placeholder-gray-500 placeholder:text-xs'
                  placeholder='Enter your username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <label className='flex font-medium select-none my-1 text-sm' htmlFor='email'>Email Address</label>
                <input
                  type='email'
                  className='flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none md:text-sm bg-slate-700 border-slate-600 text-white placeholder-gray-500 placeholder:text-xs'
                  placeholder='example@email.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <label className='flex font-medium select-none my-1 text-sm' htmlFor='password'>Password</label>
                <input
                  type='password'
                  className='flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none md:text-sm bg-slate-700 border-slate-600 text-white placeholder-gray-500 placeholder:text-xs'
                  placeholder='Enter your password (6+ characters)'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className='space-y-2'>
                <label className='flex font-medium select-none my-1 text-sm' htmlFor='confirm-password'>Confirm Password</label>
                <input
                  type='password'
                  className='flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none md:text-sm bg-slate-700 border-slate-600 text-white placeholder-gray-500 placeholder:text-xs'
                  placeholder='Re-enter your password'
                  value={confirmPassword}
                  minLength={6}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type='submit'
                className={`my-5 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none focus-visible:border-ring
                  h-9 px-4 py-2 w-full bg-blue-600 hover:bg-blue-700 text-white placeholder:text-xs`}
              >
                Sign Up
              </button>
            </form>
            <div className='space-y-2 mb-4 text-center text-sm text-rose-400'>
              {message && <p>{message}</p>}
            </div>
            <div className='space-y-2 mb-4 text-center text-slate-400 text-sm'>
              <span>Already have an account? <Link className='font-medium text-blue-400 hover:text-blue-300 underline' to='/login'>Sign In</Link></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationPage
