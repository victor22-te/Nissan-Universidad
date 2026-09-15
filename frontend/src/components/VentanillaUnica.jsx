import React from 'react';
import nissanPhoto from '../assets/nissan_photo.jpg';

export default function VentanillaUnica() {
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
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        padding: '3rem 4rem',
        borderRadius: '16px',
        textAlign: 'center',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animation: 'fadeIn 1s ease-out'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          margin: '0 0 1rem 0',
          fontWeight: '700',
          letterSpacing: '-1px'
        }}>
          Ventanilla Única
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          margin: '0 0 2rem 0',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Portal de servicios integrados de Nissan
        </p>
        <button style={{
          backgroundColor: '#c3002f', // Nissan red
          color: 'white',
          border: 'none',
          padding: '12px 32px',
          fontSize: '1.1rem',
          borderRadius: '30px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'transform 0.2s, background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#a00025'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#c3002f'}
        >
          Ingresar al Portal
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
