import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // TODO: Need to add token validity check
  // TODO: Need to redirect from login page if user already logged in

  const handleLogin = async(e) => {
    e.preventDefault();

    try {

      const resp = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password}),
      });

      const data = await resp.json();

      if (resp.ok) {
        setMessage('Login successful!');
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        setMessage(data.message || 'Login failed.');
      }
      
    } catch (error) {
      console.error(error);
      setMessage('An error occurred');
    }

  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login Page</h2>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default LoginPage;