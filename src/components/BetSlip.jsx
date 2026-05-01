import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { fmtMoney, fmtMoneyWithCode } from '../utils';
import { booking } from '../api'; // ← SpeedBet API service

// ─── Icons (inline, no external deps) ────────────────────────────────────────

const Icon = {
  Close: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  ),
  Trash: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  ),
  Receipt: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
      <line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="13" y2="14" />
    </svg>
  ),
  Check: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 12 10 17 19 7" />
    </svg>
  ),
  X: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  ),
  Clock: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
    </svg>
  ),
  Trophy: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12M6 2v8a6 6 0 0012 0V2" /><path d="M6 7H4a2 2 0 000 4h2M18 7h2a2 2 0 010 4h-2" />
      <path d="M12 18v4M8 22h8" />
    </svg>
  ),
  Bolt: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  ChevronRight: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Return: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 00-4-4H4" />
    </svg>
  ),
  HalfCheck: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 12 10 17 19 7" /><line x1="12" y1="3" x2="12" y2="7" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  ),
  Code: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h1v1h-1zM19 14h1v1h-1zM14 19h1v1h-1zM17 17h3v3h-3z" />
    </svg>
  ),
  Loader: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  ArrowRight: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

// ─── Tiny Confetti ─────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    dur: 2 + Math.random() * 2,
    delay: Math.random() * 1.5,
    color: ['#E8003D', '#FFB300', '#22d77a', '#CCFF00', '#fff'][Math.floor(Math.random() * 5)],
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -10, opacity: 1, rotate: 0 }}
          animate={{ y: 360, opacity: 0, rotate: 720 }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: 5,
            height: 10,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

// ─── Result display config ────────────────────────────────────────────────────

const RESULT_CONFIG = {
  WON:       { color: '#22d77a', bg: 'rgba(34,215,122,0.05)',  border: 'rgba(34,215,122,0.2)',  label: 'Won',       icon: (s) => <Icon.Check size={s} /> },
  HALF_WON:  { color: '#22d77a', bg: 'rgba(34,215,122,0.03)',  border: 'rgba(34,215,122,0.12)', label: 'Half Win',  icon: (s) => <Icon.HalfCheck size={s} /> },
  LOST:      { color: '#DC2626', bg: 'rgba(220,38,38,0.05)',   border: 'rgba(220,38,38,0.2)',   label: 'Lost',      icon: (s) => <Icon.X size={s} /> },
  HALF_LOST: { color: '#DC2626', bg: 'rgba(220,38,38,0.03)',   border: 'rgba(220,38,38,0.12)',  label: 'Half Loss', icon: (s) => <Icon.X size={s} /> },
  PUSH:      { color: '#9CA3AF', bg: 'rgba(156,163,175,0.05)', border: 'rgba(156,163,175,0.2)', label: 'Push',      icon: (s) => <Icon.Return size={s} /> },
  VOID:      { color: '#9CA3AF', bg: 'rgba(156,163,175,0.05)', border: 'rgba(156,163,175,0.2)', label: 'Void',      icon: (s) => <Icon.Return size={s} /> },
  PENDING:   { color: '#FFB300', bg: 'var(--surface-2)',        border: 'var(--border)',          label: 'Pending',   icon: (s) => <Icon.Clock size={s} /> },
};

function getResultConfig(result) {
  return RESULT_CONFIG[result] ?? RESULT_CONFIG.PENDING;
}

// ─── Shared label builder ─────────────────────────────────────────────────────
// Used for BOTH slip items (before placing) and settled bet selections.
// Checks every field name the backend or store might use, in priority order.

function buildMatchLabel(s) {
  if (!s) return 'Unknown match';
  // Explicit label fields (set by booking code loader or normaliser)
  if (s.matchLabel)   return s.matchLabel;
  if (s.match_label)  return s.match_label;
  if (s.match)        return s.match;
  // Team pair — camelCase (Spring Jackson default) or snake_case
  const home = s.homeTeam  ?? s.home_team;
  const away = s.awayTeam  ?? s.away_team;
  if (home && away)   return `${home} vs ${away}`;
  // Last resort — short ID suffix so it's at least identifiable
  const id = s.matchId ?? s.match_id ?? '';
  return id ? `Match …${String(id).slice(-6)}` : 'Unknown match';
}

// ─── Normalise a settled bet from the API ─────────────────────────────────────

function normaliseBet(bet) {
  if (!bet) return bet;
  return {
    ...bet,
    placedAt:        bet.placedAt        ?? bet.placed_at,
    settledAt:       bet.settledAt       ?? bet.settled_at,
    totalOdds:       bet.totalOdds       ?? bet.total_odds,
    potentialReturn: bet.potentialReturn ?? bet.potential_return,
    selections: (bet.selections ?? []).map((s) => ({
      ...s,
      oddsLocked: s.oddsLocked ?? s.odds_locked ?? s.odds ?? 1,
      matchLabel: buildMatchLabel(s),
    })),
  };
}

// ─── Booking Code Loader ──────────────────────────────────────────────────────

function BookingCodeLoader({ onLoaded }) {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [preview, setPreview] = useState(null);
  const currency              = useStore((s) => s.currency);
  const addToSlip             = useStore((s) => s.addToSlip);
  const clearSlip             = useStore((s) => s.clearSlip);
  const pushToast             = useStore((s) => s.pushToast);
  const inputRef              = useRef(null);

  const handleLoad = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { inputRef.current?.focus(); return; }
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await booking.redeem(trimmed);
      setPreview(res);
    } catch (err) {
      setError(err.message ?? 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToSlip = () => {
    if (!preview) return;
    const selections = preview.enrichedSelections.map((sel) => ({
      id:          `${sel.matchId}-${sel.market}-${sel.selection}`,
      matchId:     sel.matchId,
      // Always resolve to a human label right here so slip rows show team names
      match_label: buildMatchLabel(sel),
      market:      sel.market,
      selection:   sel.selection,
      odds:        sel.currentOdds ?? sel.odds ?? sel.submittedOdds ?? 1,
      bookingCodeUsedId: preview.booking.id,
    }));
    onLoaded(selections, preview.booking);
    pushToast({ variant: 'win', title: 'Slip loaded!', message: `${selections.length} selection${selections.length !== 1 ? 's' : ''} added from code ${preview.booking.code}` });
    setPreview(null);
    setCode('');
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-60)', display: 'block', marginBottom: 5 }}>
          Enter Booking Code
        </label>
        <div style={{
          display: 'flex', gap: 6,
          background: 'var(--surface-1)', border: '1.5px solid var(--border-bright)',
          borderRadius: 8, overflow: 'hidden',
        }}>
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); setPreview(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            placeholder="e.g. SPDB-XK92"
            maxLength={20}
            style={{
              flex: 1, outline: 'none', background: 'transparent', border: 'none',
              fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'white',
              padding: '9px 10px', minWidth: 0, letterSpacing: '0.08em',
            }}
          />
          <button
            onClick={handleLoad}
            disabled={loading || !code.trim()}
            style={{
              padding: '9px 14px', background: 'var(--grad-primary)', border: 'none',
              color: '#fff', fontWeight: 700, fontSize: 11, cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !code.trim() ? 0.55 : 1, transition: 'opacity 0.15s',
              display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
            }}
          >
            {loading
              ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} style={{ display: 'flex' }}><Icon.Loader size={13} /></motion.span>
              : <><span>Load</span><Icon.ArrowRight size={11} /></>
            }
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              padding: '9px 12px', borderRadius: 8, marginBottom: 10,
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.22)',
              fontSize: 11, color: '#DC2626', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon.X size={11} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '10px 12px', borderBottom: '1px solid var(--border)',
              background: 'rgba(34,215,122,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#22d77a', letterSpacing: '0.1em' }}>
                  {preview.booking.code}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-60)', marginTop: 2 }}>
                  {preview.booking.label} · expires {new Date(preview.booking.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: 'var(--text-60)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Total Odds</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--brand)' }}>
                  {(preview.currentTotalOdds ?? preview.booking.totalOdds ?? 0).toFixed(2)}×
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '8px 12px', gap: 4, borderBottom: '1px solid var(--border)' }}>
              {[
                { label: 'Selections', value: preview.enrichedSelections.length },
                { label: 'Stake',      value: fmtMoneyWithCode(preview.booking.stake, preview.booking.currency ?? currency) },
                { label: 'Pot. Win',   value: fmtMoneyWithCode(preview.booking.potentialPayout ?? 0, preview.booking.currency ?? currency) },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: 'var(--text-60)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: 'var(--text-100)' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ maxHeight: 220, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {preview.enrichedSelections.map((sel, i) => (
                <div key={i} style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: 'var(--surface-1)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 9,
                    background: 'var(--surface-3)', color: 'var(--text-60)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 700, fontFamily: 'monospace', flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, color: 'var(--brand)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                      {sel.market}
                    </div>
                    {/* Use buildMatchLabel so booking code previews also show team names */}
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {buildMatchLabel(sel)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-60)', marginTop: 1 }}>
                      Pick: <span style={{ color: 'var(--text-80)', fontWeight: 600 }}>{sel.selection}</span>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontWeight: 700, fontSize: 11,
                    padding: '3px 7px', borderRadius: 6,
                    background: 'var(--surface-3)', border: '1px solid var(--border)',
                    color: 'var(--brand)', flexShrink: 0,
                  }}>
                    {(sel.currentOdds ?? sel.odds ?? sel.submittedOdds ?? 1).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '10px 10px 10px' }}>
              <button
                onClick={handleAddToSlip}
                style={{
                  width: '100%', padding: '10px', borderRadius: 8,
                  background: 'var(--grad-primary)', border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Icon.Check size={12} />
                Add {preview.enrichedSelections.length} Selection{preview.enrichedSelections.length !== 1 ? 's' : ''} to Slip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!preview && !error && !loading && (
        <div style={{
          marginTop: 12, padding: '14px 12px', borderRadius: 10,
          background: 'var(--surface-2)', border: '1px dashed var(--border-bright)',
          textAlign: 'center',
        }}>
          <div style={{ color: 'var(--text-60)', marginBottom: 6 }}><Icon.Code size={22} /></div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-80)', marginBottom: 3 }}>Load a Booking Code</div>
          <div style={{ fontSize: 10, color: 'var(--text-60)', lineHeight: 1.5 }}>
            Enter a code shared by your bookie to instantly load a pre-built slip.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bet Detail Modal ─────────────────────────────────────────────────────────

function BetDetailModal({ bet: rawBet, onClose }) {
  const currency = useStore((s) => s.currency);
  const bet = normaliseBet(rawBet);

  const statusColor = {
    PENDING: '#FFB300',
    WON:     '#22d77a',
    LOST:    '#DC2626',
    VOID:    '#9CA3AF',
  }[bet.status] ?? '#9CA3AF';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(5,8,12,0.82)', backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440, maxHeight: '88vh',
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: '18px 18px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-bright)' }} />
        </div>

        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-100)' }}>Slip Details</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-60)', marginTop: 2 }}>
              #{bet.id?.slice(-8).toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 14,
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-80)', cursor: 'pointer',
            }}
          >
            <Icon.Close size={12} />
          </button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

          {bet.status === 'WON' && (
            <div style={{ position: 'relative', textAlign: 'center', padding: '20px 16px 16px', background: 'rgba(34,215,122,0.06)' }}>
              <Confetti />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ color: '#22d77a', marginBottom: 6 }}><Icon.Trophy size={36} /></div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#22d77a', marginBottom: 4, textTransform: 'uppercase' }}>You Won</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#22d77a', fontFamily: 'monospace' }}>
                  {fmtMoneyWithCode(bet.potentialReturn ?? 0, currency)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 12, padding: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  {[
                    { label: 'Odds',   value: `${(bet.totalOdds ?? 0).toFixed(2)}×` },
                    { label: 'Stake',  value: fmtMoney(bet.stake) },
                    { label: 'Profit', value: fmtMoney((bet.potentialReturn ?? 0) - bet.stake) },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-60)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: 'var(--text-100)' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {bet.status === 'LOST' && (
            <div style={{ margin: '16px 16px 0', padding: 16, textAlign: 'center', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: 12 }}>
              <div style={{ color: '#DC2626', marginBottom: 6 }}><Icon.X size={32} /></div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#DC2626', marginBottom: 4 }}>Better Luck Next Time</div>
              <div style={{ fontSize: 11, color: 'var(--text-60)' }}>Stake of {fmtMoneyWithCode(bet.stake, currency)} lost</div>
            </div>
          )}

          {bet.status === 'PENDING' && (
            <div style={{ margin: '16px 16px 0', padding: 16, textAlign: 'center', background: 'rgba(255,177,0,0.06)', border: '1px solid rgba(255,177,0,0.18)', borderRadius: 12 }}>
              <div style={{ color: '#FFB300', marginBottom: 6 }}><Icon.Clock size={28} /></div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#FFB300', marginBottom: 4 }}>In Progress</div>
              <div style={{ fontSize: 11, color: 'var(--text-60)' }}>Potential: {fmtMoneyWithCode(bet.potentialReturn ?? 0, currency)}</div>
            </div>
          )}

          {bet.status === 'VOID' && (
            <div style={{ margin: '16px 16px 0', padding: 16, textAlign: 'center', background: 'rgba(156,163,175,0.06)', border: '1px solid rgba(156,163,175,0.18)', borderRadius: 12 }}>
              <div style={{ color: '#9CA3AF', marginBottom: 6 }}><Icon.Return size={28} /></div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Bet Voided</div>
              <div style={{ fontSize: 11, color: 'var(--text-60)' }}>
                Stake of {fmtMoneyWithCode(bet.stake, currency)} has been returned to your wallet
              </div>
            </div>
          )}

          {/* info grid */}
          <div style={{ padding: '12px 16px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10 }}>
              {[
                { label: 'Date',       value: new Date(bet.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: 'Status',     value: bet.status, color: statusColor },
                { label: 'Stake',      value: fmtMoneyWithCode(bet.stake, currency) },
                { label: 'Total Odds', value: `${(bet.totalOdds ?? 0).toFixed(2)}×` },
              ].map((cell) => (
                <div key={cell.label}>
                  <div style={{ fontSize: 9, color: 'var(--text-60)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{cell.label}</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: cell.color || 'var(--text-100)' }}>{cell.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* selections */}
          <div style={{ padding: '12px 16px 20px' }}>
            <div style={{ fontSize: 9, color: 'var(--text-60)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>
              {bet.selections.length} Selection{bet.selections.length !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {bet.selections.map((sel, i) => {
                const result = sel.result || 'PENDING';
                const cfg = getResultConfig(result);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: 10,
                    background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 10,
                      background: `${cfg.color}22`, color: cfg.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {cfg.icon(11)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 9, color: 'var(--text-60)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {sel.market || 'Match'}
                        </span>
                        {result !== 'PENDING' && (
                          <span style={{
                            fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                            background: `${cfg.color}22`, color: cfg.color,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                          }}>
                            {cfg.label}
                          </span>
                        )}
                      </div>
                      {/* matchLabel always resolved to "Home vs Away" by normaliseBet */}
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sel.matchLabel}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-60)', marginTop: 1 }}>
                        Pick: <span style={{ color: 'var(--text-80)', fontWeight: 600 }}>{sel.selection}</span>
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontWeight: 700, fontSize: 11,
                      padding: '3px 8px', borderRadius: 6,
                      background: 'var(--surface-3)', border: '1px solid var(--border)',
                      color: cfg.color, flexShrink: 0,
                    }}>
                      {sel.oddsLocked.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* timeline */}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              {[
                { label: 'Placed',  value: new Date(bet.placedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
                bet.settledAt && { label: 'Settled', value: new Date(bet.settledAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
              ].filter(Boolean).map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                  <span style={{ color: 'var(--text-60)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-100)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 8,
              background: 'var(--surface-3)', border: '1px solid var(--border)',
              color: 'var(--text-80)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
            }}
          >
            Close
          </button>
          {bet.status === 'WON' && (
            <button
              onClick={() => useStore.getState().pushToast({ variant: 'win', title: 'Win shared!', message: 'Slip exported to your gallery.' })}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 8,
                background: 'var(--grad-primary)', border: 'none',
                color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}
            >
              Share Win 🎉
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Bet History List ─────────────────────────────────────────────────────────

function BetHistoryList({ bets: rawBets, tab, onView }) {
  const currency = useStore((s) => s.currency);
  const bets = (rawBets ?? []).map(normaliseBet);

  if (bets.length === 0) {
    const empty = {
      active: { emoji: '⏳', label: 'No active bets',  sub: 'Placed bets appear here.' },
      won:    { emoji: '🏆', label: 'No wins yet',      sub: 'Your winning slips land here.' },
      lost:   { emoji: '👋', label: 'No losses',        sub: "Bets that didn't hit show here." },
      void:   { emoji: '↩️', label: 'No voided bets',   sub: 'Refunded bets appear here.' },
    }[tab];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 16px', height: '100%' }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>{empty.emoji}</div>
        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-100)', marginBottom: 4 }}>{empty.label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-60)' }}>{empty.sub}</div>
      </div>
    );
  }

  const statusColor = { PENDING: '#FFB300', WON: '#22d77a', LOST: '#DC2626', VOID: '#9CA3AF' };
  const statusIcon  = {
    PENDING: <Icon.Clock size={13} />,
    WON:     <Icon.Check size={13} />,
    LOST:    <Icon.X size={13} />,
    VOID:    <Icon.Return size={13} />,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '6px 0' }}>
      {bets.map((bet) => {
        const sc = statusColor[bet.status] ?? '#9CA3AF';
        const si = statusIcon[bet.status]  ?? <Icon.Return size={13} />;
        // Show first selection's match label as the card title
        const firstLabel = bet.selections[0]?.matchLabel ?? '—';
        const extraCount = bet.selections.length - 1;

        return (
          <motion.button
            key={bet.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onView(bet)}
            style={{
              width: '100%', textAlign: 'left',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderLeft: `3px solid ${sc}`, borderRadius: 8, overflow: 'hidden',
              cursor: 'pointer', display: 'block',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 8px' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: `${sc}18`, color: sc,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {si}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--text-60)' }}>#{bet.id?.slice(-6).toUpperCase()}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-40)' }}>•</span>
                  <span style={{ fontSize: 9, color: 'var(--text-60)' }}>{new Date(bet.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
                {/* Show the actual match name(s) instead of "X-Leg" */}
                <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--text-100)', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {firstLabel}{extraCount > 0 ? ` +${extraCount} more` : ''}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-60)' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-80)' }}>{fmtMoneyWithCode(bet.stake, currency)}</span>
                  {' · '}{(bet.totalOdds ?? 0).toFixed(2)}×
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 9, color: 'var(--text-60)', textTransform: 'uppercase', marginBottom: 2 }}>
                  {bet.status === 'WON' ? 'Won' : bet.status === 'LOST' ? 'Lost' : bet.status === 'VOID' ? 'Refunded' : 'Pot.'}
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: sc }}>
                  {bet.status === 'LOST'
                    ? fmtMoneyWithCode(bet.stake, currency)
                    : fmtMoneyWithCode(bet.potentialReturn ?? bet.stake, currency)}
                </div>
              </div>
              <div style={{ color: 'var(--text-60)', flexShrink: 0, marginLeft: 2 }}>
                <Icon.ChevronRight size={12} />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Core Slip Content ────────────────────────────────────────────────────────

function BetSlipContent({ onClose, isMobile }) {
  const slip           = useStore((s) => s.slip);
  const removeFromSlip = useStore((s) => s.removeFromSlip);
  const clearSlip      = useStore((s) => s.clearSlip);
  const addToSlip      = useStore((s) => s.addToSlip);
  const placeBet       = useStore((s) => s.placeBet);
  const user           = useStore((s) => s.user);
  const wallet         = useStore((s) => s.wallet);
  const balance        = wallet?.balance ?? 0;
  const pushToast      = useStore((s) => s.pushToast);
  const currency       = useStore((s) => s.currency);
  const rawBets        = useStore((s) => s.bets);

  const bets = (rawBets ?? []).map(normaliseBet);

  const [stake, setStake]         = useState('');
  const [placing, setPlacing]     = useState(false);
  const [tab, setTab]             = useState('slip');
  const [detailBet, setDetailBet] = useState(null);
  const [loadedBookingId, setLoadedBookingId] = useState(null);
  const stakeInputRef = useRef(null);

  const totalOdds = slip.reduce((p, s) => p * s.odds, 1);
  const stakeNum  = parseFloat(stake) || 0;
  const potential = stakeNum * totalOdds;

  const QUICK = [10, 50, 100, 500];

  const tabCounts = {
    slip:   slip.length,
    active: bets.filter((b) => b.status === 'PENDING').length,
    won:    bets.filter((b) => b.status === 'WON').length,
    lost:   bets.filter((b) => b.status === 'LOST').length,
    void:   bets.filter((b) => b.status === 'VOID').length,
  };

  const handleBookingLoaded = (selections, bookingMeta) => {
    clearSlip();
    selections.forEach((sel) => addToSlip(sel));
    if (bookingMeta?.stake) setStake(String(bookingMeta.stake));
    setLoadedBookingId(bookingMeta?.id ?? null);
    setTab('slip');
  };

  const handlePlace = async () => {
    if (!stakeNum || stakeNum <= 0) {
      pushToast({ variant: 'error', title: 'Enter a stake amount' });
      stakeInputRef.current?.focus();
      return;
    }
    if (!user) {
      pushToast({ variant: 'error', title: 'Sign in to place a bet' });
      return;
    }
    if (balance <= 0) {
      pushToast({ variant: 'error', title: 'Wallet is empty', message: 'Please deposit funds to continue.' });
      return;
    }
    if (stakeNum > balance) {
      pushToast({ variant: 'error', title: 'Insufficient balance', message: `You have ${fmtMoneyWithCode(balance, currency)} available.` });
      return;
    }
    setPlacing(true);
    const res = await placeBet(stakeNum, loadedBookingId ?? undefined);
    setPlacing(false);

    if (res?.error) {
      pushToast({ variant: 'error', title: res.error });
    } else {
      pushToast({ variant: 'win', title: 'Bet placed', message: `${fmtMoneyWithCode(stakeNum, currency)} · potential ${fmtMoneyWithCode(potential, currency)}` });
      setStake('');
      setLoadedBookingId(null);
      if (isMobile) onClose?.();
    }
  };

  const TABS = [
    { key: 'slip',   label: 'Slip' },
    { key: 'code',   label: 'Code' },
    { key: 'active', label: 'Active' },
    { key: 'won',    label: 'Won' },
    { key: 'lost',   label: 'Lost' },
    { key: 'void',   label: 'Void' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-1)' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 13px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--brand)' }}><Icon.Receipt size={14} /></span>
          <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-100)', letterSpacing: '0.06em' }}>
            BET <span style={{ color: 'var(--brand)' }}>SLIP</span>
          </span>
          {slip.length > 0 && (
            <span style={{
              background: 'var(--brand)', color: '#fff',
              borderRadius: 999, fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
              padding: '1px 6px',
            }}>
              {slip.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {slip.length > 0 && (
            <button
              onClick={() => { clearSlip(); setLoadedBookingId(null); }}
              title="Clear slip"
              style={{ color: 'var(--text-60)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}
            >
              <Icon.Trash size={12} />
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              style={{ color: 'var(--text-60)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}
            >
              <Icon.Close size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface-1)', overflowX: 'auto' }}>
        {TABS.map((t) => {
          const active = tab === t.key;
          const isCode = t.key === 'code';
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '9px 2px', position: 'relative',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: active ? (isCode ? '#FFB300' : 'var(--brand)') : 'var(--text-60)',
                background: active ? 'var(--surface-2)' : 'transparent',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {isCode
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.Code size={10} />{t.label}</span>
                : t.label
              }
              {tabCounts[t.key] > 0 && (
                <span style={{
                  marginLeft: 4, borderRadius: 999, fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
                  padding: '1px 5px', display: 'inline-block',
                  background: active ? 'var(--brand)' : 'var(--surface-3)',
                  color: active ? '#fff' : 'var(--text-60)',
                }}>
                  {tabCounts[t.key]}
                </span>
              )}
              {active && (
                <motion.div
                  layoutId="slip-tab-line"
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: isCode ? '#FFB300' : 'var(--brand)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 10px' }}>

        {/* SLIP tab */}
        {tab === 'slip' && (
          slip.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 16px', height: '100%' }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: 'var(--text-60)' }}>
                <Icon.Bolt size={20} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-100)', marginBottom: 4 }}>Empty slip</div>
              <div style={{ fontSize: 10, color: 'var(--text-60)', lineHeight: 1.5 }}>Tap any odds to add a selection,</div>
              <button
                onClick={() => setTab('code')}
                style={{
                  marginTop: 10, padding: '6px 12px', borderRadius: 20,
                  background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
                  color: '#FFB300', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <Icon.Code size={11} />
                or load a booking code
              </button>
            </div>
          ) : (
            <>
              {loadedBookingId && (
                <div style={{
                  marginBottom: 6, padding: '5px 10px', borderRadius: 6,
                  background: 'rgba(255,179,0,0.08)', border: '1px solid rgba(255,179,0,0.22)',
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#FFB300', fontWeight: 700,
                }}>
                  <Icon.Code size={10} />
                  Slip loaded from booking code
                </div>
              )}
              <AnimatePresence mode="popLayout">
                {slip.map((sel) => (
                  <motion.div
                    key={sel.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                    layout
                    style={{
                      position: 'relative',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '10px 30px 10px 10px', marginBottom: 6,
                    }}
                  >
                    <button
                      onClick={() => removeFromSlip(sel.id)}
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        color: 'var(--text-60)', background: 'none', border: 'none',
                        cursor: 'pointer', padding: 2, borderRadius: 4, display: 'flex', alignItems: 'center',
                      }}
                    >
                      <Icon.Close size={10} />
                    </button>
                    <div style={{ fontSize: 9, color: 'var(--brand)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      {sel.market}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Use buildMatchLabel — handles match_label, matchLabel, homeTeam+awayTeam */}
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                          {buildMatchLabel(sel)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-60)' }}>
                          Pick: <span style={{ color: 'var(--text-80)', fontWeight: 600 }}>{sel.selection}</span>
                        </div>
                      </div>
                      <div style={{
                        fontFamily: 'monospace', fontWeight: 700, fontSize: 11, flexShrink: 0,
                        padding: '3px 8px', borderRadius: 6,
                        background: 'var(--surface-3)', border: '1px solid var(--border)',
                        color: 'var(--brand)',
                      }}>
                        {sel.odds.toFixed(2)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )
        )}

        {/* BOOKING CODE tab */}
        {tab === 'code' && (
          <BookingCodeLoader onLoaded={handleBookingLoaded} />
        )}

        {/* HISTORY TABS */}
        {tab !== 'slip' && tab !== 'code' && (
          <BetHistoryList
            bets={
              tab === 'active' ? bets.filter((b) => b.status === 'PENDING')
              : tab === 'won'  ? bets.filter((b) => b.status === 'WON')
              : tab === 'void' ? bets.filter((b) => b.status === 'VOID')
              : bets.filter((b) => b.status === 'LOST')
            }
            tab={tab}
            onView={setDetailBet}
          />
        )}
      </div>

      {/* ── Footer / Place Bet ── */}
      {slip.length > 0 && tab === 'slip' && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)', flexShrink: 0 }}>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Stake Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-60)' }}>Stake</label>
                {user && (
                  <span style={{ fontSize: 9, color: 'var(--text-60)' }}>
                    Bal: <span style={{ fontFamily: 'monospace', color: 'var(--text-100)', fontWeight: 600 }}>{fmtMoneyWithCode(balance, currency)}</span>
                  </span>
                )}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: 'var(--surface-1)', border: '1.5px solid var(--border-bright)', borderRadius: 8, overflow: 'hidden',
              }}>
                <span style={{ padding: '0 8px', fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: 'var(--text-60)' }}>{currency}</span>
                <input
                  ref={stakeInputRef}
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  placeholder="0.00"
                  style={{
                    flex: 1, outline: 'none', background: 'transparent', border: 'none',
                    fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'white',
                    padding: '8px 0', minWidth: 0,
                  }}
                />
                {stake && (
                  <button onClick={() => setStake('')} style={{ padding: '0 8px', fontSize: 10, color: 'var(--text-60)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    clear
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, marginTop: 5 }}>
                {QUICK.map((n) => (
                  <button
                    key={n}
                    onClick={() => setStake(String((parseFloat(stake) || 0) + n))}
                    style={{
                      padding: '5px 2px', fontFamily: 'monospace', fontWeight: 600, fontSize: 9,
                      background: 'var(--surface-1)', border: '1px solid var(--border-bright)',
                      color: 'var(--text-80)', borderRadius: 6, cursor: 'pointer',
                    }}
                  >
                    +{n}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8, padding: 9, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                { label: 'Total Odds', value: `${totalOdds.toFixed(2)}×` },
                { label: 'Stake',      value: fmtMoneyWithCode(stakeNum || 0, currency) },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ color: 'var(--text-60)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-100)' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, borderTop: '1px dashed var(--border)', paddingTop: 5, marginTop: 2 }}>
                <span style={{ color: 'var(--text-60)' }}>Potential Win</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--win)' }}>{fmtMoneyWithCode(potential || 0, currency)}</span>
              </div>
            </div>

            {/* Place Bet Button */}
            <button
              onClick={handlePlace}
              disabled={placing || !stakeNum || stakeNum <= 0}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                background: 'var(--grad-primary)', color: '#fff',
                fontWeight: 700, fontSize: 12, letterSpacing: '0.04em',
                border: 'none', cursor: placing ? 'not-allowed' : 'pointer',
                opacity: placing ? 0.6 : 1, transition: 'opacity 0.15s',
              }}
            >
              {placing ? 'Placing…' : `Place Bet · ${fmtMoneyWithCode(stakeNum || 0, currency)}`}
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {detailBet && <BetDetailModal bet={detailBet} onClose={() => setDetailBet(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export function BetSlipSidebar() {
  return (
    <>
      <style>{`
        .bs-sidebar {
          width: 268px;
          position: fixed;
          top: 64px;
          right: 0;
          bottom: 0;
          z-index: 30;
          display: none;
          flex-direction: column;
          border-left: 1px solid var(--border);
        }
        @media (min-width: 1024px) { .bs-sidebar { display: flex; width: 268px; } }
        @media (min-width: 1280px) { .bs-sidebar { width: 288px; } }
        @media (min-width: 1536px) { .bs-sidebar { width: 308px; } }
      `}</style>
      <aside className="bs-sidebar">
        <BetSlipContent isMobile={false} />
      </aside>
    </>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

export function BetSlipDrawer() {
  const slipOpen  = useStore((s) => s.slipOpen);
  const closeSlip = useStore((s) => s.closeSlip);

  return (
    <>
      <style>{`
        .bs-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: min(88vw, 360px);
          z-index: 50;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.5);
        }
        @media (min-width: 1024px) { .bs-drawer { display: none !important; } }
      `}</style>
      <AnimatePresence>
        {slipOpen && (
          <>
            <motion.div
              key="bs-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSlip}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', zIndex: 49,
              }}
              className="lg:hidden"
            />
            <motion.aside
              key="bs-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="bs-drawer"
            >
              <BetSlipContent isMobile onClose={closeSlip} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Mobile Floating Button ───────────────────────────────────────────────────

export function BetSlipFloatingBtn() {
  const slip       = useStore((s) => s.slip);
  const slipOpen   = useStore((s) => s.slipOpen);
  const toggleSlip = useStore((s) => s.toggleSlip);

  return (
    <AnimatePresence>
      {!slipOpen && (
        <motion.button
          key="bs-fab"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          onClick={toggleSlip}
          style={{
            position: 'fixed', bottom: 80, right: 16, zIndex: 30,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px', borderRadius: 999,
            background: 'var(--grad-primary)', color: '#fff',
            fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 28px rgba(124,58,237,0.48)',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
          className="lg:hidden"
        >
          <div style={{ position: 'relative' }}>
            <Icon.Receipt size={18} />
            {slip.length > 0 && (
              <motion.span
                key={slip.length}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute', top: -8, right: -8,
                  background: '#FFB300', color: '#000',
                  fontSize: 9, fontWeight: 700, width: 16, height: 16,
                  borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace',
                }}
              >
                {slip.length}
              </motion.span>
            )}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}