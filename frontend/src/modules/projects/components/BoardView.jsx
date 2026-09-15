import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight,
  GripVertical, MoreHorizontal, Type, Hash, Calendar,
  User, Mail, Phone, Clock, Flag, CheckSquare, Link,
  List, Star, X, Edit3
} from 'lucide-react';
import { boardsAPI, groupsAPI, columnsAPI, itemsAPI, subItemsAPI } from '../services/projectsApi';
import CellRenderer from './CellRenderer';

const COLUMN_TYPES = [
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'number', label: 'Numero', icon: Hash },
  { type: 'status', label: 'Estado', icon: Flag },
  { type: 'date', label: 'Fecha', icon: Calendar },
  { type: 'person', label: 'Persona', icon: User },
  { type: 'email', label: 'Correo', icon: Mail },
  { type: 'phone', label: 'Telefono', icon: Phone },
  { type: 'timeline', label: 'Timeline', icon: Clock },
  { type: 'priority', label: 'Prioridad', icon: Flag },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'link', label: 'Enlace', icon: Link },
  { type: 'dropdown', label: 'Dropdown', icon: List },
  { type: 'rating', label: 'Valoracion', icon: Star },
];

export default function BoardView({ boardId, onBack, addToast }) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [editingName, setEditingName] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState(null);
  const colMenuRef = useRef(null);

  const load = async () => {
    try {
      const data = await boardsAPI.get(boardId);
      setBoard(data);
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [boardId]);

  // Close column menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Actions ──────────────────────────────────

  const addGroup = async () => {
    try {
      await groupsAPI.create({ board_id: boardId, name: 'Nuevo grupo' });
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const deleteGroup = async (groupId) => {
    if (!confirm('Eliminar este grupo y todos sus items?')) return;
    try {
      await groupsAPI.delete(groupId);
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const toggleGroup = async (group) => {
    try {
      await groupsAPI.update(group.id, { collapsed: !group.collapsed });
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const renameGroup = async (groupId, newName) => {
    if (!newName.trim()) return;
    try {
      await groupsAPI.update(groupId, { name: newName });
      setEditingGroupName(null);
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const addColumn = async (type) => {
    const labels = {
      text: 'Texto', number: 'Numero', status: 'Estado', date: 'Fecha',
      person: 'Persona', email: 'Correo', phone: 'Telefono',
      timeline: 'Timeline', priority: 'Prioridad', checkbox: 'Checkbox',
      link: 'Enlace', dropdown: 'Dropdown', rating: 'Valoracion',
    };
    try {
      await columnsAPI.create({
        board_id: boardId,
        title: labels[type] || type,
        column_type: type,
      });
      setShowColumnMenu(false);
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const deleteColumn = async (colId) => {
    try {
      await columnsAPI.delete(colId);
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const renameColumn = async (colId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await columnsAPI.update(colId, { title: newTitle });
      setEditingName(null);
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const addItem = async (groupId) => {
    try {
      await itemsAPI.create({ group_id: groupId, name: 'Nuevo item' });
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const deleteItem = async (itemId) => {
    try {
      await itemsAPI.delete(itemId);
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const updateItem = async (itemId, data) => {
    try {
      await itemsAPI.update(itemId, data);
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const addSubItem = async (itemId) => {
    try {
      await subItemsAPI.create({ item_id: itemId, name: 'Sub-item' });
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const deleteSubItem = async (siId) => {
    try {
      await subItemsAPI.delete(siId);
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  const updateSubItem = async (siId, data) => {
    try {
      await subItemsAPI.update(siId, data);
      load();
    } catch (e) { addToast(e.message, 'error'); }
  };

  if (loading) return <div className="board-view-loading">Cargando...</div>;
  if (!board) return <div className="empty-state"><h4>Tablero no encontrado</h4></div>;

  const columns = board.columns || [];
  const groups = board.groups || [];

  return (
    <div className="board-view">
      {/* Header */}
      <div className="board-view-header">
        <button className="btn-icon" onClick={onBack}><ArrowLeft size={18} /></button>
        <div>
          <h2 className="board-view-title">{board.name}</h2>
          {board.description && (
            <p className="board-view-desc">{board.description}</p>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="board-view-actions">
        <button className="btn btn-secondary btn-sm" onClick={addGroup}>
          <Plus size={14} /> Grupo
        </button>
        <div className="board-column-menu-wrapper" ref={colMenuRef}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowColumnMenu(!showColumnMenu)}>
            <Plus size={14} /> Columna
          </button>
          {showColumnMenu && (
            <div className="col-type-menu">
              <div className="board-column-menu-header">
                TIPO DE COLUMNA
              </div>
              {COLUMN_TYPES.map((ct) => {
                const Icon = ct.icon;
                return (
                  <button key={ct.type} className="col-type-option" onClick={() => addColumn(ct.type)}>
                    <Icon size={14} /> {ct.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Board table */}
      <div className="board-table-wrapper">
        {groups.map((group) => (
          <div key={group.id} className="board-group board-group-container">
            {/* Group header */}
            <div className="board-group-header" style={{ borderLeftColor: group.color }}>
              <button
                className="btn-icon btn-icon-sm"
                onClick={() => toggleGroup(group)}
              >
                {group.collapsed
                  ? <ChevronRight size={14} />
                  : <ChevronDown size={14} />
                }
              </button>

              {editingGroupName === group.id ? (
                <input
                  className="inline-edit"
                  defaultValue={group.name}
                  autoFocus
                  onBlur={(e) => renameGroup(group.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') renameGroup(group.id, e.target.value);
                    if (e.key === 'Escape') setEditingGroupName(null);
                  }}
                  style={{ color: group.color, fontWeight: 600, fontSize: 14 }}
                />
              ) : (
                <span
                  className="group-name"
                  style={{ color: group.color }}
                  onDoubleClick={() => setEditingGroupName(group.id)}
                >
                  {group.name}
                </span>
              )}

              <span className="board-group-count">
                {group.items?.length || 0} items
              </span>
              <button
                className="btn-icon group-action board-group-action-btn"
                onClick={() => deleteGroup(group.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Table */}
            {!group.collapsed && (
              <div className="board-table">
                {/* Column headers */}
                <div className="board-row board-header-row">
                  <div className="board-cell board-cell-name" style={{ borderLeftColor: group.color }}>
                    Item
                  </div>
                  {columns.map((col) => (
                    <div
                      key={col.id}
                      className="board-cell board-cell-col"
                      style={{ width: col.width || 150, minWidth: col.width || 150 }}
                    >
                      {editingName === col.id ? (
                        <input
                          className="inline-edit subitem-count-text"
                          defaultValue={col.title}
                          autoFocus
                          onBlur={(e) => renameColumn(col.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') renameColumn(col.id, e.target.value);
                            if (e.key === 'Escape') setEditingName(null);
                          }}
                        />
                      ) : (
                        <span
                          className="col-header-text"
                          onDoubleClick={() => setEditingName(col.id)}
                        >
                          {col.title}
                        </span>
                      )}
                      <button
                        className="col-delete-btn"
                        onClick={() => deleteColumn(col.id)}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Items */}
                {(group.items || []).map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    columns={columns}
                    groupColor={group.color}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                    onAddSubItem={addSubItem}
                    onUpdateSubItem={updateSubItem}
                    onDeleteSubItem={deleteSubItem}
                  />
                ))}

                {/* Add item */}
                <div className="board-row board-add-row" onClick={() => addItem(group.id)}>
                  <div className="board-cell board-cell-name" style={{ borderLeftColor: group.color, opacity: 0.5 }}>
                    <Plus size={14} /> Nuevo item
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {groups.length === 0 && (
          <div className="empty-state">
            <h4>Tablero vacio</h4>
            <p>Agrega un grupo para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}


function ItemRow({ item, columns, groupColor, onUpdate, onDelete, onAddSubItem, onUpdateSubItem, onDeleteSubItem }) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const handleNameSave = (newName) => {
    if (newName.trim() && newName !== item.name) {
      onUpdate(item.id, { name: newName });
    }
    setEditingName(false);
  };

  return (
    <>
      <div className="board-row board-item-row">
        <div className="board-cell board-cell-name" style={{ borderLeftColor: groupColor }}>
          <div className="cell-name-content">
            <button
              className="btn-icon btn-icon-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>

            {editingName ? (
              <input
                className="inline-edit"
                defaultValue={item.name}
                autoFocus
                onBlur={(e) => handleNameSave(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave(e.target.value);
                  if (e.key === 'Escape') setEditingName(false);
                }}
              />
            ) : (
              <span
                className="item-name"
                onDoubleClick={() => setEditingName(true)}
              >
                {item.name}
              </span>
            )}
          </div>
          <div className="item-actions">
            <button className="btn-icon btn-icon-xs" onClick={() => onAddSubItem(item.id)}>
              <Plus size={11} />
            </button>
            <button className="btn-icon btn-icon-xs btn-icon-danger" onClick={() => onDelete(item.id)}>
              <Trash2 size={11} />
            </button>
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.id} className="board-cell board-cell-col" style={{ width: col.width || 150, minWidth: col.width || 150 }}>
            <CellRenderer
              column={col}
              value={item.column_values?.[col.id]}
              onChange={(val) => onUpdate(item.id, { column_values: { [col.id]: val } })}
            />
          </div>
        ))}
      </div>

      {/* Sub-items */}
      {expanded && (item.subitems || []).map((si) => (
        <SubItemRow
          key={si.id}
          subitem={si}
          columns={columns}
          groupColor={groupColor}
          onUpdate={onUpdateSubItem}
          onDelete={onDeleteSubItem}
        />
      ))}
      {expanded && (
        <div
          className="board-row board-add-row board-subitem-indent"
          onClick={() => onAddSubItem(item.id)}
        >
          <div className="board-cell board-cell-name subitem-placeholder-cell">
            <Plus size={12} /> Sub-item
          </div>
        </div>
      )}
    </>
  );
}


function SubItemRow({ subitem, columns, groupColor, onUpdate, onDelete }) {
  const [editingName, setEditingName] = useState(false);

  const handleNameSave = (newName) => {
    if (newName.trim() && newName !== subitem.name) {
      onUpdate(subitem.id, { name: newName });
    }
    setEditingName(false);
  };

  return (
    <div className="board-row board-item-row board-subitem-row">
      <div className="board-cell board-cell-name subitem-indent-cell">
        <div className="cell-name-content">
          <span className="subitem-dot-icon" />
          {editingName ? (
            <input
              className="inline-edit subitem-count-text"
              defaultValue={subitem.name}
              autoFocus
              onBlur={(e) => handleNameSave(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave(e.target.value);
                if (e.key === 'Escape') setEditingName(false);
              }}
            />
          ) : (
            <span
              className="item-name subitem-count-text"
              onDoubleClick={() => setEditingName(true)}
            >
              {subitem.name}
            </span>
          )}
        </div>
        <div className="item-actions">
          <button className="btn-icon btn-icon-xs btn-icon-danger" onClick={() => onDelete(subitem.id)}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      {columns.map((col) => (
        <div key={col.id} className="board-cell board-cell-col" style={{ width: col.width || 150, minWidth: col.width || 150 }}>
          <CellRenderer
            column={col}
            value={subitem.column_values?.[col.id]}
            onChange={(val) => onUpdate(subitem.id, { column_values: { [col.id]: val } })}
          />
        </div>
      ))}
    </div>
  );
}

