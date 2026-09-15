import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VentanillaUnica from './components/VentanillaUnica';
import { ToastProvider } from './shared/context/ToastContext';
import './index.css';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VentanillaUnica />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
