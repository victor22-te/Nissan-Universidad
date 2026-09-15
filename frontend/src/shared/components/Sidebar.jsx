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
          <img src="/logo.png" alt="Online Fiscal" />
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-title">Modulos</div>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard /> Inicio
        </NavLink>
        <NavLink to="/repse" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText /> Gestion REPSE
        </NavLink>
        <NavLink to="/proyectos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutGrid /> Proyectos
        </NavLink>

        <div className="nav-section-title">Sistema</div>
        <NavLink to="/config" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings /> Configuracion
        </NavLink>

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
