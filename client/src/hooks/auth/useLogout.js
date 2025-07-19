import { useNavigate } from 'react-router-dom'

/**
 * useLogout is a custom React hook that provides a reusable logout function.
 *
 * Functionality:
 * - Removes the JWT token from localStorage.
 * - Redirects the user to the `/login` page using React Router's `navigate`.
 * - Intended for use in any component where logout functionality is needed.
 *
 * Returns:
 * - A `logout` function that can be called to perform the logout process.
 *
 * Usage:
 * const logout = useLogout();
 * logout(); // Logs the user out and redirects to login
 */
export const useLogout = () => {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return logout
}
