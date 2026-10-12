import { useEffect } from 'react';
import type { ReactNode } from 'react';

export function fmtDate(v: string | null | undefined, withTime = false): string {
  if (!v) return '–';
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString('th-TH', withTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' });
}

export function Modal(props: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const { title, onClose, children, footer } = props;
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="ad-overlay" onMouseDown={onClose}>
      <div className="ad-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="ad-modal-body">{children}</div>
        {footer && <div className="ad-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal(props: {
  title: string; children: ReactNode; confirmLabel: string; danger?: boolean;
  busy?: boolean; error?: string; onConfirm: () => void; onClose: () => void;
}) {
  const { title, children, confirmLabel, danger, busy, error, onConfirm, onClose } = props;
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="ad-btn" onClick={onClose} disabled={busy}>ยกเลิก</button>
          <button className={`ad-btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'กำลังดำเนินการ…' : confirmLabel}
          </button>
        </>
      }
    >
      {children}
      {error && <p className="ad-error">{error}</p>}
    </Modal>
  );
}

export function Pager(props: { page: number; limit: number; total: number; onPage: (p: number) => void }) {
  const { page, limit, total, onPage } = props;
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="ad-pager">
      <span>ทั้งหมด {total.toLocaleString('th-TH')} รายการ</span>
      <div>
        <button className="ad-btn sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>ก่อนหน้า</button>
        <span className="ad-pager-no">{page} / {pages}</span>
        <button className="ad-btn sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>ถัดไป</button>
      </div>
    </div>
  );
}

export function PageHead(props: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="ad-head">
      <div>
        <h1>{props.title}</h1>
        {props.subtitle && <p>{props.subtitle}</p>}
      </div>
      <div className="ad-head-actions">{props.actions}</div>
    </div>
  );
}
