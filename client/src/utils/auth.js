/**
 * Checks whether the current user is authenticated by validating the token
 * stored in localStorage against the `/api/auth/me` endpoint.
 *
 * @async
 * @function isAuthenticated
 * @returns {Promise<boolean>} Resolves to `true` if the token exists and is valid,
 *                             otherwise `false`.
 *
 * @description
 * - Retrieves the token from localStorage under the key `'token'`.
 * - Sends a GET request to `/api/auth/me` with the token in the `Authorization` header.
 * - If the server responds with a non-OK status or an error occurs, the user is considered unauthenticated.
 */
export async function isAuthenticated () {
  const token = localStorage.getItem('token')
  if (!token) return false

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) return false

    // Success, token is valid, user authenticated
    return true
  } catch {
    return false
  }
}
