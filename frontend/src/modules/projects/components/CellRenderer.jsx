import { useState, useRef, useEffect } from 'react';
import { Check, Star, ExternalLink } from 'lucide-react';

/**
 * Renders an interactive cell based on the column type.
 * Supports: text, number, status, date, person, email, phone,
 * timeline, priority, checkbox, link, dropdown, rating
 */
export default function CellRenderer({ column, value, onChange }) {
  switch (column.column_type) {
    case 'text': return <TextCell value={value} onChange={onChange} />;
    case 'number': return <NumberCell value={value} onChange={onChange} />;
    case 'status': return <StatusCell value={value} onChange={onChange} settings={column.settings} />;
    case 'date': return <DateCell value={value} onChange={onChange} />;
    case 'person': return <PersonCell value={value} onChange={onChange} />;
    case 'email': return <EmailCell value={value} onChange={onChange} />;
    case 'phone': return <PhoneCell value={value} onChange={onChange} />;
    case 'timeline': return <TimelineCell value={value} onChange={onChange} />;
    case 'priority': return <PriorityCell value={value} onChange={onChange} settings={column.settings} />;
    case 'checkbox': return <CheckboxCell value={value} onChange={onChange} />;
    case 'link': return <LinkCell value={value} onChange={onChange} />;
    case 'dropdown': return <DropdownCell value={value} onChange={onChange} settings={column.settings} />;
    case 'rating': return <RatingCell value={value} onChange={onChange} settings={column.settings} />;
    default: return <TextCell value={value} onChange={onChange} />;
  }
}


// ── Text ────────────────────────────────────

function TextCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const save = () => {
    if (draft !== (value || '')) onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="cell-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        autoFocus
      />
    );
  }

  return (
    <div className="cell-display" onClick={() => { setDraft(value || ''); setEditing(true); }}>
      {value || <span className="cell-placeholder">—</span>}
    </div>
  );
}


// ── Number ──────────────────────────────────

function NumberCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');

  const save = () => {
    const num = draft === '' ? null : Number(draft);
    if (num !== value) onChange(num);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="cell-input"
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        autoFocus
      />
    );
  }

  return (
    <div className="cell-display" onClick={() => { setDraft(value ?? ''); setEditing(true); }}>
      {value != null ? value.toLocaleString('es-MX') : <span className="cell-placeholder">—</span>}
    </div>
  );
}


// ── Status ──────────────────────────────────

function StatusCell({ value, onChange, settings }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const labels = settings?.labels || {};

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const color = labels[value] || 'var(--text-muted)';

  return (
    <div ref={ref} className="cell-renderer-container">
      <div
        className="cell-status"
        style={{ background: color, color: '#fff' }}
        onClick={() => setOpen(!open)}
      >
        {value || 'Seleccionar'}
      </div>
      {open && (
        <div className="cell-dropdown-menu">
          {Object.entries(labels).map(([label, c]) => (
            <button
              key={label}
              className="cell-dropdown-option"
              onClick={() => { onChange(label); setOpen(false); }}
            >
              <span className="cell-color-dot" style={{ background: c }} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


// ── Date ────────────────────────────────────

function DateCell({ value, onChange }) {
  return (
    <input
      className="cell-input cell-date"
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}


// ── Person ──────────────────────────────────

function PersonCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const save = () => {
    if (draft !== (value || '')) onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="cell-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        placeholder="Nombre"
        autoFocus
      />
    );
  }

  return (
    <div className="cell-display" onClick={() => { setDraft(value || ''); setEditing(true); }}>
      {value ? (
        <div className="cell-person-wrapper">
          <span className="cell-avatar">{value.charAt(0).toUpperCase()}</span>
          <span>{value}</span>
        </div>
      ) : <span className="cell-placeholder">—</span>}
    </div>
  );
}


// ── Email ───────────────────────────────────

function EmailCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const save = () => {
    if (draft !== (value || '')) onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="cell-input"
        type="email"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        placeholder="correo@ejemplo.com"
        autoFocus
      />
    );
  }

  return (
    <div className="cell-display" onClick={() => { setDraft(value || ''); setEditing(true); }}>
      {value ? (
        <span className="cell-link-text">{value}</span>
      ) : <span className="cell-placeholder">—</span>}
    </div>
  );
}


// ── Phone ───────────────────────────────────

function PhoneCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const save = () => {
    if (draft !== (value || '')) onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="cell-input"
        type="tel"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        placeholder="(123) 456-7890"
        autoFocus
      />
    );
  }

  return (
    <div className="cell-display" onClick={() => { setDraft(value || ''); setEditing(true); }}>
      {value || <span className="cell-placeholder">—</span>}
    </div>
  );
}


// ── Timeline ────────────────────────────────

function TimelineCell({ value, onChange }) {
  const start = value?.start || '';
  const end = value?.end || '';

  const update = (field, val) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="cell-timeline">
      <input
        className="cell-input cell-date cell-timeline-input"
        type="date"
        value={start}
        onChange={(e) => update('start', e.target.value)}
      />
      <span className="timeline-arrow">→</span>
      <input
        className="cell-input cell-date cell-timeline-input"
        type="date"
        value={end}
        onChange={(e) => update('end', e.target.value)}
      />
    </div>
  );
}


// ── Priority ────────────────────────────────

function PriorityCell({ value, onChange, settings }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const labels = settings?.labels || {};

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const color = labels[value] || 'var(--text-muted)';

  return (
    <div ref={ref} className="cell-renderer-container">
      <div
        className="cell-priority"
        onClick={() => setOpen(!open)}
      >
        <span className="cell-color-dot" style={{ background: color }} />
        {value || 'Seleccionar'}
      </div>
      {open && (
        <div className="cell-dropdown-menu">
          {Object.entries(labels).map(([label, c]) => (
            <button
              key={label}
              className="cell-dropdown-option"
              onClick={() => { onChange(label); setOpen(false); }}
            >
              <span className="cell-color-dot" style={{ background: c }} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


// ── Checkbox ────────────────────────────────

function CheckboxCell({ value, onChange }) {
  return (
    <div className="cell-checkbox" onClick={() => onChange(!value)}>
      <div className={`cell-check-box ${value ? 'checked' : ''}`}>
        {value && <Check size={12} />}
      </div>
    </div>
  );
}


// ── Link ────────────────────────────────────

function LinkCell({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');

  const save = () => {
    if (draft !== (value || '')) onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className="cell-input"
        type="url"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        placeholder="https://..."
        autoFocus
      />
    );
  }

  return (
    <div className="cell-display" onClick={() => { setDraft(value || ''); setEditing(true); }}>
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="cell-link-anchor"
        >
          <ExternalLink size={12} /> Link
        </a>
      ) : <span className="cell-placeholder">—</span>}
    </div>
  );
}


// ── Dropdown ────────────────────────────────

function DropdownCell({ value, onChange, settings }) {
  const options = settings?.options || [];
  return (
    <select
      className="cell-input cell-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Seleccionar</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}


// ── Rating ──────────────────────────────────

function RatingCell({ value, onChange, settings }) {
  const max = settings?.max || 5;
  const current = value || 0;

  return (
    <div className="cell-rating">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={`cell-star ${i < current ? 'filled' : ''}`}
          onClick={() => onChange(i + 1 === current ? 0 : i + 1)}
        />
      ))}
    </div>
  );
}
