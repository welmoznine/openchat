import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

/**
 * ProtectedRoute is a wrapper component that guards its children by verifying user authentication.
 *
 * Functionality:
 * - On mount, it checks for a JWT token in localStorage.
 * - If no token is found, it redirects to the login page.
 * - If a token exists, it makes a request to `/api/auth/me` to validate the token and fetch user info from the server.
 * - If the token is valid, it provides the user object via React context (`UserContext`) to all child components.
 * - If the token is invalid or expired, it clears the token, redirects to login, and does not render the protected content.
 *
 * Returns:
 * - null while loading (optional: can be replaced with a loading spinner)
 * - `<Navigate to="/login" />` if user is not authenticated
 * - `<UserContext.Provider value={user}>{children}</UserContext.Provider>` if authenticated
 *
 * Usage:
 * Wrap routes or components you want to protect like so:
 * 
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        fetch('http://localhost:3000/api/auth/me', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
        },
        })
        .then(res => {
            if (!res.ok) throw new Error('Invalid or expired token');
            return res.json();
        })
        .then(userData => setUser(userData))
        .catch(() => {
            localStorage.removeItem('token');
            setUser(null);
        })
        .finally(() => setLoading(false));
  }, []);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <UserContext.Provider value = {user}>
            {children}
        </UserContext.Provider>
    );
};

export default ProtectedRoute;