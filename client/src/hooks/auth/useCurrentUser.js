import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom React hook to fetch and return the currently authenticated user's data.
 *
 * This hook:
 * - Reads the JWT token from localStorage
 * - Sends the token to the backend via a POST request to `/api/auth/me`
 * - Returns user info if the token is valid
 * - Automatically redirects to `/login` if the token is missing or invalid
 *
 * @returns {Object} An object containing:
 *   - user: The user data object (or null if unauthenticated)
 *   - loading: A boolean indicating whether the user data is still being fetched
 *   - error: Any error message encountered during the fetch process
 *
 * @example
 * const { user, loading, error } = useCurrentUser();
 * if (loading) return <LoadingSpinner />;
 * if (!user) return <Navigate to="/login" />;
 * return <p>Hello, {user.username}</p>;
 */
export const useCurrentUser = () => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token){
            setLoading(false);
            navigate('/login'); // Redirect back to login
            return
        }

        fetch('http://localhost:3000/api/auth/me', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(async (res) => {

            if(!res.ok) {
                throw new Error('Invalid or expired token');
            }

            const data = await res.json();
            console.log(data);
            setUser(data);
        })
        .catch((error) => {
            console.error('useCurrentUser error:', error);
            setError(error.message);
            localStorage.removeItem('token');
            navigate('/login'); // Redirect back to login
        })
        .finally(() => {
            setLoading(false);
        });
    }, [navigate]);

    return { user, loading, error };
}