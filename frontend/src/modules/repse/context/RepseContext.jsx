import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cuatrimestresAPI } from '../../../services/api';

const RepseContext = createContext(null);

export function RepseProvider({ children }) {
  const [cuatrimestres, setCuatrimestres] = useState([]);
  const [cuatrimestre, setCuatrimestre] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarCuatrimestres = useCallback(async () => {
    setCargando(true);
    try {
      const data = await cuatrimestresAPI.listar();
      setCuatrimestres(data);
      // Si el cuatrimestre seleccionado ya no existe en la lista, limpiarlo
      setCuatrimestre((prev) => {
        if (!prev) return data.length > 0 ? data[0] : null;
        const sigueExistiendo = data.find((c) => c.id === prev.id);
        return sigueExistiendo || (data.length > 0 ? data[0] : null);
      });
    } catch (error) {
      console.error('Error cargando cuatrimestres en RepseContext:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCuatrimestres();
  }, [cargarCuatrimestres]);

  return (
    <RepseContext.Provider
      value={{
        cuatrimestres,
        cuatrimestre,
        setCuatrimestre,
        cargarCuatrimestres,
        cargando,
      }}
    >
      {children}
    </RepseContext.Provider>
  );
}

export function useRepse() {
  const context = useContext(RepseContext);
  if (!context) {
    throw new Error('useRepse debe usarse dentro de un RepseProvider');
  }
  return context;
}
