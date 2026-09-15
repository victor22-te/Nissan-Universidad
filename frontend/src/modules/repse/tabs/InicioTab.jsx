import { useState } from 'react';
import { Plus, Calendar, Trash2, FileText, Building2, Users } from 'lucide-react';
import { cuatrimestresAPI } from '../../../services/api';
import { useRepse } from '../context/RepseContext';
import { useToastContext } from '../../../shared/context/ToastContext';

const PERIODOS = [
  { value: 1, label: 'Enero - Abril', months: 'Ene · Feb · Mar · Abr' },
  { value: 2, label: 'Mayo - Agosto', months: 'May · Jun · Jul · Ago' },
  { value: 3, label: 'Septiembre - Diciembre', months: 'Sep · Oct · Nov · Dic' },
];

export default function InicioTab(props) {
  const contextRepse = useRepse();
  const contextToast = useToastContext();

  const cuatrimestre = props.cuatrimestre !== undefined ? props.cuatrimestre : contextRepse.cuatrimestre;
  const setCuatrimestre = props.setCuatrimestre || contextRepse.setCuatrimestre;
  const cuatrimestres = contextRepse.cuatrimestres;
  const cargarCuatrimestres = contextRepse.cargarCuatrimestres;
  const addToast = props.addToast || contextToast.addToast;

  const [anio, setAnio] = useState(new Date().getFullYear());
  const [periodo, setPeriodo] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const crear = async () => {
    try {
      const nuevo = await cuatrimestresAPI.crear({ anio, periodo });
      addToast(`Cuatrimestre ${nuevo.nombre} creado`);
      setShowCreate(false);
      await cargarCuatrimestres();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cuatrimestre y toda su información?')) return;
    try {
      await cuatrimestresAPI.eliminar(id);
      if (cuatrimestre?.id === id) setCuatrimestre(null);
      addToast('Cuatrimestre eliminado');
      await cargarCuatrimestres();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Seleccionar Cuatrimestre</h2>
          <p>Elige el periodo de trabajo para gestionar tus reportes REPSE</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={16} /> Nuevo Cuatrimestre
        </button>
      </div>

      {showCreate && (
        <div className="card repse-create-card">
          <div className="card-header"><h3>Crear Cuatrimestre</h3></div>
          <div className="form-row">
            <div className="form-group">
              <label>Año</label>
              <input
                type="number"
                className="form-control"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                min={2020}
                max={2050}
              />
            </div>
            <div className="form-group">
              <label>Periodo</label>
              <select
                className="form-control"
                value={periodo}
                onChange={(e) => setPeriodo(Number(e.target.value))}
              >
                {PERIODOS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={crear}>
            <Calendar size={16} /> Crear
          </button>
        </div>
      )}

      {cuatrimestres.length === 0 ? (
        <div className="empty-state">
          <Calendar />
          <h4>No hay cuatrimestres</h4>
          <p>Crea un nuevo periodo para comenzar a trabajar</p>
        </div>
      ) : (
        <div className="cuatrimestre-selector">
          {cuatrimestres.map((c) => (
            <div
              key={c.id}
              className={`cuat-card ${cuatrimestre?.id === c.id ? 'active' : ''}`}
              onClick={() => setCuatrimestre(c)}
            >
              <h4>{c.nombre}</h4>
              <span>{PERIODOS.find((p) => p.value === c.periodo)?.months}</span>
              <div className="cuat-card-actions">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => { e.stopPropagation(); eliminar(c.id); }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cuatrimestre && (
        <div className="card repse-active-working-card">
          <div className="card-header">
            <h3>Trabajando en: {cuatrimestre.nombre}</h3>
          </div>
          <p className="repse-working-desc">
            Navega por las pestañas para gestionar contratos, objetos, beneficiarios y empleados.
          </p>
          <div className="card-grid">
            <div className="card repse-summary-card">
              <FileText size={24} className="repse-summary-icon accent" />
              <h4>Contratos</h4>
              <p>Registra y gestiona contratos de servicios</p>
            </div>
            <div className="card repse-summary-card">
              <Building2 size={24} className="repse-summary-icon success" />
              <h4>Beneficiarios</h4>
              <p>Datos de tus clientes para ICSOE/SISUB</p>
            </div>
            <div className="card repse-summary-card">
              <Users size={24} className="repse-summary-icon warning" />
              <h4>Empleados</h4>
              <p>Manual o carga masiva por XML de nómina</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
