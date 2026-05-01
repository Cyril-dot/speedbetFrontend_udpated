import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { admin, matches as matchesApi } from '../../api';
import { useStore } from '../../store';
import { fmtMoney, fmtTimeAgo } from '../../utils';
import AdminShell from './AdminShell';

// ─── CONSTANTS ────────────────────────────────────────────────
const MARKETS = [
  { value: '1X2',           label: '1X2 Match Result',    picks: ['Home Win', 'Draw', 'Away Win'] },
  { value: 'WIN_ONLY',      label: 'Home / Away Win',     picks: ['Home Win', 'Away Win'] },
  { value: 'BTTS',          label: 'Both Teams To Score', picks: ['Yes', 'No'] },
  { value: 'OVER_UNDER',    label: 'Over / Under',        picks: ['Over', 'Under'], hasLine: true },
  { value: 'HANDICAP',      label: 'Handicap',            picks: [], hasHandicap: true },
  { value: 'CORRECT_SCORE', label: 'Correct Score',       picks: [], hasScore: true },
  { value: 'HT_FT',         label: 'HT / FT',             picks: [], hasHtFt: true },
];

const STATUS_COLORS = {
  active:   { bg: '#22c55e22', text: '#22c55e', dot: '#22c55e' },
  expired:  { bg: '#ffffff18', text: '#ffffff60', dot: '#ffffff40' },
  void:     { bg: '#ef444422', text: '#ef4444', dot: '#ef4444' },
  settled:  { bg: '#3b82f622', text: '#3b82f6', dot: '#3b82f6' },
};

// ─── ICONS (inline SVG) ───────────────────────────────────────
const Icon = {
  Plus:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
  Share: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49"/></svg>,
  Clock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  X:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Copy:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Eye:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Ticket:() => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>,
  Zap:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
};

// ─── HELPERS ──────────────────────────────────────────────────
function deriveKind(selections) {
  if (!selections?.length) return '1X2';
  if (selections.length === 1) return selections[0].market;
  const markets = new Set(selections.map(s => s.market));
  return markets.size === 1 ? selections[0].market : 'MIXED';
}

function isExpired(expiresAt) {
  return expiresAt && new Date(expiresAt) < new Date();
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function BookingCodes() {
  const [codes, setCodes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewCode, setViewCode]     = useState(null);
  const pushToast                   = useStore(s => s.pushToast);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await admin.bookingCodes();
        if (!cancelled) setCodes(data.content ?? data);
      } catch (err) {
        console.error('BookingCodes: load failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCreate = useCallback(newCode => {
    setCodes(prev => [newCode, ...prev]);
    pushToast({ variant: 'win', title: 'Code created', message: newCode.code });
    setCreateOpen(false);
  }, [pushToast]);

  const stats = useMemo(() => {
    const active   = codes.filter(c => c.status === 'active' && !isExpired(c.expiresAt ?? c.expires_at)).length;
    const redeemed = codes.reduce((s, c) => s + (c.redemptionCount ?? c.redemption_count ?? 0), 0);
    const avgOdds  = codes.length
      ? (codes.reduce((s, c) => s + +(c.totalOdds ?? c.total_odds ?? 0), 0) / codes.length).toFixed(2)
      : null;
    const avgStake = codes.length
      ? codes.reduce((s, c) => s + +(c.stake ?? 0), 0) / codes.length
      : null;
    return { active, redeemed, avgOdds, avgStake };
  }, [codes]);

  return (
    <AdminShell
      title="Booking Codes"
      kicker="Admin · Slip Builder"
      actions={
        <button
          onClick={() => setCreateOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: 'var(--brand)', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, letterSpacing: '0.01em',
          }}
        >
          <Icon.Plus /> New Code
        </button>
      }
    >
      {/* ── Stats Bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Active Codes',      value: loading ? '—' : stats.active,                                    color: 'var(--text-100)' },
          { label: 'Total Redemptions', value: loading ? '—' : stats.redeemed,                                  color: 'var(--brand)' },
          { label: 'Avg Total Odds',    value: loading ? '—' : stats.avgOdds ? stats.avgOdds + 'x' : '—',       color: 'var(--win)' },
          { label: 'Avg Stake',         value: loading ? '—' : stats.avgStake ? fmtMoney(stats.avgStake) : '—', color: 'var(--vip)' },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Section header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--text-60)', marginBottom: 3 }}>
            {loading ? 'Loading…' : `${codes.length} codes`}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-100)' }}>Live Codes</div>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <LoadingSkeleton />
      ) : codes.length === 0 ? (
        <EmptyState onNew={() => setCreateOpen(true)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {codes.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3 }}
            >
              <CodeCard code={c} onView={() => setViewCode(c)} />
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {createOpen && (
          <CreateCodeModal key="create" onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
        )}
        {viewCode && (
          <ViewSelectionsModal key="view" code={viewCode} onClose={() => setViewCode(null)} />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--surface-1)', borderRadius: 12,
      padding: '16px 18px', border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--text-60)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ─── CODE CARD ────────────────────────────────────────────────
function CodeCard({ code, onView }) {
  const [copied, setCopied] = useState(false);

  const totalOdds       = +(code.totalOdds       ?? code.total_odds       ?? 0);
  const potentialPayout = +(code.potentialPayout  ?? code.potential_payout ?? 0);
  const redemptionCount = +(code.redemptionCount  ?? code.redemption_count ?? 0);
  const maxRedemptions  =   code.maxRedemptions   ?? code.max_redemptions  ?? null;
  const expiresAt       =   code.expiresAt        ?? code.expires_at       ?? null;
  const expired         = isExpired(expiresAt);
  const status          = expired ? 'expired' : (code.status ?? 'active');
  const sc              = STATUS_COLORS[status] ?? STATUS_COLORS.expired;
  const selCount        = code.selections?.length ?? 0;

  const copyCode = async e => {
    e.stopPropagation();
    await navigator.clipboard.writeText(code.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: 'var(--surface-1)', borderRadius: 14,
        border: '1px solid var(--border)', overflow: 'hidden',
        transition: 'border-color .15s, box-shadow .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 4px 20px #0003'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Top stripe */}
      <div style={{ height: 3, background: sc.text, opacity: 0.7 }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: 'var(--brand)', letterSpacing: '0.06em' }}>
              {code.code}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-80)', marginTop: 2, fontWeight: 500 }}>
              {code.label || '—'}
            </div>
          </div>
          <span style={{
            padding: '3px 8px', borderRadius: 6, fontSize: 10,
            fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            background: sc.bg, color: sc.text,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
            {status}
          </span>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <MiniStat label="Stake"      value={fmtMoney(code.stake)} />
          <MiniStat label="Total Odds" value={totalOdds.toFixed(2) + 'x'} accent="var(--brand)" />
          <MiniStat label="Potential"  value={fmtMoney(potentialPayout)}   accent="var(--win)" />
          <MiniStat
            label="Redeemed"
            value={`${redemptionCount}${maxRedemptions != null ? ' / ' + maxRedemptions : ''}`}
          />
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-60)', marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon.Ticket />
            <span>{selCount} selection{selCount !== 1 ? 's' : ''}</span>
          </span>
          <span style={{ opacity: .4 }}>·</span>
          <span style={{
            padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            background: 'var(--brand-bg)', color: 'var(--brand)',
          }}>{code.kind}</span>
          {expiresAt && (
            <>
              <span style={{ opacity: .4 }}>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Icon.Clock /> {fmtTimeAgo(expiresAt)}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onView} style={btnStyle('outline')}>
            <Icon.Eye /> View
          </button>
          <button onClick={copyCode} style={btnStyle(copied ? 'win' : 'ghost')}>
            {copied ? <><Icon.Check /> Copied!</> : <><Icon.Copy /> Copy Code</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MINI STAT ────────────────────────────────────────────────
function MiniStat({ label, value, accent = 'var(--text-100)' }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--text-60)', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: accent }}>
        {value}
      </div>
    </div>
  );
}

// ─── LOADING SKELETON ─────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--surface-1)', borderRadius: 14, height: 220, border: '1px solid var(--border)', opacity: 1 - i * 0.12 }}>
          <div style={{ height: 3, background: 'var(--border)' }} />
          <div style={{ padding: 18 }}>
            {[60, 100, 40].map((w, j) => (
              <div key={j} style={{ height: 14, width: `${w}%`, background: 'var(--surface-2)', borderRadius: 6, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${j * 0.1}s` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────
function EmptyState({ onNew }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-60)' }}>
      <Icon.Ticket />
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-80)', marginTop: 12, marginBottom: 6 }}>No booking codes yet</div>
      <div style={{ fontSize: 13, marginBottom: 20 }}>Create your first code to share pre-built slips with bettors.</div>
      <button onClick={onNew} style={{ ...btnStyle('primary'), margin: '0 auto' }}>
        <Icon.Plus /> Create First Code
      </button>
    </div>
  );
}

// ─── MODAL SHELL ──────────────────────────────────────────────
function ModalShell({ title, onClose, children }) {
  const handleBackdrop = e => { if (e.target === e.currentTarget) onClose(); };

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'var(--surface-0)', borderRadius: 16,
          border: '1px solid var(--border)', width: '100%', maxWidth: 520,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-100)' }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: 'var(--text-60)', display: 'flex' }}
          >
            <Icon.X />
          </button>
        </div>
        {/* Modal body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CREATE CODE MODAL ────────────────────────────────────────
function CreateCodeModal({ onClose, onCreate }) {
  const currency = useStore(s => s.currency);
  const [form, setForm]         = useState({ label: '', stake: 10, expires_in_hours: 24, selections: [] });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const totalOdds = useMemo(
    () => form.selections.reduce((p, s) => p * s.odds, 1),
    [form.selections]
  );
  const potential = +(form.stake * totalOdds).toFixed(2);
  const kind = useMemo(() => deriveKind(form.selections), [form.selections]);

  const addSelection = sel => {
    if (form.selections.find(s => s.fixture_id === sel.fixture_id)) {
      setError('That fixture is already in this slip.');
      return;
    }
    setError('');
    setForm(f => ({ ...f, selections: [...f.selections, sel] }));
    setPickerOpen(false);
  };

  const removeSelection = idx =>
    setForm(f => ({ ...f, selections: f.selections.filter((_, i) => i !== idx) }));

  const validate = () => {
    if (!form.label.trim())                                    return 'Label is required';
    if (!form.selections.length)                               return 'Add at least 1 selection';
    if (form.selections.length > 20)                           return 'Max 20 selections';
    if (form.stake < 1)                                        return 'Min stake 1';
    if (form.selections.some(s => s.odds < 1.10))             return 'Min odds per selection: 1.10';
    if (totalOdds > 10000)                                     return 'Max total odds: 10,000';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSubmitting(true);
    try {
      const expiresAt = new Date(Date.now() + form.expires_in_hours * 3_600_000).toISOString();
      const newCode = await admin.createBookingCode({
        kind,
        label:      form.label.trim(),
        stake:      +form.stake,
        currency,
        selections: form.selections,
        expiresAt,
      });
      onCreate(newCode);
    } catch (err) {
      setError('Failed to create code: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Create Booking Code" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Label */}
        <Field label="Label">
          <input
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder="e.g. Weekend Big 4"
            style={inputStyle}
          />
        </Field>

        {/* Stake / Expiry */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label={`Stake (${currency})`}>
            <input
              type="number" min="1"
              value={form.stake}
              onChange={e => setForm(f => ({ ...f, stake: +e.target.value || 0 }))}
              style={inputStyle}
            />
          </Field>
          <Field label="Expires in (hours)">
            <input
              type="number" min="1"
              value={form.expires_in_hours}
              onChange={e => setForm(f => ({ ...f, expires_in_hours: +e.target.value || 24 }))}
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Selections */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label style={fieldLabelStyle}>Selections ({form.selections.length})</label>
            <button onClick={() => setPickerOpen(true)} style={btnStyle('outline')}>
              <Icon.Plus /> Add Match
            </button>
          </div>

          {form.selections.length === 0 ? (
            <div style={{
              padding: '20px 16px', textAlign: 'center', borderRadius: 10,
              border: '2px dashed var(--border)', color: 'var(--text-60)', fontSize: 13,
            }}>
              No selections yet — tap <strong>Add Match</strong> to build your slip.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {form.selections.map((s, i) => (
                <SelectionRow key={i} sel={s} onRemove={() => removeSelection(i)} />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={{
          borderRadius: 12, padding: '14px 16px',
          background: 'var(--brand-bg)', border: '1px solid var(--brand)',
          display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 12, alignItems: 'center',
        }}>
          <div>
            <div style={summaryLabelStyle}>Kind</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--brand)' }}>{kind}</div>
          </div>
          <div>
            <div style={summaryLabelStyle}>Total Odds</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 22, color: 'var(--brand)', lineHeight: 1 }}>
              {totalOdds.toFixed(2)}x
            </div>
          </div>
          <div>
            <div style={summaryLabelStyle}>Potential Payout</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 22, color: 'var(--win)', lineHeight: 1 }}>
              {fmtMoney(potential)}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: 'var(--loss)', background: '#ef444415', borderRadius: 8, padding: '8px 12px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ ...btnStyle('ghost'), flex: 1, justifyContent: 'center', padding: '11px 0' }}>
            Cancel
          </button>
          <button onClick={submit} disabled={submitting} style={{ ...btnStyle('primary'), flex: 1, justifyContent: 'center', padding: '11px 0', opacity: submitting ? .6 : 1 }}>
            {submitting ? 'Creating…' : <><Icon.Zap /> Create Code</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {pickerOpen && (
          <SelectionPicker onPick={addSelection} onClose={() => setPickerOpen(false)} />
        )}
      </AnimatePresence>
    </ModalShell>
  );
}

// ─── SELECTION ROW ────────────────────────────────────────────
function SelectionRow({ sel, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 10,
      background: 'var(--surface-2)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-100)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sel.match}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-60)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--surface-0)', fontWeight: 700, fontSize: 10, color: 'var(--brand)' }}>
            {sel.market}
          </span>
          <span>{sel.pick}</span>
          {sel.line != null && <span>· Line {sel.line}</span>}
        </div>
      </div>
      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'var(--brand)', flexShrink: 0 }}>
        {sel.odds.toFixed(2)}
      </div>
      <button
        onClick={onRemove}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--loss)', padding: 4, borderRadius: 6, display: 'flex' }}
        aria-label="Remove"
      >
        <Icon.X />
      </button>
    </div>
  );
}

// ─── SELECTION PICKER ─────────────────────────────────────────
function SelectionPicker({ onPick, onClose }) {
  const [allMatches, setAllMatches]     = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [match,    setMatch]    = useState(null);
  const [market,   setMarket]   = useState(MARKETS[0]);
  const [pick,     setPick]     = useState('');
  const [line,     setLine]     = useState(2.5);
  const [team,     setTeam]     = useState('');
  const [handicap, setHandicap] = useState(-1);
  const [home,     setHome]     = useState(2);
  const [away,     setAway]     = useState(1);
  const [ht,       setHt]       = useState('Home Win');
  const [ft,       setFt]       = useState('Home Win');
  const [odds,     setOdds]     = useState(2.0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await matchesApi.upcoming();
        if (!cancelled) setAllMatches(data);
      } catch (err) {
        console.error('SelectionPicker: load failed', err);
      } finally {
        if (!cancelled) setLoadingMatches(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const playableMatches = allMatches.filter(m => m.status === 'UPCOMING' || m.status === 'LIVE');

  const buildSelection = () => {
    const base = {
      fixture_id: match.id,
      match: `${match.homeTeam} vs ${match.awayTeam}`,
      market: market.value,
      odds: +odds,
      result: null,
    };
    if (['1X2', 'WIN_ONLY', 'BTTS'].includes(market.value)) {
      base.pick = pick;
    } else if (market.value === 'OVER_UNDER') {
      base.line = +line;
      base.pick = pick;
    } else if (market.value === 'HANDICAP') {
      base.team = team;
      base.handicap = +handicap;
      base.pick = `${team} ${handicap > 0 ? '+' : ''}${handicap}`;
    } else if (market.value === 'CORRECT_SCORE') {
      base.home_goals = +home;
      base.away_goals = +away;
      base.pick = `${home}-${away}`;
    } else if (market.value === 'HT_FT') {
      base.ht_result = ht;
      base.ft_result = ft;
      const short = v => v.split(' ')[0];
      base.pick = `${short(ht)} / ${short(ft)}`;
    }
    return base;
  };

  const canSubmit = () => {
    if (!match || +odds < 1.1) return false;
    if (['1X2', 'WIN_ONLY', 'BTTS', 'OVER_UNDER'].includes(market.value) && !pick) return false;
    if (market.value === 'HANDICAP' && !team) return false;
    return true;
  };

  return (
    <ModalShell title="Add Selection" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Match select */}
        <Field label="Match">
          {loadingMatches ? (
            <div style={{ ...inputStyle, color: 'var(--text-60)' }}>Loading matches…</div>
          ) : (
            <select
              value={match?.id || ''}
              onChange={e => { setMatch(playableMatches.find(m => m.id === e.target.value) || null); setPick(''); setTeam(''); }}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">— Choose a match —</option>
              {playableMatches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.homeTeam} vs {m.awayTeam} · {m.league}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Market pills */}
        <Field label="Market">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {MARKETS.map(m => (
              <button
                key={m.value}
                onClick={() => { setMarket(m); setPick(''); }}
                style={{
                  padding: '8px 10px', borderRadius: 8, border: 'none',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                  background: market.value === m.value ? 'var(--brand)' : 'var(--surface-2)',
                  color: market.value === m.value ? '#fff' : 'var(--text-80)',
                  transition: 'background .12s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Picks */}
        {market.picks.length > 0 && (
          <Field label="Pick">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {market.picks.map(p => (
                <button
                  key={p}
                  onClick={() => setPick(p)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: 'none',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: pick === p ? 'var(--brand)' : 'var(--surface-2)',
                    color: pick === p ? '#fff' : 'var(--text-80)',
                    transition: 'background .12s',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
        )}

        {market.hasLine && (
          <Field label="Line">
            <input type="number" step="0.5" value={line} onChange={e => setLine(e.target.value)} style={inputStyle} />
          </Field>
        )}

        {market.hasHandicap && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Team">
              <select value={team} onChange={e => setTeam(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Choose…</option>
                {match && <option value={match.homeTeam}>{match.homeTeam}</option>}
                {match && <option value={match.awayTeam}>{match.awayTeam}</option>}
              </select>
            </Field>
            <Field label="Handicap">
              <input type="number" step="0.5" value={handicap} onChange={e => setHandicap(e.target.value)} style={inputStyle} />
            </Field>
          </div>
        )}

        {market.hasScore && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Home Goals"><input type="number" min="0" max="10" value={home} onChange={e => setHome(+e.target.value)} style={inputStyle} /></Field>
            <Field label="Away Goals"><input type="number" min="0" max="10" value={away} onChange={e => setAway(+e.target.value)} style={inputStyle} /></Field>
          </div>
        )}

        {market.hasHtFt && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Half-Time">
              <select value={ht} onChange={e => setHt(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {['Home Win', 'Draw', 'Away Win'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Full-Time">
              <select value={ft} onChange={e => setFt(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {['Home Win', 'Draw', 'Away Win'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
          </div>
        )}

        <Field label="Odds">
          <input type="number" step="0.01" min="1.10" value={odds} onChange={e => setOdds(+e.target.value)} style={inputStyle} />
        </Field>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ ...btnStyle('ghost'), flex: 1, justifyContent: 'center', padding: '11px 0' }}>Cancel</button>
          <button
            onClick={() => onPick(buildSelection())}
            disabled={!canSubmit()}
            style={{ ...btnStyle('primary'), flex: 1, justifyContent: 'center', padding: '11px 0', opacity: canSubmit() ? 1 : .4 }}
          >
            Add Selection
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── VIEW SELECTIONS MODAL ────────────────────────────────────
function ViewSelectionsModal({ code, onClose }) {
  const [copied, setCopied] = useState(false);
  const totalOdds       = +(code.totalOdds       ?? code.total_odds       ?? 0);
  const potentialPayout = +(code.potentialPayout  ?? code.potential_payout ?? 0);

  const share = async () => {
    await navigator.clipboard.writeText(code.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalShell title={`Code · ${code.code}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Summary banner */}
        <div style={{ borderRadius: 10, padding: '12px 14px', background: 'var(--brand-bg)', border: '1px solid var(--brand)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-100)', marginBottom: 4 }}>{code.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-60)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span>Stake {fmtMoney(code.stake)}</span>
            <span>·</span>
            <span>Odds <strong style={{ color: 'var(--brand)' }}>{totalOdds.toFixed(2)}x</strong></span>
            <span>·</span>
            <span>Payout <strong style={{ color: 'var(--win)' }}>{fmtMoney(potentialPayout)}</strong></span>
          </div>
        </div>

        {/* Selections list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(code.selections ?? []).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--surface-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-60)', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-100)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.match ?? s.homeTeam ?? 'Unknown match'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-60)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--surface-0)', fontWeight: 700, fontSize: 10, color: 'var(--brand)' }}>
                    {s.market}
                  </span>
                  <span>{s.pick}</span>
                  {s.line != null && <span>· Line {s.line}</span>}
                </div>
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'var(--brand)', flexShrink: 0 }}>
                {(+s.odds).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ ...btnStyle('ghost'), flex: 1, justifyContent: 'center', padding: '11px 0' }}>Close</button>
          <button onClick={share} style={{ ...btnStyle(copied ? 'win' : 'primary'), flex: 1, justifyContent: 'center', padding: '11px 0' }}>
            {copied ? <><Icon.Check /> Copied!</> : <><Icon.Copy /> Copy Code</>}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── SHARED STYLE HELPERS ─────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      {children}
    </div>
  );
}

const fieldLabelStyle = {
  display: 'block',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 700,
  color: 'var(--text-60)',
  marginBottom: 6,
};

const summaryLabelStyle = {
  fontSize: 9,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 700,
  color: 'var(--text-60)',
  marginBottom: 2,
};

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface-0)',
  color: 'var(--text-100)',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  appearance: 'none',
};

function btnStyle(variant) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: 'none', transition: 'opacity .12s, background .12s',
    letterSpacing: '0.01em', whiteSpace: 'nowrap',
  };
  switch (variant) {
    case 'primary': return { ...base, background: 'var(--brand)', color: '#fff' };
    case 'outline': return { ...base, background: 'transparent', color: 'var(--text-80)', border: '1px solid var(--border)' };
    case 'ghost':   return { ...base, background: 'var(--surface-2)', color: 'var(--text-80)' };
    case 'win':     return { ...base, background: 'var(--win)', color: '#fff' };
    default:        return base;
  }
}