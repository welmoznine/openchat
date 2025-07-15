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
    <div className="w-screen h-screen bg-slate-900 text-white">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col gap-6 rounded-xl border w-full max-w-md bg-slate-800 border-slate-700">
          <div className="grid px-6 pt-6 text-center">
            <h4 className="text-2xl text-white">Welcome to OpenChat</h4>
            <p className="text-gray-400 text-sm">Sign in to your account to start chatting</p>
          </div>
          <div className="px-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="flex font-medium select-none my-1 text-sm" htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  className="flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none md:text-sm bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="flex font-medium select-none my-1 text-sm" htmlFor="password">Password</label>
                <input 
                  type="password" 
                  className="flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none md:text-sm bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  />
              </div>
              <button 
                type="submit"
                className={`my-5 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none focus-visible:border-ring
                  h-9 px-4 py-2 w-full bg-blue-600 hover:bg-blue-700 text-white`}>
                Sign In
              </button>
            </form>
            <div className="space-y-2 mb-4 text-center">
              {message && <p>{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;