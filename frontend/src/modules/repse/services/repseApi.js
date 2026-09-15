/**
 * Módulo de servicios API para Gestión REPSE.
 * Re-exporta los servicios desde el cliente HTTP base manteniendo cohesión del módulo.
 */
export {
  cuatrimestresAPI,
  contratosAPI,
  objetosAPI,
  beneficiariosAPI,
  empleadosAPI,
  asociacionesAPI,
  reportesAPI,
} from '../../../services/api';
