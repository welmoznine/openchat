import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

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