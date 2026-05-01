import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useTimezone } from '../hooks/useTimezone';
import { formatKickoff } from '../utils/time';

// ─── TeamBadge — initials only (kept for carousel compatibility) ──────────────
export const TeamBadge = ({ team, size = 36 }) => {
  const name     = team?.name ?? '';
  const initials = (team?.short || name.slice(0, 3) || '?').toUpperCase();
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg,#1e1e2e,#2a2a3e)',
      border: '1.5px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 700, color: '#aaa',
      letterSpacing: '0.04em', flexShrink: 0,
      fontFamily: 'system-ui,sans-serif',
    }}>
      {initials.slice(0, 3)}
    </div>
  );
};

// ─── Odds button ──────────────────────────────────────────────────────────────
function OddsBtn({ label, value, selected, onClick }) {
  const has = value && value !== '—';
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={has ? onClick : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        padding: '6px 0',
        width: 44,
        borderRadius: 8,
        border: selected
          ? '1.5px solid rgba(99,210,255,0.7)'
          : '1.5px solid rgba(255,255,255,0.08)',
        background: selected
          ? 'linear-gradient(135deg, rgba(99,210,255,0.25), rgba(56,145,255,0.2))'
          : 'rgba(255,255,255,0.05)',
        cursor: has ? 'pointer' : 'default',
        transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(4px)',
        flexShrink: 0,
      }}
    >
      <span style={{
        fontSize: 9, fontWeight: 700,
        color: selected ? 'rgba(99,210,255,0.8)' : 'rgba(255,255,255,0.35)',
        letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1,
      }}>{label}</span>
      <span style={{
        fontSize: 14, fontWeight: 800,
        color: has ? (selected ? '#63d2ff' : '#fff') : 'rgba(255,255,255,0.18)',
        lineHeight: 1.2,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}>{has ? value : '—'}</span>
    </motion.button>
  );
}

// ─── Extract odds ─────────────────────────────────────────────────────────────
function extractOdds(oddsArr, homeTeam, awayTeam) {
  if (!Array.isArray(oddsArr) || !oddsArr.length) return { home: null, draw: null, away: null };
  let home = null, draw = null, away = null;
  const hn = (homeTeam || '').toLowerCase().split(' ')[0];
  const an = (awayTeam || '').toLowerCase().split(' ')[0];
  for (const o of oddsArr) {
    const sel = (o.selection || o.outcome || '').toLowerCase();
    const val = o.odd || o.value;
    if (!val || val === '0') continue;
    if (!home && (sel === '1' || sel === 'home' || (hn && sel.includes(hn)))) home = parseFloat(val).toFixed(2);
    else if (!draw && (sel === 'x' || sel === 'draw')) draw = parseFloat(val).toFixed(2);
    else if (!away && (sel === '2' || sel === 'away' || (an && sel.includes(an)))) away = parseFloat(val).toFixed(2);
    if (home && draw && away) break;
  }
  return { home, draw, away };
}

// ─── MatchCard — modern glassmorphic sportsbook row ───────────────────────────
export const MatchCard = ({ match, compact = false }) => {
  const navigate  = useNavigate();
  const addToSlip = useStore((s) => s.addToSlip);
  const slip      = useStore((s) => s.slip);
  const [hovered, setHovered] = useState(false);

  // ── IP-based timezone detection ──
  const timezone = useTimezone();

  const isLive     = match?.status === 'LIVE';
  const isFinished = match?.status === 'FINISHED';

  const homeTeam  = match?.home?.name ?? match?.homeTeam ?? '';
  const awayTeam  = match?.away?.name ?? match?.awayTeam ?? '';
  const scoreHome = match?.score?.home ?? match?.scoreHome ?? null;
  const scoreAway = match?.score?.away ?? match?.scoreAway ?? null;
  const hasScore  = scoreHome != null && scoreAway != null;
  const minute    = match?.minute ?? match?.metadata?.current_minute ?? null;

  const { home: oHome, draw: oDraw, away: oAway } = extractOdds(match?.odds, homeTeam, awayTeam);
  const isSelected = (sel) => slip?.some((s) => s.match_id === match?.id && s.selection === sel);

  const handleOdds = (e, selection, odd) => {
    e.stopPropagation();
    if (!odd) return;
    addToSlip({
      id: `sel-${match.id}-1X2-${selection}`,
      match_id: match.id,
      match_label: `${homeTeam} vs ${awayTeam}`,
      market: '1X2', selection,
      odds: parseFloat(odd),
    });
  };

  // ── Kickoff time formatted using detected timezone ──
  const kickoffTime = formatKickoff(match?.kickoff, timezone);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: hovered ? 'rgba(99,210,255,0.03)' : 'transparent',
        transition: 'background 0.18s ease',
        padding: '10px 14px',
        gap: 0,
      }}
      onClick={() => navigate(`/app/match/${match?.id}`)}
    >
      {/* Live accent bar */}
      {isLive && (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(to bottom, #ff4757, #ff6b81)',
          }}
        />
      )}

      {/* Time column */}
      <div style={{
        width: 52, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3,
        paddingRight: 10,
      }}>
        {isLive ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#ff4757',
                boxShadow: '0 0 10px #ff4757aa',
              }}
            />
            <span style={{
              fontSize: 11, fontWeight: 800, color: '#ff4757',
              letterSpacing: '0.03em', lineHeight: 1,
            }}>{minute ? `${minute}'` : 'LIVE'}</span>
          </div>
        ) : isFinished ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.06em' }}>FT</span>
        ) : kickoffTime ? (
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', fontVariantNumeric: 'tabular-nums' }}>{kickoffTime}</span>
        ) : (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>—</span>
        )}
      </div>

      {/* Thin divider */}
      <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.05)', marginRight: 14, flexShrink: 0 }} />

      {/* Teams — stacked home / away */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: hasScore && scoreHome > scoreAway ? '#ffffff' : 'rgba(255,255,255,0.82)',
            letterSpacing: '-0.01em', lineHeight: 1.25,
            wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0,
          }}>{homeTeam || 'Home Team'}</span>
          {hasScore && (
            <span style={{
              fontSize: 15, fontWeight: 900,
              color: isLive ? '#ff4757' : 'rgba(255,255,255,0.9)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.04em', flexShrink: 0,
            }}>{scoreHome}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: hasScore && scoreAway > scoreHome ? '#ffffff' : 'rgba(255,255,255,0.82)',
            letterSpacing: '-0.01em', lineHeight: 1.25,
            wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0,
          }}>{awayTeam || 'Away Team'}</span>
          {hasScore && (
            <span style={{
              fontSize: 15, fontWeight: 900,
              color: isLive ? '#ff4757' : 'rgba(255,255,255,0.9)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.04em', flexShrink: 0,
            }}>{scoreAway}</span>
          )}
        </div>
      </div>

      {/* Odds / FT */}
      {!isFinished ? (
        <div style={{ display: 'flex', gap: 3, marginLeft: 10, flexShrink: 0, alignItems: 'center' }}>
          <OddsBtn label="1" value={oHome} selected={isSelected('HOME')} onClick={(e) => handleOdds(e, 'HOME', oHome)} />
          <OddsBtn label="X" value={oDraw} selected={isSelected('DRAW')} onClick={(e) => handleOdds(e, 'DRAW', oDraw)} />
          <OddsBtn label="2" value={oAway} selected={isSelected('AWAY')} onClick={(e) => handleOdds(e, 'AWAY', oAway)} />
        </div>
      ) : (
        <div style={{
          marginLeft: 14, flexShrink: 0,
          fontSize: 10, fontWeight: 700,
          color: 'rgba(255,255,255,0.18)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>Full time</div>
      )}
    </motion.div>
  );
};

// ─── MatchGroup — league header + rows ───────────────────────────────────────
export const MatchGroup = ({ label, subLabel, matches = [] }) => (
  <div>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 14px',
      background: 'rgba(99,210,255,0.035)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 3, height: 14, borderRadius: 2,
          background: 'linear-gradient(to bottom, #63d2ff, #3891ff)',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>{label}</span>
        {subLabel && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>{subLabel}</span>}
      </div>
      <div style={{ display: 'flex', gap: 4, paddingRight: 34 }}>
        {['1', 'X', '2'].map(h => (
          <span key={h} style={{
            width: 52, textAlign: 'center',
            fontSize: 10, fontWeight: 700,
            color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.06em',
          }}>{h}</span>
        ))}
      </div>
    </div>
    {matches.map((m, i) => <MatchCard key={m.id ?? i} match={m} />)}
  </div>
);

// ─── Toast Host ───────────────────────────────────────────────────────────────
import { BoltIcon, CheckIcon, CloseIcon } from './icons';

export const ToastHost = () => {
  const toasts       = useStore((s) => s.toasts);
  const dismissToast = useStore((s) => s.dismissToast);

  useEffect(() => {
    toasts.forEach((t) => {
      const timer = setTimeout(() => dismissToast(t.id), 3500);
      return () => clearTimeout(timer);
    });
  }, [toasts, dismissToast]);

  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border min-w-[280px] shadow-card ${
              t.kind === 'win'    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
            : t.kind === 'error' ? 'bg-red-600/20 border-red-600 text-red-600'
            : 'bg-black-800 border-black-700 text-white'}`}
          >
            {t.kind === 'win'    ? <CheckIcon size={18} color="#00E676" />
           : t.kind === 'error'  ? <CloseIcon  size={18} color="#FF1744" />
           : <BoltIcon size={18} color="#00D4FF" />}
            <span className="font-semibold text-sm">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ─── TipCard ──────────────────────────────────────────────────────────────────
import { Badge } from './ui/UIKit';
import { FlameIcon } from './icons';

export const TipCard = ({ prediction, onAddToSlip }) => {
  const confidence     = prediction.confidence ?? prediction.prediction?.confidence ?? 0;
  const matchLabel     = prediction.match_label ?? prediction.prediction?.match_label ?? prediction.label ?? '–';
  const adminNote      = prediction.admin_note ?? prediction.adminNote ?? null;
  const publishedBy    = prediction.published_by ?? prediction.sharedByAdminId ?? 'SpeedBet AI';
  const type           = prediction.type ?? 'football';
  const predictedScore = prediction.predicted_score ?? prediction.prediction?.predicted_score ?? null;
  const cashoutMin     = prediction.suggested_cashout_min ?? prediction.prediction?.suggested_cashout_min ?? null;
  const cashoutMax     = prediction.suggested_cashout_max ?? prediction.prediction?.suggested_cashout_max ?? null;
  const confColor      = confidence >= 0.7 ? '#00E676' : confidence >= 0.5 ? '#FFB300' : '#FF1744';

  return (
    <div className="flex-none w-[280px] bg-black-900 border border-black-700 rounded-lg p-3 hover:border-crimson-400 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] caps text-electric-400 font-bold">{type === 'crash' ? 'CRASH TIP' : 'AI PICK'}</div>
        <Badge variant={confidence >= 0.7 ? 'win' : 'default'}>{Math.round(confidence * 100)}%</Badge>
      </div>
      <div className="font-semibold text-sm text-white mb-2 line-clamp-2 min-h-[40px]">{matchLabel}</div>
      {predictedScore && (
        <div className="flex items-center justify-center gap-3 py-2 bg-black-950 rounded my-2">
          <span className="font-mono font-bold text-lg tabular">{predictedScore.home}</span>
          <span className="text-xs caps text-white-60">FT</span>
          <span className="font-mono font-bold text-lg tabular">{predictedScore.away}</span>
        </div>
      )}
      {cashoutMin && (
        <div className="flex items-center justify-center gap-2 py-2 bg-black-950 rounded my-2">
          <FlameIcon size={16} color="#FFB300" />
          <span className="font-mono font-bold text-sm">Cash @ {cashoutMin}x - {cashoutMax}x</span>
        </div>
      )}
      <div className="h-1 bg-black-700 rounded overflow-hidden mb-2">
        <div className="h-full rounded" style={{ width: `${confidence * 100}%`, backgroundColor: confColor }} />
      </div>
      {adminNote && <div className="text-[11px] text-white-80 italic mb-2 line-clamp-2">"{adminNote}"</div>}
      <div className="text-[10px] text-white-60 mb-2">by <span className="text-electric-400">{publishedBy}</span></div>
      {onAddToSlip && (
        <button onClick={onAddToSlip} className="w-full py-2 bg-crimson-400 hover:bg-crimson-500 text-white font-bold text-xs caps rounded transition-colors">
          Add to Slip
        </button>
      )}
    </div>
  );
};