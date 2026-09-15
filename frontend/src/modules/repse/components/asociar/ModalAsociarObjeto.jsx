import { Check } from 'lucide-react';
import Modal from '../../../../shared/components/Modal';

export default function ModalAsociarObjeto({ isOpen, onClose, objetos, onAsociar }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asociar Objeto Contable">
      {objetos.length === 0 ? (
        <p className="modal-empty-msg">No hay objetos contables registrados</p>
      ) : (
        objetos.map((o) => (
          <div
            key={o.id}
            className="contract-row modal-item-row"
            onClick={() => onAsociar(o.id)}
          >
            <span className="cell-primary-text">{o.descripcion}</span>
            <Check size={16} className="btn-icon-success" />
          </div>
        ))
      )}
    </Modal>
  );
}
