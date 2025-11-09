import React, { useState, useEffect } from 'react'
import Login from './pages/Login'
import Market from './pages/Market'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('bm_token'));
  const [userId, setUserId] = useState(localStorage.getItem('bm_user'));
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('bm_user_data') || 'null'));
  // base URL for API calls; can be set via Vite env VITE_API_BASE
  const apiBase = import.meta.env.VITE_API_BASE || 'https://server-blackmarket.onrender.com/';

  useEffect(()=>{
    setToken(localStorage.getItem('bm_token'));
    setUserId(localStorage.getItem('bm_user'));
  },[]);

  // Manejar rutas como /auth/callback para SPA (React Router no está presente, así que redirige a Login si no hay token)
  useEffect(() => {
    if (!token && window.location.pathname.startsWith('/auth/callback')) {
      // Permitir que Login.jsx maneje el callback
      return;
    }
    if (!token && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }, [token]);

  const onLogin = ({ token, userId, username, discriminator, avatar }) => {
    localStorage.setItem('bm_token', token);
    localStorage.setItem('bm_user', userId);
    const userData = { username, discriminator, avatar };
    localStorage.setItem('bm_user_data', JSON.stringify(userData));
    setToken(token);
    setUserId(userId);
    setUserData(userData);
  }
  const onLogout = () => {
    localStorage.removeItem('bm_token');
    localStorage.removeItem('bm_user');
    localStorage.removeItem('bm_user_data');
    setToken(null);
    setUserId(null);
    setUserData(null);
    window.userData = null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {!token ? (
        <Login apiBase={apiBase} onLogin={onLogin} />
      ) : (
        <Market 
          apiBase={apiBase} 
          token={token} 
          userId={userId} 
          userData={userData}
          onLogout={onLogout} 
        />
      )}
    </div>
  )
}
