import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Building2, Edit } from 'lucide-react';
import { beneficiariosAPI } from '../../../services/api';
import Modal from '../../../shared/components/Modal';
import { useRepse } from '../context/RepseContext';
import { useToastContext } from '../../../shared/context/ToastContext';

const empty = {
  razon_social: '',
  rfc: '',
  registro_patronal: '',
  correo: '',
  telefono: '',
  estado: '',
  municipio: '',
  cp: '',
  colonia: '',
  calle: '',
  num_exterior: '',
  num_interior: '',
  entre_calle_1: '',
  entre_calle_2: '',
};

export default function BeneficiariosTab(props) {
  const contextRepse = useRepse();
  const contextToast = useToastContext();

  const cuatrimestre = props.cuatrimestre !== undefined ? props.cuatrimestre : contextRepse.cuatrimestre;
  const addToast = props.addToast || contextToast.addToast;

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const cargar = useCallback(async () => {
    if (!cuatrimestre) return;
    try {
      setItems(await beneficiariosAPI.listar(cuatrimestre.id));
    } catch (error) {
      console.error('Error cargando beneficiarios:', error);
    }
  }, [cuatrimestre]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizarCampo = (campo, valor) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const guardar = async () => {
    try {
      if (editingId) {
        await beneficiariosAPI.actualizar(editingId, { ...form, cuatrimestre_id: cuatrimestre.id });
        addToast('Beneficiario actualizado');
      } else {
        await beneficiariosAPI.crear({ ...form, cuatrimestre_id: cuatrimestre.id });
        addToast('Beneficiario registrado');
      }
      setShowModal(false);
      setForm(empty);
      setEditingId(null);
      cargar();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const editar = (b) => {
    setEditingId(b.id);
    setForm(b);
    setShowModal(true);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar beneficiario?')) return;
    try {
      await beneficiariosAPI.eliminar(id);
      addToast('Eliminado');
      cargar();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  if (!cuatrimestre) {
    return (
      <div className="empty-state">
        <h4>Selecciona un cuatrimestre</h4>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Beneficiarios</h2>
          <p>{cuatrimestre.nombre}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setForm(empty);
            setShowModal(true);
          }}
        >
          <Plus size={16} /> Registrar Beneficiario
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <Building2 />
          <h4>Sin beneficiarios</h4>
          <p>Registra los datos de tus clientes</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>RFC</th>
                <th>Reg. Patronal</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td className="cell-primary-text">
                    {b.razon_social}
                  </td>
                  <td>{b.rfc}</td>
                  <td>{b.registro_patronal}</td>
                  <td>{b.correo}</td>
                  <td>{b.telefono}</td>
                  <td>{b.estado}</td>
                  <td>
                    <div className="table-actions-group">
                      <button
                        className="btn-icon btn-icon-primary tooltip"
                        data-tip="Editar"
                        onClick={() => editar(b)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon btn-icon-danger tooltip"
                        data-tip="Eliminar"
                        onClick={() => eliminar(b.id)}
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
        title={editingId ? 'Editar Beneficiario' : 'Registrar Beneficiario'}
        large
      >
        <div className="form-row">
          <div className="form-group">
            <label>Razón Social</label>
            <input
              className="form-control"
              value={form.razon_social}
              onChange={(e) => actualizarCampo('razon_social', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>RFC</label>
            <input
              className="form-control"
              value={form.rfc}
              onChange={(e) => actualizarCampo('rfc', e.target.value)}
              maxLength={13}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Registro Patronal</label>
            <input
              className="form-control"
              value={form.registro_patronal}
              onChange={(e) => actualizarCampo('registro_patronal', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Correo</label>
            <input
              type="email"
              className="form-control"
              value={form.correo}
              onChange={(e) => actualizarCampo('correo', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input
              className="form-control"
              value={form.telefono}
              onChange={(e) => actualizarCampo('telefono', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <input
              className="form-control"
              value={form.estado}
              onChange={(e) => actualizarCampo('estado', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label>Municipio</label>
            <input
              className="form-control"
              value={form.municipio}
              onChange={(e) => actualizarCampo('municipio', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>C.P.</label>
            <input
              className="form-control"
              value={form.cp}
              onChange={(e) => actualizarCampo('cp', e.target.value)}
              maxLength={5}
            />
          </div>
          <div className="form-group">
            <label>Colonia</label>
            <input
              className="form-control"
              value={form.colonia}
              onChange={(e) => actualizarCampo('colonia', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label>Calle</label>
            <input
              className="form-control"
              value={form.calle}
              onChange={(e) => actualizarCampo('calle', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Num. Exterior</label>
            <input
              className="form-control"
              value={form.num_exterior}
              onChange={(e) => actualizarCampo('num_exterior', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Num. Interior</label>
            <input
              className="form-control"
              value={form.num_interior}
              onChange={(e) => actualizarCampo('num_interior', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Entre calle</label>
            <input
              className="form-control"
              value={form.entre_calle_1}
              onChange={(e) => actualizarCampo('entre_calle_1', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Y calle</label>
            <input
              className="form-control"
              value={form.entre_calle_2}
              onChange={(e) => actualizarCampo('entre_calle_2', e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={guardar}>
            {editingId ? 'Guardar Cambios' : 'Registrar'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
