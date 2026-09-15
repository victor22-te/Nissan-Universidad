import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import { boardsAPI } from './services/projectsApi';
import BoardView from './components/BoardView';
import { useToastContext } from '../../shared/context/ToastContext';
import './projects.css';

const BOARD_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#737373',
];

export default function ProjectsPage(props) {
  const contextToast = useToastContext();
  const addToast = props.addToast || contextToast.addToast;

  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');

  const load = useCallback(async () => {
    try {
      setBoards(await boardsAPI.list());
    } catch (err) {
      console.error('Error cargando tableros de proyectos:', err);
      addToast('Error al cargar tableros de proyectos', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    load();
  }, [load]);

  const createBoard = async () => {
    if (!newName.trim()) return;
    try {
      const res = await boardsAPI.create({ name: newName, color: newColor });
      addToast('Tablero creado');
      setNewName('');
      setShowCreate(false);
      load();
      setActiveBoard(res.id);
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const deleteBoard = async (id, e) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este tablero y todo su contenido?')) return;
    try {
      await boardsAPI.delete(id);
      if (activeBoard === id) setActiveBoard(null);
      addToast('Tablero eliminado');
      load();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  if (activeBoard) {
    return (
      <BoardView
        boardId={activeBoard}
        onBack={() => {
          setActiveBoard(null);
          load();
        }}
        addToast={addToast}
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Proyectos</h2>
          <p>Gestiona tus proyectos y tareas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={16} /> Nuevo tablero
        </button>
      </div>

      {showCreate && (
        <div className="card create-board-card">
          <div className="create-board-row">
            <div className="form-group board-name-input-group">
              <label>Nombre del tablero</label>
              <input
                className="form-control"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Auditorias 2026"
                onKeyDown={(e) => e.key === 'Enter' && createBoard()}
                autoFocus
              />
            </div>
            <div className="form-group board-color-input-group">
              <label>Color</label>
              <div className="board-color-palette">
                {BOARD_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`color-swatch-btn ${newColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <button className="btn btn-primary" onClick={createBoard}>
              Crear
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {boards.length === 0 ? (
        <div className="empty-state">
          <LayoutGrid />
          <h4>Sin tableros</h4>
          <p>Crea tu primer tablero para comenzar a gestionar proyectos</p>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map((b) => (
            <div
              key={b.id}
              className="card board-card"
              onClick={() => setActiveBoard(b.id)}
            >
              <div
                className="board-card-top-accent"
                style={{ background: b.color }}
              />
              <div className="board-card-body">
                <div className="board-card-header">
                  <h4 className="board-card-title">{b.name}</h4>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={(e) => deleteBoard(b.id, e)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="board-card-stats">
                  <span>{b.groups_count} grupos</span>
                  <span>{b.items_count} items</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
