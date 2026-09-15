import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Users, Upload, FileCode2, Edit } from 'lucide-react';
import { empleadosAPI } from '../../../services/api';
import Modal from '../../../shared/components/Modal';
import { useRepse } from '../context/RepseContext';
import { useToastContext } from '../../../shared/context/ToastContext';

const empty = { rfc: '', curp: '', nombre: '', nss: '', salario_base_cotizacion: 0.00 };

export default function EmpleadosTab(props) {
  const contextRepse = useRepse();
  const contextToast = useToastContext();

  const cuatrimestre = props.cuatrimestre !== undefined ? props.cuatrimestre : contextRepse.cuatrimestre;
  const addToast = props.addToast || contextToast.addToast;

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const fileRef = useRef();

  const cargar = useCallback(async () => {
    if (!cuatrimestre) return;
    try {
      setItems(await empleadosAPI.listar(cuatrimestre.id));
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  }, [cuatrimestre]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizarCampo = (campo, valor) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const guardarManual = async () => {
    try {
      if (editingId) {
        await empleadosAPI.actualizar(editingId, {
          ...form,
          cuatrimestre_id: cuatrimestre.id,
          origen: form.origen || 'manual',
        });
        addToast('Empleado actualizado');
      } else {
        await empleadosAPI.crear({
          ...form,
          cuatrimestre_id: cuatrimestre.id,
          origen: 'manual',
        });
        addToast('Empleado registrado');
      }
      setShowModal(false);
      setForm(empty);
      setEditingId(null);
      cargar();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const editar = (e) => {
    setEditingId(e.id);
    setForm({
      rfc: e.rfc || '',
      curp: e.curp || '',
      nombre: e.nombre || '',
      nss: e.nss || '',
      salario_base_cotizacion: e.salario_base_cotizacion || 0.00,
      origen: e.origen,
    });
    setShowModal(true);
  };

  const cargarXML = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      const result = await empleadosAPI.cargarXML(cuatrimestre.id, files);
      addToast(`${result.length} empleado(s) cargados desde XML`);
      cargar();
    } catch (err) {
      addToast(err.message, 'error');
    }
    e.target.value = '';
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar empleado?')) return;
    try {
      await empleadosAPI.eliminar(id);
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
          <h2>Empleados</h2>
          <p>{cuatrimestre.nombre}</p>
        </div>
        <div className="empleados-header-actions">
          <button className="btn btn-secondary" onClick={() => fileRef.current.click()}>
            <Upload size={16} /> Cargar XML Nómina
          </button>
          <input ref={fileRef} type="file" accept=".xml" multiple hidden onChange={cargarXML} />
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingId(null);
              setForm(empty);
              setShowModal(true);
            }}
          >
            <Plus size={16} /> Agregar Manual
          </button>
        </div>
      </div>

      <div
        className="file-upload file-upload-card"
        onClick={() => fileRef.current.click()}
      >
        <FileCode2 />
        <p><strong>Arrastra o haz clic</strong> para cargar XMLs de nómina CFDI</p>
        <p className="file-upload-desc-sm">
          Se extraerán RFC, CURP, Nombre y NSS automáticamente
        </p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <Users />
          <h4>Sin empleados</h4>
          <p>Agrega manualmente o carga XMLs de nómina</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>RFC</th>
                <th>CURP</th>
                <th>NSS</th>
                <th>SBC</th>
                <th>Origen</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((e, i) => (
                <tr key={e.id}>
                  <td>{i + 1}</td>
                  <td className="cell-primary-text">{e.nombre}</td>
                  <td>{e.rfc}</td>
                  <td className="cell-monospace-sm">{e.curp}</td>
                  <td>{e.nss}</td>
                  <td>${Number(e.salario_base_cotizacion || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${e.origen === 'xml' ? 'badge-info' : 'badge-warning'}`}>
                      {e.origen === 'xml' ? 'XML' : 'Manual'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions-group">
                      <button
                        className="btn-icon btn-icon-primary tooltip"
                        data-tip="Editar"
                        onClick={() => editar(e)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon btn-icon-danger tooltip"
                        data-tip="Eliminar"
                        onClick={() => eliminar(e.id)}
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
        title={editingId ? 'Editar Empleado' : 'Agregar Empleado Manual'}
      >
        <div className="form-row">
          <div className="form-group">
            <label>Nombre / Razón Social</label>
            <input
              className="form-control"
              value={form.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
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
            <label>CURP</label>
            <input
              className="form-control"
              value={form.curp}
              onChange={(e) => actualizarCampo('curp', e.target.value)}
              maxLength={18}
            />
          </div>
          <div className="form-group">
            <label>Num. Seguridad Social (NSS)</label>
            <input
              className="form-control"
              value={form.nss}
              onChange={(e) => actualizarCampo('nss', e.target.value)}
              maxLength={11}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Salario Base de Cotización</label>
          <input
            className="form-control"
            type="number"
            step="0.01"
            value={form.salario_base_cotizacion}
            onChange={(e) =>
              actualizarCampo('salario_base_cotizacion', parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={guardarManual}>
            {editingId ? 'Guardar Cambios' : 'Registrar'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
