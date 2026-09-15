import { Check } from 'lucide-react';
import Modal from '../../../../shared/components/Modal';

export default function ModalAsociarBeneficiario({ isOpen, onClose, beneficiarios, onAsociar }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asociar Beneficiario">
      {beneficiarios.length === 0 ? (
        <p className="modal-empty-msg">No hay beneficiarios registrados</p>
      ) : (
        beneficiarios.map((b) => (
          <div
            key={b.id}
            className="contract-row modal-item-row"
            onClick={() => onAsociar(b.id)}
          >
            <div>
              <strong>{b.razon_social}</strong>
              <br />
              <span className="modal-subtitle-muted">{b.rfc}</span>
            </div>
            <Check size={16} className="btn-icon-success" />
          </div>
        ))
      )}
    </Modal>
  );
}
