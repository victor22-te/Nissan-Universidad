import { Download, FileSpreadsheet } from 'lucide-react';
import { reportesAPI } from '../../../services/api';
import { useRepse } from '../context/RepseContext';
import { useToastContext } from '../../../shared/context/ToastContext';

export default function ReportesTab(props) {
  const contextRepse = useRepse();
  const contextToast = useToastContext();

  const cuatrimestre = props.cuatrimestre !== undefined ? props.cuatrimestre : contextRepse.cuatrimestre;
  const addToast = props.addToast || contextToast.addToast;

  if (!cuatrimestre) {
    return (
      <div className="empty-state">
        <h4>Selecciona un cuatrimestre</h4>
      </div>
    );
  }

  const descargar = async (tipo) => {
    try {
      if (tipo === 'icsoe') await reportesAPI.descargarICSOE(cuatrimestre.id);
      else if (tipo === 'sisub-c') await reportesAPI.descargarSISUBContratos(cuatrimestre.id);
      else await reportesAPI.descargarSISUBTrabajadores(cuatrimestre.id);
      addToast('Reporte descargado');
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reportes ICSOE / SISUB</h2>
          <p>Genera los reportes en Excel — {cuatrimestre.nombre}</p>
        </div>
      </div>

      <div className="card-grid">
        <div className="card report-card-center">
          <div className="report-icon-box success">
            <FileSpreadsheet size={28} />
          </div>
          <h3 className="report-card-title">Reporte ICSOE</h3>
          <p className="report-card-desc">
            Informe de Contratos de Servicios u Obras Especializados para el IMSS
          </p>
          <button className="btn btn-success" onClick={() => descargar('icsoe')}>
            <Download size={16} /> Descargar Excel
          </button>
        </div>

        <div className="card report-card-center">
          <div className="report-icon-box info">
            <FileSpreadsheet size={28} />
          </div>
          <h3 className="report-card-title">SISUB — Contratos</h3>
          <p className="report-card-desc">
            Reporte de contratos para INFONAVIT (SISUB)
          </p>
          <button className="btn btn-primary" onClick={() => descargar('sisub-c')}>
            <Download size={16} /> Descargar Excel
          </button>
        </div>

        <div className="card report-card-center">
          <div className="report-icon-box warning">
            <FileSpreadsheet size={28} />
          </div>
          <h3 className="report-card-title">SISUB — Trabajadores</h3>
          <p className="report-card-desc">
            Reporte de trabajadores para INFONAVIT (SISUB)
          </p>
          <button className="btn btn-secondary" onClick={() => descargar('sisub-t')}>
            <Download size={16} /> Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
