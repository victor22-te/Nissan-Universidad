import { Check } from 'lucide-react';
import Modal from '../../../../shared/components/Modal';

export default function ModalAsociarEmpleado({
  isOpen,
  onClose,
  empleados,
  modoEmp,
  setModoEmp,
  onAsociar,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asociar Empleado" large>
      <div className="modal-mode-switch-group">
        <button
          className={`btn ${modoEmp === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setModoEmp('manual')}
        >
          Manual
        </button>
        <button
          className={`btn ${modoEmp === 'xml' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setModoEmp('xml')}
        >
          Datos del Sistema (XML)
        </button>
      </div>
      {empleados.length === 0 ? (
        <p className="modal-empty-msg">No hay empleados registrados</p>
      ) : (
        empleados.map((e) => (
          <div
            key={e.id}
            className="contract-row modal-item-row"
            onClick={() => onAsociar(e.id)}
          >
            <div>
              <strong>{e.nombre}</strong>
              <br />
              <span className="modal-subtitle-muted">
                {e.rfc} · {e.nss}
              </span>
            </div>
            <div className="modal-item-row-content">
              <span className={`badge ${e.origen === 'xml' ? 'badge-info' : 'badge-warning'}`}>
                {e.origen}
              </span>
              <Check size={16} className="btn-icon-success" />
            </div>
          </div>
        ))
      )}
    </Modal>
  );
}
