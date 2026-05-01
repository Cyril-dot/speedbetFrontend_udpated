import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

// ─── Team Logo ────────────────────────────────────────────────────────────────
export const TeamBadge = ({ team, size = 36 }) => {
  const [err, setErr] = useState(false);
  const name    = team?.name ?? '';
  const logo    = team?.logo ?? '';
  const initials = (team?.short || name.slice(0, 3) || '?').toUpperCase();

  if (logo && !err) {
    return (
      <img
        src={logo}
        alt={name}
        width={size}
        height={size}
        onError={() => setErr(true)}
        style={{
          width: size, height: size,
          objectFit: 'contain',
          background: '#111',
          borderRadius: '50%',
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#1e1e2e,#2a2a3e)',
        border: '1.5px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.3, fontWeight: 700, color: '#aaa',
        letterSpacing: '0.04em', flexShrink: 0,
        fontFamily: 'system-ui,sans-serif',
      }}
    >
      {initials.slice(0, 3)}
    </div>
  );
};

// ─── Odds button ─────────────────────────────────────────────────────────────
function OddsBtn({ label, value, selected, onClick }) {
  const has = value && value !== '—';
  return (
    <button
      onClick={has ? onClick : undefined}
      style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 2, padding: '6px 4px',
        borderRadius: 6,
        border: selected
          ? '1.5px solid #ff6b35'
          : '1.5px solid rgba(255,255,255,0.08)',
        background: selected
          ? 'rgba(255,107,53,0.18)'
          : 'rgba(255,255,255,0.04)',
        cursor: has ? 'pointer' : 'default',
        transition: 'all 0.15s',
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: has ? (selected ? '#ff6b35' : '#fff') : 'rgba(255,255,255,0.2)' }}>
        {has ? value : '—'}
      </span>
    </button>
  );
}

// ─── Helpers: extract odds from the API shape ─────────────────────────────────
function extractOdds(oddsArr, homeTeam, awayTeam) {
  if (!Array.isArray(oddsArr) || !oddsArr.length) return { home: null, draw: null, away: null };

  let home = null, draw = null, away = null;

  const hn = (homeTeam || '').toLowerCase().split(' ')[0];
  const an = (awayTeam || '').toLowerCase().split(' ')[0];

  for (const o of oddsArr) {
    const sel = (o.selection || o.outcome || '').toLowerCase();
    const val = o.odd || o.value;
    if (!val || val === '0') continue;

    if (!home && (sel === '1' || sel === 'home' || (hn && sel.includes(hn)))) {
      home = parseFloat(val).toFixed(2);
    } else if (!draw && (sel === 'x' || sel === 'draw')) {
      draw = parseFloat(val).toFixed(2);
    } else if (!away && (sel === '2' || sel === 'away' || (an && sel.includes(an)))) {
      away = parseFloat(val).toFixed(2);
    }
    if (home && draw && away) break;
  }
  return { home, draw, away };
}

// ─── MatchCard ────────────────────────────────────────────────────────────────
export const MatchCard = ({ match, compact = false }) => {
  const navigate   = useNavigate();
  const addToSlip  = useStore((s) => s.addToSlip);
  const slip       = useStore((s) => s.slip);

  const isLive     = match?.status === 'LIVE';
  const isFinished = match?.status === 'FINISHED';

  const homeTeam = match?.home?.name ?? match?.homeTeam ?? '';
  const awayTeam = match?.away?.name ?? match?.awayTeam ?? '';
  const homeLogo = match?.home?.logo ?? match?.homeLogo ?? '';
  const awayLogo = match?.away?.logo ?? match?.awayLogo ?? '';
  const scoreHome = match?.score?.home ?? match?.scoreHome ?? null;
  const scoreAway = match?.score?.away ?? match?.scoreAway ?? null;
  const hasScore  = scoreHome != null && scoreAway != null;
  const minute    = match?.minute ?? match?.metadata?.current_minute ?? null;

  // Odds from API array
  const { home: oHome, draw: oDraw, away: oAway } = extractOdds(
    match?.odds,
    homeTeam,
    awayTeam
  );

  const isSelected = (sel) =>
    slip?.some((s) => s.match_id === match?.id && s.selection === sel);

  const handleOdds = (selection, odd) => {
    if (!odd) return;
    addToSlip({
      id: `sel-${match.id}-1X2-${selection}`,
      match_id: match.id,
      match_label: `${homeTeam} vs ${awayTeam}`,
      market: '1X2',
      selection,
      odds: parseFloat(odd),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={{
        background: isLive
          ? 'linear-gradient(135deg,#1a0808 0%,#1c0f12 50%,#0f0f1a 100%)'
          : 'linear-gradient(135deg,#0f0f1a 0%,#141428 100%)',
        border: isLive ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: isLive ? '0 4px 20px rgba(239,68,68,0.12)' : '0 2px 12px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left accent bar — colour driven by live status only, no league dependency */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: isLive
          ? '#ef4444'
          : 'linear-gradient(to bottom,rgba(255,107,53,0.8),transparent)',
      }} />

      {/* Main clickable area */}
      <div
        onClick={() => navigate(`/app/match/${match?.id}`)}
        style={{ padding: compact ? '10px 12px 10px 14px' : '14px 14px 10px 14px' }}
      >
        {/* Status row — NO league label, just live/ft/time indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isLive && (
              <>
                {minute && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>{minute}'</span>
                )}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 6px', borderRadius: 4,
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
                  fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em',
                }}>
                  <motion.span
                    style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  LIVE
                </span>
              </>
            )}
            {isFinished && (
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>FT</span>
            )}
            {!isLive && !isFinished && match?.kickoff && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {new Date(match.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Teams + score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Home */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <TeamBadge team={{ name: homeTeam, logo: homeLogo, short: match?.home?.short }} size={compact ? 28 : 34} />
            <span style={{
              fontSize: compact ? 12 : 14, fontWeight: 700, color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {homeTeam || 'Home'}
            </span>
          </div>

          {/* Score / VS */}
          <div style={{ flexShrink: 0, minWidth: 44, textAlign: 'center' }}>
            {hasScore ? (
              <span style={{
                fontFamily: 'monospace', fontSize: compact ? 17 : 20, fontWeight: 900,
                color: isLive ? '#ef4444' : '#fff', letterSpacing: 2,
              }}>
                {scoreHome} – {scoreAway}
              </span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>VS</span>
            )}
          </div>

          {/* Away */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', minWidth: 0 }}>
            <span style={{
              fontSize: compact ? 12 : 14, fontWeight: 700, color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right',
            }}>
              {awayTeam || 'Away'}
            </span>
            <TeamBadge team={{ name: awayTeam, logo: awayLogo, short: match?.away?.short }} size={compact ? 28 : 34} />
          </div>
        </div>
      </div>

      {/* Odds row */}
      {!isFinished && !compact && (
        <div style={{
          display: 'flex', gap: 5, padding: '8px 14px 10px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <OddsBtn
            label={homeTeam.split(' ').pop()?.slice(0, 4) || '1'}
            value={oHome}
            selected={isSelected('HOME')}
            onClick={() => handleOdds('HOME', oHome)}
          />
          <OddsBtn
            label="Draw"
            value={oDraw}
            selected={isSelected('DRAW')}
            onClick={() => handleOdds('DRAW', oDraw)}
          />
          <OddsBtn
            label={awayTeam.split(' ').pop()?.slice(0, 4) || '2'}
            value={oAway}
            selected={isSelected('AWAY')}
            onClick={() => handleOdds('AWAY', oAway)}
          />
        </div>
      )}

      {isFinished && (
        <div style={{
          padding: '6px 14px 8px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center',
          fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Full time · Tap for details
        </div>
      )}
    </motion.div>
  );
};

// ─── Toast Host ───────────────────────────────────────────────────────────────
import { AnimatePresence } from 'framer-motion';
import { BoltIcon, CheckIcon, CloseIcon } from './icons';

export const ToastHost = () => {
  const toasts      = useStore((s) => s.toasts);
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
              t.kind === 'win'   ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
            : t.kind === 'error' ? 'bg-red-600/20 border-red-600 text-red-600'
            : 'bg-black-800 border-black-700 text-white'}`}
          >
            {t.kind === 'win'   ? <CheckIcon size={18} color="#00E676" />
           : t.kind === 'error' ? <CloseIcon  size={18} color="#FF1744" />
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
  const confidence  = prediction.confidence ?? prediction.prediction?.confidence ?? 0;
  const matchLabel  = prediction.match_label ?? prediction.prediction?.match_label ?? prediction.label ?? '–';
  const adminNote   = prediction.admin_note ?? prediction.adminNote ?? null;
  const publishedBy = prediction.published_by ?? prediction.sharedByAdminId ?? 'SpeedBet AI';
  const type        = prediction.type ?? 'football';
  const predictedScore = prediction.predicted_score ?? prediction.prediction?.predicted_score ?? null;
  const cashoutMin  = prediction.suggested_cashout_min ?? prediction.prediction?.suggested_cashout_min ?? null;
  const cashoutMax  = prediction.suggested_cashout_max ?? prediction.prediction?.suggested_cashout_max ?? null;
  const confColor   = confidence >= 0.7 ? '#00E676' : confidence >= 0.5 ? '#FFB300' : '#FF1744';

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
          <span className="font-mono font-bold text-sm">Cash @ {cashoutMin}× – {cashoutMax}×</span>
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