import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Button, EmptyState } from '../components/ui/UIKit';
import { ReceiptIcon, CheckIcon, CloseIcon, ClockIcon, TrophyIcon } from '../components/icons';
import { useStore } from '../store';
import { fmtMoney, fmtTimeAgo } from '../utils';

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────
function Confetti() {
  const colors = ['#E8003D', '#DC2626', '#FFB300', '#22d77a', '#CCFF00', '#fff'];
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    dur: 2 + Math.random() * 2,
    delay: Math.random() * 1.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: 400, opacity: 0, rotate: 720 }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: 6,
            height: 11,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// TROPHY SVG
// ─────────────────────────────────────────────
function TrophySVG() {
  return (
    <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="bets-goldMain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff5b8" />
          <stop offset="20%" stopColor="#ffd84d" />
          <stop offset="50%" stopColor="#e8a813" />
          <stop offset="80%" stopColor="#b87a0a" />
          <stop offset="100%" stopColor="#7d4f05" />
        </linearGradient>
        <linearGradient id="bets-goldShine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7d4f05" />
          <stop offset="30%" stopColor="#ffd84d" />
          <stop offset="50%" stopColor="#fff5b8" />
          <stop offset="70%" stopColor="#ffd84d" />
          <stop offset="100%" stopColor="#7d4f05" />
        </linearGradient>
        <linearGradient id="bets-goldDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c89020" />
          <stop offset="100%" stopColor="#5c3a04" />
        </linearGradient>
        <radialGradient id="bets-cupHighlight" cx="35%" cy="25%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bets-plateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3a2a14" />
          <stop offset="50%" stopColor="#5c3f1a" />
          <stop offset="100%" stopColor="#2a1d0e" />
        </linearGradient>
        <filter id="bets-trophyShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dx="0" dy="8" result="offsetblur" />
          <feFlood floodColor="#000" floodOpacity="0.5" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#bets-trophyShadow)">
        <path d="M 50 60 C 20 65, 15 95, 30 115 C 38 125, 50 125, 55 118" fill="none" stroke="url(#bets-goldDark)" strokeWidth="9" strokeLinecap="round" />
        <path d="M 50 60 C 20 65, 15 95, 30 115 C 38 125, 50 125, 55 118" fill="none" stroke="url(#bets-goldMain)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 150 60 C 180 65, 185 95, 170 115 C 162 125, 150 125, 145 118" fill="none" stroke="url(#bets-goldDark)" strokeWidth="9" strokeLinecap="round" />
        <path d="M 150 60 C 180 65, 185 95, 170 115 C 162 125, 150 125, 145 118" fill="none" stroke="url(#bets-goldMain)" strokeWidth="6" strokeLinecap="round" />
        <path d="M 45 45 L 155 45 L 150 110 C 150 135, 135 155, 100 158 C 65 155, 50 135, 50 110 Z" fill="url(#bets-goldMain)" stroke="#7d4f05" strokeWidth="1.5" />
        <path d="M 60 55 L 90 55 L 88 110 C 88 130, 78 145, 65 148 C 60 130, 58 90, 60 55 Z" fill="url(#bets-cupHighlight)" />
        <rect x="42" y="42" width="116" height="12" fill="url(#bets-goldShine)" stroke="#7d4f05" strokeWidth="1" />
        <rect x="42" y="42" width="116" height="3" fill="#fff5b8" opacity="0.8" />
        <rect x="42" y="51" width="116" height="2" fill="#7d4f05" opacity="0.6" />
        <g transform="translate(100,95)">
          <polygon points="0,-18 5,-6 18,-6 8,3 12,15 0,8 -12,15 -8,3 -18,-6 -5,-6" fill="url(#bets-goldShine)" stroke="#7d4f05" strokeWidth="0.8" />
          <polygon points="0,-18 5,-6 18,-6 8,3 12,15 0,8 -12,15 -8,3 -18,-6 -5,-6" fill="#fff5b8" opacity="0.4" transform="scale(0.5)" />
        </g>
        <path d="M 85 158 L 115 158 L 113 175 L 87 175 Z" fill="url(#bets-goldMain)" stroke="#7d4f05" strokeWidth="1" />
        <rect x="85" y="158" width="30" height="3" fill="#fff5b8" opacity="0.6" />
        <rect x="92" y="175" width="16" height="20" fill="url(#bets-goldDark)" stroke="#3a2a04" strokeWidth="0.8" />
        <path d="M 70 195 L 130 195 L 135 207 L 65 207 Z" fill="url(#bets-goldMain)" stroke="#7d4f05" strokeWidth="1" />
        <rect x="65" y="195" width="70" height="3" fill="#fff5b8" opacity="0.6" />
        <path d="M 55 207 L 145 207 L 150 230 L 50 230 Z" fill="url(#bets-plateGrad)" stroke="#1a0f04" strokeWidth="1" />
        <rect x="75" y="213" width="50" height="11" rx="1" fill="#1a0f04" stroke="#7d4f05" strokeWidth="0.8" />
        <text x="100" y="221" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="6" fontWeight="700" fill="#ffd84d" letterSpacing="1">WINNER</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function buildMatchLabel(s) {
  if (s.matchLabel)                 return s.matchLabel;
  if (s.match_label)                return s.match_label;
  if (s.match)                      return s.match;
  const home = s.homeTeam  ?? s.home_team;
  const away = s.awayTeam  ?? s.away_team;
  if (home && away)                 return `${home} vs ${away}`;
  const id = s.matchId ?? s.match_id ?? '';
  return id ? `Match …${String(id).slice(-6)}` : 'Unknown match';
}

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

// ─────────────────────────────────────────────
// TABS CONFIG
// ─────────────────────────────────────────────
const TABS = [
  { key: 'ALL',     label: 'All' },
  { key: 'PENDING', label: 'Open' },
  { key: 'WON',     label: 'Won' },
  { key: 'LOST',    label: 'Lost' },
];

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function Bets() {
  const [tab, setTab]             = useState('ALL');
  const [detailBet, setDetailBet] = useState(null);

  const rawBets   = useStore((s) => s.bets);
  const user      = useStore((s) => s.user);
  const fetchBets = useStore((s) => s.fetchBets);

  useEffect(() => {
    if (user) fetchBets();
  }, [user]);

  const bets     = (rawBets ?? []).map(normaliseBet);
  const filtered = tab === 'ALL' ? bets : bets.filter((b) => b.status === tab);

  const totalStaked = bets.reduce((s, b) => s + (b.stake ?? 0), 0);
  const totalWon    = bets.filter((b) => b.status === 'WON').reduce((s, b) => s + (b.potentialReturn ?? 0), 0);
  const settledBets = bets.filter((b) => b.status !== 'PENDING');
  const winRate     = settledBets.length
    ? Math.round((bets.filter((b) => b.status === 'WON').length / settledBets.length) * 100)
    : 0;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <ReceiptIcon size={48} color="#888" className="mx-auto mb-4" />
          <h2 className="font-display text-3xl text-white-100 mb-2" style={{ fontFamily: 'Outfit' }}>
            SIGN IN TO VIEW BETS
          </h2>
          <a href="/auth/login">
            <Button variant="primary">SIGN IN</Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Page Header ── */}
      <div className="bg-black-900 border-b border-black-700 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-[10px] caps text-crimson-400 mb-2 flex items-center gap-2">
            <ReceiptIcon size={14} color="#E8003D" /> YOUR BETS
          </div>
          <h1
            className="font-display text-4xl md:text-6xl text-white-100 leading-none"
            style={{ fontFamily: 'Outfit', letterSpacing: '0.01em' }}
          >
            MY BETS
          </h1>
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="px-4 py-2 bg-black-950 border border-black-700">
              <div className="text-[10px] caps text-white-60">STAKED</div>
              <div className="font-mono text-2xl text-white-100 tabular-nums">{fmtMoney(totalStaked)}</div>
            </div>
            <div className="px-4 py-2 bg-black-950 border border-black-700">
              <div className="text-[10px] caps text-white-60">WON</div>
              <div className="font-mono text-2xl text-emerald-500 tabular-nums">{fmtMoney(totalWon)}</div>
            </div>
            <div className="px-4 py-2 bg-black-950 border border-black-700">
              <div className="text-[10px] caps text-white-60">WIN RATE</div>
              <div className="font-mono text-2xl text-electric-400 tabular-nums">{winRate || '—'}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="sticky top-16 z-20 bg-black-950/95 backdrop-blur border-b border-black-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex gap-2">
          {TABS.map((t) => {
            const count = t.key === 'ALL' ? bets.length : bets.filter((b) => b.status === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-[11px] caps font-semibold transition-all border-2 ${
                  tab === t.key
                    ? 'bg-crimson-400 text-white-100 border-crimson-400'
                    : 'bg-black-800 text-white-80 border-black-700'
                }`}
              >
                {t.label} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bet List ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {filtered.length === 0 ? (
          <EmptyState
            title="No bets here yet"
            subtitle="Place your first bet from the live or upcoming match list."
            action={
              <a href="/app/sports">
                <Button variant="primary">BROWSE MATCHES</Button>
              </a>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <BetCard bet={b} onView={setDetailBet} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {detailBet && (
          <BetDetailModal bet={detailBet} onClose={() => setDetailBet(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// BET CARD
// ─────────────────────────────────────────────
function BetCard({ bet, onView }) {
  const statusBadge = {
    PENDING: { label: 'OPEN', variant: 'live',  icon: ClockIcon,  color: '#FFB300' },
    WON:     { label: 'WON',  variant: 'win',   icon: TrophyIcon, color: '#00E676' },
    LOST:    { label: 'LOST', variant: 'loss',  icon: CloseIcon,  color: '#FF1744' },
  }[bet.status] ?? { label: bet.status, variant: 'live', icon: ClockIcon, color: '#9CA3AF' };

  return (
    <Card
      className="p-5 cursor-pointer transition-all hover:border-white/20 active:scale-[0.99]"
      onClick={() => onView(bet)}
      style={{ userSelect: 'none' }}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-black-700">
        <div className="flex items-center gap-2">
          <Badge variant={statusBadge.variant}>
            <statusBadge.icon size={10} color={statusBadge.color} /> {statusBadge.label}
          </Badge>
          <span className="text-white-60 text-xs">
            #{bet.id.slice(-6)} · {fmtTimeAgo(bet.placedAt)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div>
            <span className="text-white-60">Stake:</span>{' '}
            <span className="font-mono text-white-100 tabular-nums">{fmtMoney(bet.stake)}</span>
          </div>
          <div>
            <span className="text-white-60">Odds:</span>{' '}
            <span className="font-mono text-white-100 tabular-nums">{(bet.totalOdds ?? 0).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-white-60">Return:</span>{' '}
            <span className="font-mono tabular-nums" style={{ color: statusBadge.color }}>
              {fmtMoney(bet.potentialReturn ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Selections */}
      <div className="space-y-2">
        {bet.selections.map((s, i) => {
          const resultIcon  = s.result === 'WON' ? CheckIcon : s.result === 'LOST' ? CloseIcon : ClockIcon;
          const resultColor = s.result === 'WON' ? '#00E676' : s.result === 'LOST' ? '#FF1744' : '#FFB300';
          const ResultIcon  = resultIcon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2 bg-black-800 border-l-2"
              style={{ borderLeftColor: resultColor }}
            >
              <ResultIcon size={14} color={resultColor} />
              <div className="flex-1 min-w-0">
                <div className="text-white-100 text-sm font-semibold truncate">
                  {s.matchLabel}
                </div>
                <div className="text-white-60 text-xs">
                  {s.market} · <span className="text-white-100">{s.selection}</span>
                </div>
              </div>
              <span className="font-mono text-sm text-white-100 tabular-nums">
                {s.oddsLocked.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* View prompt */}
      <div
        className="mt-3 pt-2 text-right text-xs font-semibold border-t border-black-700"
        style={{ color: 'var(--brand, #E8003D)' }}
      >
        View details →
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// BET DETAIL MODAL
// ─────────────────────────────────────────────
function BetDetailModal({ bet, onClose }) {
  const pushToast = useStore((s) => s.pushToast);

  const statusConfig = {
    PENDING: { color: 'var(--vip, #FFB300)' },
    WON:     { color: 'var(--win, #22d77a)' },
    LOST:    { color: 'var(--loss, #FF1744)' },
    VOID:    { color: '#9CA3AF' },
  }[bet.status] ?? { color: '#9CA3AF' };

  const legColor = {
    WON:       'var(--win, #22d77a)',
    HALF_WON:  'var(--win, #22d77a)',
    LOST:      'var(--loss, #FF1744)',
    HALF_LOST: 'var(--loss, #FF1744)',
    PUSH:      '#9CA3AF',
    VOID:      '#9CA3AF',
    PENDING:   'var(--vip, #FFB300)',
  };

  const legIcon = {
    WON: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5 12 10 17 19 7" />
      </svg>
    ),
    HALF_WON: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5 12 10 17 19 7" /><line x1="12" y1="3" x2="12" y2="7" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    ),
    LOST: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    ),
    HALF_LOST: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    ),
    PUSH: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 00-4-4H4" />
      </svg>
    ),
    VOID: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 00-4-4H4" />
      </svg>
    ),
    PENDING: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
      </svg>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
      style={{ background: 'rgba(5,8,12,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bets-detail-modal relative w-full flex flex-col overflow-hidden"
        style={{ background: 'var(--surface-1, #0f1117)', border: '1px solid var(--border, #222)' }}
      >
        <style>{`
          .bets-detail-modal {
            border-radius: 18px 18px 0 0;
            max-height: 92vh;
          }
          @media (min-width: 480px) {
            .bets-detail-modal { border-radius: 16px; max-height: 90vh; max-width: 460px; }
          }
          @media (min-width: 640px) {
            .bets-detail-modal { max-width: 480px; max-height: 88vh; }
          }
          @media (min-width: 768px) {
            .bets-detail-modal { max-width: 500px; max-height: 86vh; }
          }
          @keyframes bets-spin { to { transform: rotate(360deg); } }
          @keyframes bets-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        `}</style>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-2 pb-0.5 sm:hidden flex-shrink-0">
          <div className="w-9 h-1 rounded-full" style={{ background: 'var(--border-bright, #333)' }} />
        </div>

        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border, #222)', background: 'var(--surface-2, #161820)' }}
        >
          <div className="min-w-0 flex-1">
            <div className="font-display font-semibold text-sm truncate" style={{ color: 'var(--text-100, #fff)' }}>
              Slip Details
            </div>
            <div className="font-mono text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-60, #888)' }}>
              #{bet.id?.slice(-8).toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-2"
            style={{ background: 'var(--surface-3, #1e2028)', color: 'var(--text-80, #ccc)' }}
          >
            <CloseIcon size={12} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">

          {/* WON Banner */}
          {bet.status === 'WON' && (
            <div
              className="relative text-center pt-5 pb-4 px-4 overflow-hidden"
              style={{ background: 'linear-gradient(180deg, rgba(34,215,122,0.08), transparent)' }}
            >
              <Confetti />
              <div style={{
                position: 'absolute', inset: -40,
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(34,215,122,0.06) 10deg, transparent 20deg, transparent 40deg, rgba(34,215,122,0.06) 50deg, transparent 60deg)',
                borderRadius: '50%',
                animation: 'bets-spin 14s linear infinite',
                pointerEvents: 'none',
              }} />
              <motion.div
                initial={{ scale: 0, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
                className="mx-auto mb-2 relative"
                style={{
                  width: 'clamp(72px, 20vw, 110px)',
                  height: 'clamp(86px, 24vw, 132px)',
                  animation: 'bets-float 3.5s ease-in-out infinite 1s',
                  filter: 'drop-shadow(0 10px 18px rgba(255,180,0,0.3))',
                }}
              >
                <TrophySVG />
              </motion.div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--win, #22d77a)' }}>
                YOU WON
              </div>
              <div
                className="font-display font-bold break-words"
                style={{
                  fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
                  lineHeight: 1.1,
                  background: 'linear-gradient(180deg, #fff, var(--win, #22d77a))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {fmtMoney(bet.potentialReturn ?? 0)}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl" style={{ background: 'var(--surface-2, #161820)', border: '1px solid var(--border, #222)' }}>
                {[
                  { label: 'Odds',   value: `${(bet.totalOdds ?? 0).toFixed(2)}x`, accent: true },
                  { label: 'Stake',  value: fmtMoney(bet.stake) },
                  { label: 'Profit', value: fmtMoney((bet.potentialReturn ?? 0) - bet.stake) },
                ].map((s) => (
                  <div key={s.label} className="text-center min-w-0">
                    <div className="text-[9px] uppercase tracking-wider font-bold mb-0.5 truncate" style={{ color: 'var(--text-60, #888)' }}>{s.label}</div>
                    <div className="font-mono font-bold text-xs truncate" style={{ color: s.accent ? 'var(--brand, #E8003D)' : 'var(--text-100, #fff)' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOST Banner */}
          {bet.status === 'LOST' && (
            <div
              className="mx-4 mt-4 text-center p-4 rounded-2xl"
              style={{ background: 'linear-gradient(180deg, rgba(220,38,38,0.08), transparent)', border: '1px solid rgba(220,38,38,0.2)' }}
            >
              <div className="flex justify-center mb-2" style={{ color: 'var(--loss, #FF1744)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </div>
              <div className="font-display text-base font-bold mb-0.5" style={{ color: 'var(--loss, #FF1744)' }}>Better Luck Next Time</div>
              <div className="text-xs" style={{ color: 'var(--text-60, #888)' }}>Stake of {fmtMoney(bet.stake)} lost</div>
            </div>
          )}

          {/* PENDING Banner */}
          {bet.status === 'PENDING' && (
            <div
              className="mx-4 mt-4 text-center p-4 rounded-2xl"
              style={{ background: 'linear-gradient(180deg, rgba(255,177,0,0.08), transparent)', border: '1px solid rgba(255,177,0,0.2)' }}
            >
              <div className="flex justify-center mb-2" style={{ color: 'var(--vip, #FFB300)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2h12M6 22h12" /><path d="M6 2c0 5 6 6 6 10s-6 5-6 10" /><path d="M18 2c0 5-6 6-6 10s6 5 6 10" />
                </svg>
              </div>
              <div className="font-display text-base font-bold mb-0.5" style={{ color: 'var(--vip, #FFB300)' }}>Slip In Progress</div>
              <div className="text-xs" style={{ color: 'var(--text-60, #888)' }}>Potential win {fmtMoney(bet.potentialReturn ?? 0)}</div>
            </div>
          )}

          {/* Info Grid */}
          <div className="px-4 mt-3">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl" style={{ background: 'var(--surface-2, #161820)', border: '1px solid var(--border, #222)' }}>
              {[
                { label: 'Date',       value: new Date(bet.placedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: 'Status',     value: bet.status, color: statusConfig.color },
                { label: 'Stake',      value: fmtMoney(bet.stake) },
                { label: 'Total Odds', value: `${(bet.totalOdds ?? 0).toFixed(2)}x` },
              ].map((cell) => (
                <div key={cell.label} className="min-w-0">
                  <div className="text-[9px] uppercase tracking-wider font-bold mb-0.5 truncate" style={{ color: 'var(--text-60, #888)' }}>{cell.label}</div>
                  <div className="font-mono font-bold text-xs truncate" style={{ color: cell.color || 'var(--text-100, #fff)' }}>{cell.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selections */}
          <div className="px-4 mt-3 pb-4">
            <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-60, #888)' }}>
              {bet.selections.length} Selection{bet.selections.length === 1 ? '' : 's'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {bet.selections.map((sel, i) => {
                const result = sel.result || 'PENDING';
                const rc = legColor[result] ?? 'var(--vip, #FFB300)';
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 rounded-xl"
                    style={{
                      background: result === 'WON' ? 'rgba(34,215,122,0.06)' : result === 'LOST' ? 'rgba(220,38,38,0.05)' : 'var(--surface-2, #161820)',
                      border: `1px solid ${result === 'WON' ? 'rgba(34,215,122,0.2)' : result === 'LOST' ? 'rgba(220,38,38,0.2)' : 'var(--border, #222)'}`,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${rc}20`, color: rc }}
                    >
                      {legIcon[result] ?? legIcon.PENDING}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] uppercase tracking-wider font-bold mb-0.5 truncate" style={{ color: 'var(--text-60, #888)' }}>
                        {sel.market || 'Match'}
                      </div>
                      <div className="text-xs font-medium leading-snug" style={{ color: 'var(--text-100, #fff)' }}>
                        {sel.matchLabel}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-60, #888)' }}>
                        Pick:{' '}
                        <span className="font-semibold" style={{ color: 'var(--text-80, #bbb)' }}>
                          {sel.selection}
                        </span>
                      </div>
                    </div>
                    <div
                      className="font-mono font-bold text-xs px-2 py-1 rounded-lg flex-shrink-0"
                      style={{ background: 'var(--surface-3, #1e2028)', border: '1px solid var(--border, #222)', color: rc }}
                    >
                      {sel.oddsLocked.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timeline */}
            <div className="mt-4 pt-3 space-y-1 text-xs" style={{ borderTop: '1px solid var(--border, #222)' }}>
              <div className="flex justify-between gap-2">
                <span className="flex-shrink-0" style={{ color: 'var(--text-60, #888)' }}>Placed</span>
                <span className="font-mono text-right" style={{ color: 'var(--text-100, #fff)' }}>
                  {new Date(bet.placedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              {bet.settledAt && (
                <div className="flex justify-between gap-2">
                  <span className="flex-shrink-0" style={{ color: 'var(--text-60, #888)' }}>Settled</span>
                  <span className="font-mono text-right" style={{ color: 'var(--text-100, #fff)' }}>
                    {new Date(bet.settledAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="px-4 py-3 flex gap-2 border-t flex-shrink-0"
          style={{ borderColor: 'var(--border, #222)', background: 'var(--surface-2, #161820)' }}
        >
          <Button variant="ghost" size="sm" className="flex-1" onClick={onClose}>
            Close
          </Button>
          {bet.status === 'WON' && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() =>
                pushToast({ variant: 'win', title: 'Win shared!', message: 'Slip exported to your gallery.' })
              }
            >
              Share Win 🎉
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}