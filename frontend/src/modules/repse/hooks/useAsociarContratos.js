import { useState, useEffect, useCallback } from 'react';
import {
  contratosAPI,
  objetosAPI,
  beneficiariosAPI,
  empleadosAPI,
  asociacionesAPI,
} from '../../../services/api';
import { useToastContext } from '../../../shared/context/ToastContext';
import { useRepse } from '../context/RepseContext';

export function useAsociarContratos() {
  const { cuatrimestre } = useRepse();
  const { addToast } = useToastContext();

  const [contratos, setContratos] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [selContrato, setSelContrato] = useState(null);
  const [modal, setModal] = useState(null); // 'objeto' | 'beneficiario' | 'empleado'
  const [modoEmp, setModoEmp] = useState('manual');
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    if (!cuatrimestre) return;
    setCargando(true);
    try {
      const [resContratos, resObjetos, resBenef, resEmp] = await Promise.all([
        contratosAPI.listar(cuatrimestre.id),
        objetosAPI.listar(cuatrimestre.id),
        beneficiariosAPI.listar(cuatrimestre.id),
        empleadosAPI.listar(cuatrimestre.id),
      ]);
      setContratos(resContratos);
      setObjetos(resObjetos);
      setBeneficiarios(resBenef);
      setEmpleados(resEmp);
    } catch (error) {
      console.error('Error cargando datos de asociación:', error);
      addToast('Error al cargar datos de asociaciones', 'error');
    } finally {
      setCargando(false);
    }
  }, [cuatrimestre, addToast]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirModal = (tipo, contrato) => {
    setSelContrato(contrato);
    setModal(tipo);
  };

  const cerrarModal = () => {
    setModal(null);
  };

  const asociarObjeto = async (objetoId) => {
    if (!selContrato) return;
    try {
      await asociacionesAPI.asociarObjeto({
        contrato_id: selContrato.id,
        objeto_contable_id: objetoId,
      });
      addToast('Objeto asociado');
      cargar();
      cerrarModal();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const asociarBeneficiario = async (beneficiarioId) => {
    if (!selContrato) return;
    try {
      await asociacionesAPI.asociarBeneficiario({
        contrato_id: selContrato.id,
        beneficiario_id: beneficiarioId,
      });
      addToast('Beneficiario asociado');
      cargar();
      cerrarModal();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const asociarEmpleado = async (empleadoId) => {
    if (!selContrato) return;
    try {
      await asociacionesAPI.asociarEmpleado({
        contrato_id: selContrato.id,
        empleado_id: empleadoId,
        modo: modoEmp,
      });
      addToast('Empleado asociado');
      cargar();
      cerrarModal();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  return {
    cuatrimestre,
    contratos,
    objetos,
    beneficiarios,
    empleados,
    selContrato,
    modal,
    modoEmp,
    setModoEmp,
    cargando,
    abrirModal,
    cerrarModal,
    asociarObjeto,
    asociarBeneficiario,
    asociarEmpleado,
  };
}
