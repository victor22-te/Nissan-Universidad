import { useState } from 'react';
import { FileText, Building2, Users, Link2, Download } from 'lucide-react';
import { RepseProvider, useRepse } from './context/RepseContext';
import InicioTab from './tabs/InicioTab';
import ContratosTab from './tabs/ContratosTab';
import ObjetosTab from './tabs/ObjetosTab';
import BeneficiariosTab from './tabs/BeneficiariosTab';
import EmpleadosTab from './tabs/EmpleadosTab';
import AsociarTab from './tabs/AsociarTab';
import ReportesTab from './tabs/ReportesTab';
import './RepseModule.css';
import './repse.css';

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: FileText },
  { id: 'contratos', label: 'Contratos', icon: FileText },
  { id: 'objetos', label: 'Objetos Contables', icon: Building2 },
  { id: 'beneficiarios', label: 'Beneficiarios', icon: Building2 },
  { id: 'empleados', label: 'Empleados', icon: Users },
  { id: 'asociar', label: 'Asociar', icon: Link2 },
  { id: 'reportes', label: 'Reportes', icon: Download },
];

function RepseDashboard() {
  const [activeTab, setActiveTab] = useState('inicio');
  const { cuatrimestre } = useRepse();

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio': return <InicioTab />;
      case 'contratos': return <ContratosTab />;
      case 'objetos': return <ObjetosTab />;
      case 'beneficiarios': return <BeneficiariosTab />;
      case 'empleados': return <EmpleadosTab />;
      case 'asociar': return <AsociarTab />;
      case 'reportes': return <ReportesTab />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Gestion REPSE</h2>
          <p>Sistema de reportes ICSOE y SISUB</p>
        </div>
        {cuatrimestre && (
          <div className="repse-active-period-badge">
            Periodo activo: <strong>{cuatrimestre.nombre}</strong>
          </div>
        )}
      </div>

      <div className="tab-bar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="repse-content-area">
        {renderContent()}
      </div>
    </div>
  );
}

export default function RepseModule() {
  return (
    <RepseProvider>
      <RepseDashboard />
    </RepseProvider>
  );
}
