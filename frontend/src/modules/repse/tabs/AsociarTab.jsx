import { Link2, Building2, Users, Plus } from 'lucide-react';
import { useAsociarContratos } from '../hooks/useAsociarContratos';
import ModalAsociarObjeto from '../components/asociar/ModalAsociarObjeto';
import ModalAsociarBeneficiario from '../components/asociar/ModalAsociarBeneficiario';
import ModalAsociarEmpleado from '../components/asociar/ModalAsociarEmpleado';

export default function AsociarTab() {
  const {
    cuatrimestre,
    contratos,
    objetos,
    beneficiarios,
    empleados,
    modal,
    modoEmp,
    setModoEmp,
    abrirModal,
    cerrarModal,
    asociarObjeto,
    asociarBeneficiario,
    asociarEmpleado,
  } = useAsociarContratos();

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
          <h2>Asociar a Contratos</h2>
          <p>Vincula objetos, beneficiarios y empleados — {cuatrimestre.nombre}</p>
        </div>
      </div>

      {contratos.length === 0 ? (
        <div className="empty-state">
          <Link2 />
          <h4>Sin contratos</h4>
          <p>Primero crea contratos en la sección correspondiente</p>
        </div>
      ) : (
        contratos.map((c) => (
          <div key={c.id} className="contract-row contract-row-asociar">
            <div className="asociar-contract-header">
              <div className="contract-info">
                <strong>Contrato: {c.numero_contrato}</strong>
                <span>
                  ${Number(c.monto).toLocaleString('es-MX')} · {c.fecha_inicio} → {c.fecha_fin}
                </span>
              </div>
              <div className="contract-actions">
                <button
                  className="btn-icon btn-icon-info tooltip"
                  data-tip="Asociar Objeto Contable"
                  onClick={() => abrirModal('objeto', c)}
                >
                  <Building2 size={16} />
                </button>
                <button
                  className="btn-icon btn-icon-success tooltip"
                  data-tip="Asociar Beneficiario"
                  onClick={() => abrirModal('beneficiario', c)}
                >
                  <Plus size={16} />
                </button>
                <button
                  className="btn-icon btn-icon-warning tooltip"
                  data-tip="Asociar Empleado"
                  onClick={() => abrirModal('empleado', c)}
                >
                  <Users size={16} />
                </button>
              </div>
            </div>

            {/* Listado visual de asociaciones */}
            <div className="asociar-tags-list">
              {c.objetos_contables?.map((o) => (
                <span key={o.id} className="badge badge-info">{o.descripcion}</span>
              ))}
              {c.beneficiarios?.map((b) => (
                <span key={b.id} className="badge badge-success">{b.razon_social}</span>
              ))}
              {c.empleados?.map((e) => (
                <span key={e.id} className="badge badge-warning">{e.nombre}</span>
              ))}
              {!c.objetos_contables?.length && !c.beneficiarios?.length && !c.empleados?.length && (
                <span className="asociar-empty-tag">
                  Sin asociaciones — usa los botones de la derecha
                </span>
              )}
            </div>
          </div>
        ))
      )}

      {/* Modales modulares desacoplados */}
      <ModalAsociarObjeto
        isOpen={modal === 'objeto'}
        onClose={cerrarModal}
        objetos={objetos}
        onAsociar={asociarObjeto}
      />

      <ModalAsociarBeneficiario
        isOpen={modal === 'beneficiario'}
        onClose={cerrarModal}
        beneficiarios={beneficiarios}
        onAsociar={asociarBeneficiario}
      />

      <ModalAsociarEmpleado
        isOpen={modal === 'empleado'}
        onClose={cerrarModal}
        empleados={empleados}
        modoEmp={modoEmp}
        setModoEmp={setModoEmp}
        onAsociar={asociarEmpleado}
      />
    </div>
  );
}
