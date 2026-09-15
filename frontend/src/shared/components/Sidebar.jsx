import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, LayoutGrid, Settings, Sun, Moon
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/nissan-logo.svg" alt="Nissan Logo" />
          <h1>Nissan Universidad</h1>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-title">Modulos</div>
        <NavLink to="/app" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard /> Inicio
        </NavLink>
        <NavLink to="/app/ventanilla-unica" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText /> Ventanilla Única
        </NavLink>
        <NavLink to="/app/status-vehiculo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutGrid /> Status Vehículo
        </NavLink>

        <div className="nav-section-title">Sistema</div>
        <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="nav-item text-red-500">
          Cerrar Sesión
        </button>

        <div className="sidebar-footer">
          <button 
            className="nav-item sidebar-theme-toggle" 
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
        </div>
      </nav>
    </aside>
  );
}
