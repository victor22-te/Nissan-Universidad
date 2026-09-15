import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import nissanPhoto from '../assets/nissan_photo.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        navigate('/app');
      } else {
        setError('Email o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
    }
  };

  return (
    <div style={{
      backgroundImage: `url(${nissanPhoto})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: '"Inter", "Roboto", sans-serif',
    }}>
      <form onSubmit={handleLogin} style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        padding: '3rem 4rem',
        borderRadius: '16px',
        textAlign: 'center',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animation: 'fadeIn 1s ease-out',
        width: '400px',
        maxWidth: '90%'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 0.5rem 0',
          fontWeight: '700',
          letterSpacing: '-1px'
        }}>
          Nissan Universidad
        </h1>
        <p style={{ 
          fontSize: '1rem', 
          margin: '0 0 2rem 0',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Inicio de Sesión
        </p>
        
        {error && <div style={{ color: '#ff4d4f', marginBottom: '1rem' }}>{error}</div>}

        <input 
          type="email" 
          placeholder="Correo Electrónico" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white', fontSize: '1rem', boxSizing: 'border-box'
          }}
        />
        
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%', padding: '12px', marginBottom: '2rem', borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white', fontSize: '1rem', boxSizing: 'border-box'
          }}
        />

        <button type="submit" style={{
          backgroundColor: '#c3002f', // Nissan red
          color: 'white',
          border: 'none',
          padding: '12px 32px',
          fontSize: '1.1rem',
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: '600',
          width: '100%',
          transition: 'transform 0.2s, background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#a00025'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#c3002f'}
        >
          Ingresar al Portal
        </button>
      </form>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
