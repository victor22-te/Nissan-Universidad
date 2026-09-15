import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import VentanillaUnicaPage from './pages/VentanillaUnicaPage';
import StatusVehiculoPage from './pages/StatusVehiculoPage';
import Sidebar from './shared/components/Sidebar';
import { ToastProvider } from './shared/context/ToastContext';
import './index.css';
import './App.css';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/app" replace />} />
          
          <Route path="/app" element={<ProtectedRoute />}>
            <Route index element={
              <div style={{ padding: '2rem' }}>
                <h2>Bienvenido a Nissan Universidad</h2>
                <p>Selecciona un módulo en el menú lateral.</p>
              </div>
            } />
            <Route path="ventanilla-unica" element={<VentanillaUnicaPage />} />
            <Route path="status-vehiculo" element={<StatusVehiculoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
