import { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { addToast, ToastContainer } = useToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext debe ser usado dentro de un ToastProvider');
  }
  return context;
}
