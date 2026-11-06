import { useId, useState, type ReactNode } from 'react';
import { SECTION_IDS, type SectionId } from '../data/portfolio';

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

type Base = { key: string; label: string; help?: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export type Field =
  | (Base & { type: 'text' | 'url' | 'email'; placeholder?: string; readOnly?: boolean; half?: boolean })
  | (Base & { type: 'textarea'; rows?: number })
  | (Base & { type: 'number'; half?: boolean })
  | (Base & { type: 'color'; half?: boolean })
  | (Base & { type: 'toggle' })
  | (Base & { type: 'select'; options: { value: string; label: string }[]; half?: boolean })
  | (Base & { type: 'list'; placeholder?: string; multiline?: boolean })
  | (Base & { type: 'palette' })
  | (Base & { type: 'group'; fields: Field[] })
  | (Base & {
      type: 'items';
      item: Field[];
      itemTitle: (v: Any, i: number) => string;
      newItem: () => Any;
      /** Fixed set: no add / remove / reorder. */
      fixed?: boolean;
      max?: number;
    })
  | (Base & { type: 'sectionOrder'; names: (id: SectionId) => string })
  | (Base & { type: 'sectionSet'; names: (id: SectionId) => string })
  | (Base & { type: 'evidence' });

/* ------------------------------------------------------------------ */
/* Path helpers (immutable)                                            */
/* ------------------------------------------------------------------ */

export function getPath(obj: Any, path: string): Any {
  if (!path) return obj;
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setPath(obj: Any, path: string, value: Any): Any {
  if (!path) return value;
  const [head, ...rest] = path.split('.');
  const copy = Array.isArray(obj) ? [...obj] : { ...(obj ?? {}) };
  const next = rest.length ? setPath(copy[head], rest.join('.'), value) : value;
  if (next === undefined) delete copy[head];
  else copy[head] = next;
  return copy;
}

/* ------------------------------------------------------------------ */
/* Renderer                                                            */
/* ------------------------------------------------------------------ */

export function Fields({ fields, value, onChange }: { fields: Field[]; value: Any; onChange: (v: Any) => void }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields.map((f, i) => (
        <FieldView
          key={`${f.key}-${i}`}
          field={f}
          value={getPath(value, f.key)}
          onChange={(v) => onChange(setPath(value, f.key, v))}
        />
      ))}
    </div>
  );
}

function Label({ htmlFor, children, help }: { htmlFor?: string; children: ReactNode; help?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-zinc-800">
        {children}
      </label>
      {help && <p className="mt-0.5 text-xs leading-snug text-zinc-500">{help}</p>}
    </div>
  );
}

function FieldView({ field: f, value, onChange }: { field: Field; value: Any; onChange: (v: Any) => void }) {
  const id = useId();
  const half = 'half' in f && f.half;
  const wrap = (node: ReactNode, wide = !half) => <div className={wide ? 'sm:col-span-2' : ''}>{node}</div>;

  switch (f.type) {
    case 'text':
    case 'url':
    case 'email':
      return wrap(
        <>
          <Label htmlFor={id} help={f.help}>{f.label}</Label>
          <input
            id={id}
            className="ad-input"
            type={f.type === 'text' ? 'text' : f.type}
            value={value ?? ''}
            placeholder={f.placeholder}
            readOnly={f.readOnly}
            disabled={f.readOnly}
            onChange={(e) => onChange(f.type === 'text' ? e.target.value : e.target.value.trim() || undefined)}
          />
        </>,
      );
    case 'number':
      return wrap(
        <>
          <Label htmlFor={id} help={f.help}>{f.label}</Label>
          <input id={id} className="ad-input" type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
        </>,
      );
    case 'textarea':
      return wrap(
        <>
          <Label htmlFor={id} help={f.help}>{f.label}</Label>
          <textarea id={id} className="ad-input" rows={f.rows ?? 3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </>,
      );
    case 'color':
      return wrap(
        <>
          <Label htmlFor={id} help={f.help}>{f.label}</Label>
          <ColorInput id={id} value={value ?? '#000000'} onChange={onChange} />
        </>,
      );
    case 'toggle':
      return wrap(
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span>
            <span className="block text-[13px] font-semibold text-zinc-800">{f.label}</span>
            {f.help && <span className="block text-xs text-zinc-500">{f.help}</span>}
          </span>
        </label>,
      );
    case 'select':
      return wrap(
        <>
          <Label htmlFor={id} help={f.help}>{f.label}</Label>
          <select id={id} className="ad-input" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}>
            {!f.options.some((o) => o.value === value) && value && <option value={value}>{value}</option>}
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </>,
      );
    case 'list':
      return wrap(
        <>
          <Label help={f.help}>{f.label}</Label>
          <StringList value={value ?? []} onChange={onChange} placeholder={f.placeholder} multiline={f.multiline} />
        </>,
      );
    case 'palette':
      return wrap(
        <>
          <Label help={f.help ?? 'Colours for this card’s background art.'}>{f.label}</Label>
          <PaletteInput value={value} onChange={onChange} />
        </>,
      );
    case 'group':
      return wrap(
        <fieldset className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
          <legend className="px-1 text-[13px] font-semibold text-zinc-800">{f.label}</legend>
          {f.help && <p className="-mt-1 mb-3 text-xs text-zinc-500">{f.help}</p>}
          <Fields fields={f.fields} value={value ?? {}} onChange={onChange} />
        </fieldset>,
      );
    case 'items':
      return wrap(
        <>
          <Label help={f.help}>{f.label}</Label>
          <ItemList field={f} value={value ?? []} onChange={onChange} />
        </>,
      );
    case 'sectionOrder':
      return wrap(
        <>
          <Label help={f.help}>{f.label}</Label>
          <SectionOrder value={value ?? []} onChange={onChange} names={f.names} />
        </>,
      );
    case 'sectionSet':
      return wrap(
        <>
          <Label help={f.help}>{f.label}</Label>
          <div className="flex flex-wrap gap-2">
            {SECTION_IDS.map((sid) => {
              const on = (value ?? []).includes(sid);
              return (
                <label key={sid} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] ${on ? 'border-brand bg-red-50 text-brand-dark' : 'border-zinc-200 bg-white text-zinc-700'}`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand"
                    checked={on}
                    onChange={(e) => onChange(e.target.checked ? [...(value ?? []), sid] : (value ?? []).filter((x: string) => x !== sid))}
                  />
                  {f.names(sid)}
                </label>
              );
            })}
          </div>
        </>,
      );
    case 'evidence':
      return wrap(
        <>
          <Label help={f.help}>{f.label}</Label>
          <EvidenceEditor value={value ?? {}} onChange={onChange} />
        </>,
      );
  }
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function ColorInput({ id, value, onChange }: { id?: string; value: string; onChange: (v: string) => void }) {
  const valid = /^#[0-9a-f]{6}$/i.test(value);
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="Pick colour"
        className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-zinc-300 bg-white p-0.5"
        value={valid ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)}
      />
      <input id={id} className="ad-input font-mono text-[13px]" value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
    </div>
  );
}

const PALETTE_PRESETS: Record<string, { from: string; via: string; to: string; accent: string }> = {
  Crimson: { from: '#24060b', via: '#6e0d1d', to: '#09070a', accent: '#ff3d5a' },
  Amber: { from: '#1c1003', via: '#6b3c06', to: '#0a0806', accent: '#ffb547' },
  Ocean: { from: '#04121f', via: '#0f4c6e', to: '#05080d', accent: '#4cc9ff' },
  Violet: { from: '#120822', via: '#3d1a6e', to: '#07060c', accent: '#b98bff' },
  Jade: { from: '#03150f', via: '#0d5a40', to: '#050a08', accent: '#46e3a8' },
};

function PaletteInput({ value, onChange }: { value: Any; onChange: (v: Any) => void }) {
  const v = value ?? PALETTE_PRESETS.Crimson;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {Object.entries(PALETTE_PRESETS).map(([name, p]) => {
          const active = p.from === v.from && p.via === v.via && p.accent === v.accent;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(p)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${active ? 'border-zinc-900 bg-white' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}
            >
              <span className="h-4 w-8 rounded" style={{ background: `linear-gradient(135deg, ${p.from}, ${p.via} 55%, ${p.to})`, boxShadow: `inset -6px 0 0 ${p.accent}` }} />
              {name}
            </button>
          );
        })}
      </div>
      <details className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-zinc-600">Custom colours</summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(['from', 'via', 'to', 'accent'] as const).map((k) => (
            <div key={k}>
              <p className="mb-1 text-xs capitalize text-zinc-500">{k}</p>
              <ColorInput value={v[k]} onChange={(c) => onChange({ ...v, [k]: c })} />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

function StringList({ value, onChange, placeholder, multiline }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <div className="space-y-2">
      {value.map((s, i) => (
        <div key={i} className="flex items-start gap-1.5">
          {multiline ? (
            <textarea className="ad-input !min-h-[60px]" rows={2} value={s} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          ) : (
            <input className="ad-input" value={s} placeholder={placeholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          )}
          <div className="flex shrink-0 pt-1">
            <button type="button" className="ad-icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))}>↑</button>
            <button type="button" className="ad-icon-btn" aria-label="Move down" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))}>↓</button>
            <button type="button" className="ad-icon-btn hover:!text-red-600" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
          </div>
        </div>
      ))}
      <button type="button" className="ad-btn ad-btn-ghost !py-1.5 !text-xs" onClick={() => onChange([...value, ''])}>
        + Add
      </button>
    </div>
  );
}

function ItemList({ field: f, value, onChange }: { field: Extract<Field, { type: 'items' }>; value: Any[]; onChange: (v: Any[]) => void }) {
  const [open, setOpen] = useState<number | null>(value.length === 1 ? 0 : null);
  const canAdd = !f.fixed && (f.max === undefined || value.length < f.max);

  return (
    <div className="space-y-2">
      {value.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`overflow-hidden rounded-xl border bg-white ${isOpen ? 'border-zinc-300 shadow-sm' : 'border-zinc-200'}`}>
            <div className="flex items-center gap-2 px-3 py-2">
              <button type="button" className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                <span className={`text-xs text-zinc-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                <span className="truncate text-sm font-medium text-zinc-800">{f.itemTitle(item, i) || <em className="text-zinc-400">Untitled</em>}</span>
              </button>
              {!f.fixed && (
                <div className="flex shrink-0">
                  <button type="button" className="ad-icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => { onChange(move(value, i, i - 1)); setOpen(isOpen ? i - 1 : open); }}>↑</button>
                  <button type="button" className="ad-icon-btn" aria-label="Move down" disabled={i === value.length - 1} onClick={() => { onChange(move(value, i, i + 1)); setOpen(isOpen ? i + 1 : open); }}>↓</button>
                  {canAdd && (
                    <button type="button" className="ad-icon-btn" aria-label="Duplicate" title="Duplicate" onClick={() => { onChange([...value.slice(0, i + 1), structuredClone(item), ...value.slice(i + 1)]); setOpen(i + 1); }}>⧉</button>
                  )}
                  <button
                    type="button"
                    className="ad-icon-btn hover:!text-red-600"
                    aria-label="Delete"
                    title="Delete"
                    onClick={() => {
                      if (confirm(`Delete “${f.itemTitle(item, i) || 'this item'}”?`)) {
                        onChange(value.filter((_, j) => j !== i));
                        setOpen(null);
                      }
                    }}
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>
            {isOpen && (
              <div className="border-t border-zinc-100 bg-zinc-50/50 p-4">
                <Fields fields={f.item} value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
              </div>
            )}
          </div>
        );
      })}
      {value.length === 0 && <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">Nothing here yet.</p>}
      {canAdd && (
        <button
          type="button"
          className="ad-btn ad-btn-ghost"
          onClick={() => {
            onChange([...value, f.newItem()]);
            setOpen(value.length);
          }}
        >
          + Add {f.label.replace(/s$/, '').toLowerCase()}
        </button>
      )}
    </div>
  );
}

function SectionOrder({ value, onChange, names }: { value: SectionId[]; onChange: (v: SectionId[]) => void; names: (id: SectionId) => string }) {
  // Keep every section in the list exactly once, even if the JSON was edited by hand.
  const order = [...value.filter((v) => SECTION_IDS.includes(v)), ...SECTION_IDS.filter((s) => !value.includes(s))];
  return (
    <ol className="space-y-1.5">
      {order.map((sid, i) => (
        <li key={sid} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5">
          <span className="w-5 text-xs font-semibold text-zinc-400">{i + 1}</span>
          <span className="flex-1 text-sm text-zinc-800">{names(sid)}</span>
          <button type="button" className="ad-icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => onChange(move(order, i, i - 1))}>↑</button>
          <button type="button" className="ad-icon-btn" aria-label="Move down" disabled={i === order.length - 1} onClick={() => onChange(move(order, i, i + 1))}>↓</button>
        </li>
      ))}
    </ol>
  );
}

function EvidenceEditor({ value, onChange }: { value: Record<string, string[]>; onChange: (v: Record<string, string[]>) => void }) {
  const entries = Object.entries(value);
  const set = (list: [string, string[]][]) => onChange(Object.fromEntries(list));
  return (
    <div className="space-y-2">
      {entries.map(([skill, refs], i) => (
        <div key={i} className="grid gap-2 rounded-lg border border-zinc-200 bg-white p-3 sm:grid-cols-[180px_1fr_auto]">
          <input
            className="ad-input"
            aria-label="Skill name"
            placeholder="Skill name (exact)"
            value={skill}
            onChange={(e) => set(entries.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))}
          />
          <input
            className="ad-input"
            aria-label="Where it is used"
            placeholder="Where it shows up, comma separated"
            value={refs.join(', ')}
            onChange={(e) => set(entries.map((x, j) => (j === i ? [x[0], e.target.value.split(',').map((s) => s.trimStart())] : x)))}
            onBlur={(e) => set(entries.map((x, j) => (j === i ? [x[0], e.target.value.split(',').map((s) => s.trim()).filter(Boolean)] : x)))}
          />
          <button type="button" className="ad-icon-btn self-center hover:!text-red-600" aria-label="Remove" onClick={() => set(entries.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="ad-btn ad-btn-ghost !py-1.5 !text-xs" onClick={() => set([...entries, ['', []]])}>
        + Add skill note
      </button>
    </div>
  );
}
