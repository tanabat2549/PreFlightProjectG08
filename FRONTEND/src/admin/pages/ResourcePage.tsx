import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { adminApi, errMsg, unwrapList } from '../adminApi';
import { ConfirmModal, Modal, PageHead, Pager } from '../ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export type Field = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'date' | 'time' | 'checkbox';
  required?: boolean;
  /** false = ไม่แสดงในตาราง */
  list?: boolean;
  /** false = ไม่แสดงในฟอร์ม (อ่านอย่างเดียว) */
  form?: boolean;
  /** ดึงค่าสำหรับแสดงในตาราง เมื่อ key ตรง ๆ ใช้ไม่ได้ */
  get?: (row: Row) => ReactNode;
};

type Props = {
  title: string;
  subtitle?: string;
  /** path ต่อจาก /api/admin เช่น "/temples" */
  path: string;
  fields: Field[];
  canCreate?: boolean;
  /** วิธีส่งตอนแก้ไข; false = แก้ไม่ได้ */
  editMethod?: 'patch' | 'put' | false;
  deleteWarning?: string;
  rowLabel: (row: Row) => string;
};

const PAGE = 20;

export default function ResourcePage(p: Props) {
  const { path, fields, canCreate = true, editMethod = 'patch' } = p;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<{ row: Row | null; values: Record<string, string> } | null>(null);
  const [del, setDel] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [actErr, setActErr] = useState('');

  // backend บางตัว (เช่น /temples) แบ่งหน้าฝั่ง server และไม่ส่ง total
  // จึงดึงทีละ 200 แถวจนหมด (กันวนไม่รู้จบ: หยุดเมื่อหน้าซ้ำ, ไม่มี limit ใน response, หรือครบ 50 หน้า)
  const load = useCallback(() => {
    const LIMIT = 200;
    setLoading(true);
    (async () => {
      const all: Row[] = [];
      for (let page = 1; page <= 50; page++) {
        const r = await adminApi.get(path, { params: { page, limit: LIMIT } });
        const batch = unwrapList<Row>(r.data);
        if (batch.length && all.length && batch[0].id === all[all.length - LIMIT]?.id) break;
        all.push(...batch);
        const paged = r.data && typeof r.data === 'object' && 'limit' in r.data;
        if (!paged || batch.length < Number(r.data.limit)) break;
      }
      setRows(all);
      setErr('');
    })()
      .catch((e) => setErr(errMsg(e)))
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(k));
  }, [rows, q]);

  const view = filtered.slice((page - 1) * PAGE, page * PAGE);
  const cols = fields.filter((f) => f.list !== false);
  const formFields = fields.filter((f) => f.form !== false);

  function openForm(row: Row | null) {
    const values: Record<string, string> = {};
    for (const f of formFields) {
      const v = row?.[f.key];
      values[f.key] =
        f.type === 'checkbox' ? String(v === true)
        : v == null ? ''
        : f.type === 'date' ? String(v).slice(0, 10)
        : f.type === 'time' ? String(v).slice(0, 5)
        : String(v);
    }
    setActErr('');
    setForm({ row, values });
  }

  async function save() {
    if (!form) return;
    for (const f of formFields) {
      if (f.required && !form.values[f.key].trim()) return setActErr(`กรุณากรอก “${f.label}”`);
    }
    const body: Row = {};
    for (const f of formFields) {
      const v = form.values[f.key].trim();
      if (f.type === 'checkbox') body[f.key] = v === 'true';
      else if (f.type === 'number') { if (v !== '') body[f.key] = Number(v); }
      else if ((f.type === 'date' || f.type === 'time') && v === '') body[f.key] = null;
      else body[f.key] = v;
    }
    setBusy(true); setActErr('');
    try {
      if (form.row) await adminApi[editMethod || 'patch'](`${path}/${form.row.id}`, body);
      else await adminApi.post(path, body);
      setForm(null);
      load();
    } catch (e) {
      setActErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!del) return;
    setBusy(true); setActErr('');
    try {
      await adminApi.delete(`${path}/${del.id}`);
      setDel(null);
      load();
    } catch (e) {
      setActErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title={p.title}
        subtitle={p.subtitle}
        actions={canCreate && <button className="ad-btn primary" onClick={() => openForm(null)}>เพิ่มรายการ</button>}
      />

      <div className="ad-toolbar">
        <input className="ad-input" placeholder="ค้นหา" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>

      {err && <p className="ad-error">{err}</p>}

      <div className="ad-tablewrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th className="num">ID</th>
              {cols.map((c) => <th key={c.key}>{c.label}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && view.length === 0 && <tr><td colSpan={cols.length + 2} className="ad-muted">ไม่พบรายการ</td></tr>}
            {view.map((r) => (
              <tr key={r.id}>
                <td className="num">{r.id}</td>
                {cols.map((c) => {
                  const v = c.get ? c.get(r) : r[c.key];
                  return <td key={c.key}><span className="ad-clip">{v == null || v === '' ? '–' : v}</span></td>;
                })}
                <td className="actions">
                  {editMethod && <button className="ad-btn sm" onClick={() => openForm(r)}>แก้ไข</button>}
                  <button className="ad-btn sm danger-o" onClick={() => { setActErr(''); setDel(r); }}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager page={page} limit={PAGE} total={filtered.length} onPage={setPage} />

      {form && (
        <Modal
          title={form.row ? `แก้ไข ${p.rowLabel(form.row)}` : `เพิ่ม${p.title}`}
          onClose={() => setForm(null)}
          footer={
            <>
              <button className="ad-btn" onClick={() => setForm(null)} disabled={busy}>ยกเลิก</button>
              <button className="ad-btn primary" onClick={save} disabled={busy}>{busy ? 'กำลังบันทึก…' : 'บันทึก'}</button>
            </>
          }
        >
          {formFields.map((f) => (
            <label key={f.key} className="ad-field">
              <span>{f.label}{f.required && ' *'}</span>
              {f.type === 'checkbox' ? (
                <input type="checkbox" checked={form.values[f.key] === 'true'}
                  onChange={(e) => setForm({ ...form, values: { ...form.values, [f.key]: String(e.target.checked) } })} />
              ) : f.type === 'textarea' ? (
                <textarea className="ad-input" rows={3} value={form.values[f.key]}
                  onChange={(e) => setForm({ ...form, values: { ...form.values, [f.key]: e.target.value } })} />
              ) : (
                <input className="ad-input" type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text'}
                  step={f.type === 'number' ? 'any' : undefined} value={form.values[f.key]}
                  onChange={(e) => setForm({ ...form, values: { ...form.values, [f.key]: e.target.value } })} />
              )}
            </label>
          ))}
          {actErr && <p className="ad-error">{actErr}</p>}
        </Modal>
      )}

      {del && (
        <ConfirmModal title="ลบรายการ" confirmLabel="ลบ" danger busy={busy} error={actErr} onConfirm={remove} onClose={() => setDel(null)}>
          <p>ลบ <b>{p.rowLabel(del)}</b> ใช่หรือไม่</p>
          {p.deleteWarning && <p className="ad-muted">{p.deleteWarning}</p>}
        </ConfirmModal>
      )}
    </>
  );
}
