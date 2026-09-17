import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import nissanPhoto from '../../assets/nissan_photo.jpg';
import styles from './Login.module.css';

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
    <div 
      className={styles.loginContainer}
      style={{ backgroundImage: `url(${nissanPhoto})` }}
    >
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <h1 className={styles.loginTitle}>Nissan Universidad</h1>
        <p className={styles.loginSubtitle}>Inicio de Sesión</p>
        
        {error && <div className={styles.loginError}>{error}</div>}

        <input 
          type="email" 
          placeholder="Correo Electrónico" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.loginInput}
        />
        
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={`${styles.loginInput} ${styles.loginInputLast}`}
        />

        <button type="submit" className={styles.loginButton}>
          Ingresar al Portal
        </button>
      </form>
    </div>
  );
}
