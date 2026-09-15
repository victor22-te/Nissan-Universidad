import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Building2 } from 'lucide-react';
import { objetosAPI } from '../../../services/api';
import Modal from '../../../shared/components/Modal';
import { useRepse } from '../context/RepseContext';
import { useToastContext } from '../../../shared/context/ToastContext';

export default function ObjetosTab(props) {
  const contextRepse = useRepse();
  const contextToast = useToastContext();

  const cuatrimestre = props.cuatrimestre !== undefined ? props.cuatrimestre : contextRepse.cuatrimestre;
  const addToast = props.addToast || contextToast.addToast;

  const [objetos, setObjetos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [editingId, setEditingId] = useState(null);

  const cargar = useCallback(async () => {
    if (!cuatrimestre) return;
    try {
      setObjetos(await objetosAPI.listar(cuatrimestre.id));
    } catch (error) {
      console.error('Error cargando objetos:', error);
    }
  }, [cuatrimestre]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async () => {
    if (!descripcion.trim()) return;
    try {
      if (editingId) {
        await objetosAPI.actualizar(editingId, {
          descripcion,
          cuatrimestre_id: cuatrimestre.id,
        });
        addToast('Objeto contable actualizado');
      } else {
        await objetosAPI.crear({
          descripcion,
          cuatrimestre_id: cuatrimestre.id,
        });
        addToast('Objeto contable registrado');
      }
      setDescripcion('');
      setEditingId(null);
      setShowModal(false);
      cargar();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const editar = (o) => {
    setDescripcion(o.descripcion);
    setEditingId(o.id);
    setShowModal(true);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este objeto contable?')) return;
    try {
      await objetosAPI.eliminar(id);
      addToast('Objeto contable eliminado');
      cargar();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  if (!cuatrimestre) {
    return (
      <div className="empty-state">
        <h4>Selecciona un cuatrimestre</h4>
        <p>Ve a Inicio para elegir un periodo de trabajo</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Objetos Contables</h2>
          <p>{cuatrimestre.nombre} · Servicios u obras especializadas</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setDescripcion('');
            setShowModal(true);
          }}
        >
          <Plus size={16} /> Nuevo Objeto
        </button>
      </div>

      {objetos.length === 0 ? (
        <div className="empty-state">
          <Building2 />
          <h4>Sin objetos contables</h4>
          <p>Registra las actividades o servicios especializados que prestas</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Descripción de la Actividad / Servicio</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {objetos.map((o, i) => (
                <tr key={o.id}>
                  <td>{i + 1}</td>
                  <td className="cell-primary-text">
                    {o.descripcion}
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString('es-MX')}</td>
                  <td>
                    <div className="table-actions-group">
                      <button
                        className="btn-icon btn-icon-primary tooltip"
                        data-tip="Editar"
                        onClick={() => editar(o)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon btn-icon-danger tooltip"
                        data-tip="Eliminar"
                        onClick={() => eliminar(o.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Editar Objeto Contable' : 'Registrar Objeto Contable'}
      >
        <div className="form-group">
          <label>Descripción del Objeto</label>
          <input
            className="form-control"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Mantenimiento y limpieza industrial especializada"
            onKeyDown={(e) => e.key === 'Enter' && guardar()}
            autoFocus
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={guardar}>
            {editingId ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
