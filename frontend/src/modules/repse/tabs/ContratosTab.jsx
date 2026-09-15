import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, FileText } from 'lucide-react';
import { contratosAPI } from '../../../services/api';
import Modal from '../../../shared/components/Modal';
import { useRepse } from '../context/RepseContext';
import { useToastContext } from '../../../shared/context/ToastContext';

const empty = {
  numero_contrato: '',
  monto: '',
  trabajadores_estimados: '',
  vigencia: '',
  fecha_inicio: '',
  fecha_fin: '',
};

export default function ContratosTab(props) {
  const contextRepse = useRepse();
  const contextToast = useToastContext();

  const cuatrimestre = props.cuatrimestre !== undefined ? props.cuatrimestre : contextRepse.cuatrimestre;
  const addToast = props.addToast || contextToast.addToast;

  const [contratos, setContratos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const cargar = useCallback(async () => {
    if (!cuatrimestre) return;
    try {
      setContratos(await contratosAPI.listar(cuatrimestre.id));
    } catch (error) {
      console.error('Error cargando contratos:', error);
    }
  }, [cuatrimestre]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizarCampo = (campo, valor) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const guardar = async () => {
    try {
      const data = {
        ...form,
        cuatrimestre_id: cuatrimestre.id,
        monto: parseFloat(form.monto),
        trabajadores_estimados: parseInt(form.trabajadores_estimados, 10),
      };
      if (editId) {
        await contratosAPI.actualizar(editId, data);
        addToast('Contrato actualizado');
      } else {
        await contratosAPI.crear(data);
        addToast('Contrato creado');
      }
      setShowModal(false);
      setForm(empty);
      setEditId(null);
      cargar();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const editar = (c) => {
    setForm({
      numero_contrato: c.numero_contrato,
      monto: c.monto,
      trabajadores_estimados: c.trabajadores_estimados,
      vigencia: c.vigencia || '',
      fecha_inicio: c.fecha_inicio,
      fecha_fin: c.fecha_fin,
    });
    setEditId(c.id);
    setShowModal(true);
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar contrato?')) return;
    try {
      await contratosAPI.eliminar(id);
      addToast('Contrato eliminado');
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
          <h2>Contratos</h2>
          <p>{cuatrimestre.nombre}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(empty);
            setEditId(null);
            setShowModal(true);
          }}
        >
          <Plus size={16} /> Nuevo Contrato
        </button>
      </div>

      {contratos.length === 0 ? (
        <div className="empty-state">
          <FileText />
          <h4>Sin contratos</h4>
          <p>Crea tu primer contrato para este cuatrimestre</p>
        </div>
      ) : (
        contratos.map((c) => (
          <div key={c.id} className="contract-row">
            <div className="contract-info">
              <strong>Contrato: {c.numero_contrato}</strong>
              <span>
                Monto: ${Number(c.monto).toLocaleString('es-MX')} · {c.trabajadores_estimados} trabajadores est.
              </span>
              <span>{c.fecha_inicio} → {c.fecha_fin}</span>
            </div>
            <div className="contract-actions">
              <span className="badge badge-info">{c.objetos_contables?.length || 0} objetos</span>
              <span className="badge badge-success">{c.beneficiarios?.length || 0} benef.</span>
              <span className="badge badge-warning">{c.empleados?.length || 0} empl.</span>
              <button
                className="btn-icon tooltip"
                data-tip="Editar contrato"
                onClick={() => editar(c)}
              >
                <Edit size={16} />
              </button>
              <button
                className="btn-icon btn-icon-danger tooltip"
                data-tip="Eliminar"
                onClick={() => eliminar(c.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Editar Contrato' : 'Nuevo Contrato'}
      >
        <div className="form-row">
          <div className="form-group">
            <label>No. Contrato</label>
            <input
              className="form-control"
              value={form.numero_contrato}
              onChange={(e) => actualizarCampo('numero_contrato', e.target.value)}
              placeholder="Ej: CONT-2026-001"
            />
          </div>
          <div className="form-group">
            <label>Monto</label>
            <input
              type="number"
              className="form-control"
              value={form.monto}
              onChange={(e) => actualizarCampo('monto', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>No. Trabajadores Estimados</label>
            <input
              type="number"
              className="form-control"
              value={form.trabajadores_estimados}
              onChange={(e) => actualizarCampo('trabajadores_estimados', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Vigencia</label>
            <input
              className="form-control"
              value={form.vigencia}
              onChange={(e) => actualizarCampo('vigencia', e.target.value)}
              placeholder="Ej: 4 meses"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Fecha de Inicio</label>
            <input
              type="date"
              className="form-control"
              value={form.fecha_inicio}
              onChange={(e) => actualizarCampo('fecha_inicio', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Fecha de Fin</label>
            <input
              type="date"
              className="form-control"
              value={form.fecha_fin}
              onChange={(e) => actualizarCampo('fecha_fin', e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={guardar}>
            {editId ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
