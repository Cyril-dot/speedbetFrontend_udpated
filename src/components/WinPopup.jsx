import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { fmtMoney, fmtTimeAgo } from '../utils';
import { CloseIcon, ShareIcon } from './icons';

export default function WinPopup() {
  const lastWinId = useStore((s) => s.lastWinId);
  const bets = useStore((s) => s.bets);
  const dismissWin = useStore((s) => s.dismissWin);

  const winningBet = bets.find((b) => b.id === lastWinId);
  const open = Boolean(winningBet);

  return (
    <AnimatePresence>
      {open && winningBet && (
        <motion.div
          key="win-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: 'rgba(17,24,39,0.78)', backdropFilter: 'blur(10px)' }}
          onClick={dismissWin}
        >
          <Confetti />
          <Burst />
          <motion.div
            initial={{ scale: 0.5, y: 80, opacity: 0, rotateZ: -3 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateZ: 0 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 0 80px rgba(255, 215, 0, 0.4), 0 25px 60px rgba(124, 58, 237, 0.5)',
            }}
          >
            <WinCard bet={winningBet} onClose={dismissWin} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Confetti rain
function Confetti() {
  const pieces = [...Array(40)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.8 + Math.random() * 1.6,
    rotate: Math.random() * 720,
    char: ['🎉', '🎊', '✨', '⭐', '💜', '🏆', '💰'][i % 7],
    size: 18 + Math.random() * 18,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -50, x: `${p.x}vw`, opacity: 0, rotate: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute"
          style={{ fontSize: `${p.size}px` }}
        >
          {p.char}
        </motion.div>
      ))}
    </div>
  );
}

// Radial burst behind the popup
function Burst() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 2.5, 2.5], opacity: [0, 0.5, 0] }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
      className="absolute pointer-events-none"
      style={{
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)',
      }}
    />
  );
}

function WinCard({ bet, onClose }) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      const dataUrl = await renderBetCard(bet);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `speedbet-win-${bet.id.slice(-6)}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const dataUrl = await renderBetCard(bet);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `speedbet-win.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My SpeedBet Win',
          text: `Just won ${fmtMoney(bet.potential_return)} on SpeedBet! 🏆`,
        });
      } else {
        handleExport();
      }
    } catch {
      handleExport();
    }
  };

  return (
    <div>
      {/* ═══════ HERO ═══════ */}
      <div
        className="relative px-6 pt-8 pb-7 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #991B1B 0%, #DC2626 50%, #B91C1C 100%)' }}
      >
        {/* Animated glow rays */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(255,215,0,0.18) 30deg, transparent 60deg, transparent 180deg, rgba(255,215,0,0.18) 210deg, transparent 240deg)',
          }}
        />
        {/* Sparkles */}
        {[
          [12, 18], [88, 22], [20, 70], [82, 75], [50, 12], [50, 85], [10, 50], [90, 50],
        ].map(([x, y], i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%`, color: '#FFD700' }}
            animate={{ scale: [0.5, 1.4, 0.5], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, delay: i * 0.15, repeat: Infinity }}
          >
            ✦
          </motion.div>
        ))}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors z-10"
        >
          <CloseIcon size={16} color="currentColor" />
        </button>

        {/* TROPHY — big, animated, golden */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="relative mx-auto mb-3"
          style={{ width: 110, height: 110 }}
        >
          {/* Halo */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.95, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />
          {/* Bouncing trophy */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex items-center justify-center w-full h-full"
          >
            <Trophy />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[12px] uppercase tracking-[0.45em] font-bold text-white/85 mb-1"
        >
          🏆 You Won
        </motion.div>

        {/* AMOUNT — huge, glowing gold */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.5 }}
          className="font-extrabold tabular-nums leading-[0.95] tracking-tight"
          style={{
            fontSize: 'clamp(2.5rem, 11vw, 4rem)',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD700 50%, #FFB800 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 40px rgba(255,215,0,0.6)',
            filter: 'drop-shadow(0 4px 20px rgba(255,215,0,0.5))',
          }}
        >
          GHS {bet.potential_return.toFixed(2)}
        </motion.div>

        {/* ODDS BADGE — vibrant pill */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 240, damping: 18 }}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FBBF24 100%)',
            boxShadow: '0 6px 20px rgba(255,215,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
          }}
        >
          <span className="text-[10px] uppercase tracking-widest font-extrabold" style={{ color: '#991B1B' }}>
            {bet.selections.length} pick{bet.selections.length === 1 ? '' : 's'} ·
          </span>
          <span className="font-mono text-lg font-extrabold tabular-nums" style={{ color: '#991B1B' }}>
            {bet.total_odds.toFixed(2)}× ODDS
          </span>
        </motion.div>
      </div>

      {/* ═══════ BODY ═══════ */}
      <div className="p-5">
        {/* Stake → Won */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-4">
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
            <div className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: 'var(--text-60)' }}>You Staked</div>
            <div className="font-mono text-lg font-extrabold tabular-nums" style={{ color: 'var(--text-100)' }}>
              {fmtMoney(bet.stake)}
            </div>
          </div>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-2xl font-bold"
            style={{ color: 'var(--brand)' }}
          >
            →
          </motion.div>
          <div
            className="text-center p-3 rounded-xl border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(22,163,74,0.15))',
              borderColor: 'var(--win)',
              boxShadow: '0 4px 16px rgba(22,163,74,0.2)',
            }}
          >
            <div className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: 'var(--win)' }}>You Won</div>
            <div className="font-mono text-lg font-extrabold tabular-nums" style={{ color: 'var(--win)' }}>
              {fmtMoney(bet.potential_return)}
            </div>
          </div>
        </div>

        {/* Selections list */}
        <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-60)' }}>
          {bet.selections.length} Winning Selection{bet.selections.length === 1 ? '' : 's'}
        </div>
        <div className="space-y-1.5 mb-5 max-h-44 overflow-y-auto pr-1">
          {bet.selections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              className="flex items-center gap-2 p-2.5 rounded-lg text-sm"
              style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'var(--win)', color: '#fff' }}
              >
                ✓
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" style={{ color: 'var(--text-100)' }}>
                  {s.match || s.match_label}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-60)' }}>
                  {s.market} · {s.selection || s.pick}
                </div>
              </div>
              <div className="font-mono font-extrabold text-sm tabular-nums flex-shrink-0" style={{ color: 'var(--win)' }}>
                {(s.odds || 1).toFixed(2)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'var(--surface-2)', color: 'var(--text-80)' }}
          >
            Close
          </button>
          <button
            onClick={handleExport}
            disabled={downloading}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{ background: 'var(--surface-3)', color: 'var(--text-100)' }}
          >
            {downloading ? '…' : '💾 Save'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
            style={{ background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)' }}
          >
            <ShareIcon size={12} className="inline mr-1" /> Share
          </button>
        </div>

        <div className="text-center mt-3 text-[11px]" style={{ color: 'var(--text-60)' }}>
          #{bet.id.slice(-8).toUpperCase()} · {fmtTimeAgo(bet.placed_at)}
        </div>
      </div>
    </div>
  );
}

function Trophy() {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.4))' }}>
      <defs>
        <linearGradient id="cup-grad" x1="0" y1="0" x2="0" y2="60">
          <stop offset="0" stopColor="#FFE875" />
          <stop offset="0.45" stopColor="#FFD700" />
          <stop offset="1" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="cup-shine" x1="0" y1="0" x2="0" y2="40">
          <stop offset="0" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="base-grad" x1="0" y1="0" x2="0" y2="20">
          <stop offset="0" stopColor="#FFD700" />
          <stop offset="1" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      {/* Handles */}
      <path d="M 18 22 Q 6 22 6 38 Q 6 50 24 48" stroke="url(#cup-grad)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M 72 22 Q 84 22 84 38 Q 84 50 66 48" stroke="url(#cup-grad)" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Cup body */}
      <path d="M 20 14 L 70 14 L 65 50 Q 60 60 45 60 Q 30 60 25 50 Z" fill="url(#cup-grad)" stroke="#8B6914" strokeWidth="1" />
      {/* Cup shine */}
      <path d="M 26 18 L 32 18 L 32 38 Q 30 42 26 42 Z" fill="url(#cup-shine)" />
      {/* Star on cup */}
      <path d="M 45 30 L 47 36 L 53 36 L 48 40 L 50 46 L 45 42 L 40 46 L 42 40 L 37 36 L 43 36 Z" fill="#FFFFFF" />
      {/* Stem */}
      <rect x="40" y="60" width="10" height="8" fill="url(#cup-grad)" />
      {/* Base */}
      <rect x="28" y="68" width="34" height="6" rx="1.5" fill="url(#base-grad)" />
      <rect x="22" y="74" width="46" height="8" rx="2" fill="url(#base-grad)" stroke="#8B6914" strokeWidth="0.5" />
    </svg>
  );
}

// ═══════ EXPORT-AS-IMAGE — vibrant version ═══════
async function renderBetCard(bet) {
  const W = 600;
  const H = 800;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background (white)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Hero header
  const grad = ctx.createLinearGradient(0, 0, W, 280);
  grad.addColorStop(0, '#991B1B');
  grad.addColorStop(0.5, '#DC2626');
  grad.addColorStop(1, '#B91C1C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 280);

  // Trophy emoji
  ctx.font = '88px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', W / 2, 110);

  // YOU WON
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '700 14px Outfit, sans-serif';
  ctx.fillText('🏆  YOU WON  🏆', W / 2, 140);

  // Amount — gold gradient
  const amountGrad = ctx.createLinearGradient(0, 160, 0, 220);
  amountGrad.addColorStop(0, '#FFFFFF');
  amountGrad.addColorStop(0.5, '#FFD700');
  amountGrad.addColorStop(1, '#FFB800');
  ctx.fillStyle = amountGrad;
  ctx.font = '900 60px Outfit, sans-serif';
  ctx.fillText(`GHS ${bet.potential_return.toFixed(2)}`, W / 2, 210);

  // Odds pill
  const pillW = 280;
  const pillH = 40;
  const pillX = (W - pillW) / 2;
  const pillY = 232;
  const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY + pillH);
  pillGrad.addColorStop(0, '#FFD700');
  pillGrad.addColorStop(1, '#FBBF24');
  ctx.fillStyle = pillGrad;
  roundRect(ctx, pillX, pillY, pillW, pillH, 20);
  ctx.fill();
  ctx.fillStyle = '#5B21B6';
  ctx.font = '900 18px Outfit, sans-serif';
  ctx.fillText(`${bet.selections.length} PICKS · ${bet.total_odds.toFixed(2)}× ODDS`, W / 2, pillY + 26);

  // Stake / Won boxes
  let y = 320;
  // Staked
  ctx.fillStyle = '#F4F4F7';
  roundRect(ctx, 32, y, 240, 80, 12);
  ctx.fill();
  ctx.fillStyle = '#6B7280';
  ctx.font = '700 11px Outfit, sans-serif';
  ctx.fillText('YOU STAKED', 32 + 120, y + 28);
  ctx.fillStyle = '#111827';
  ctx.font = '900 24px Outfit, sans-serif';
  ctx.fillText(`GHS ${bet.stake.toFixed(2)}`, 32 + 120, y + 60);

  // Arrow
  ctx.fillStyle = '#7C3AED';
  ctx.font = '900 24px Outfit, sans-serif';
  ctx.fillText('→', W / 2, y + 50);

  // Won
  ctx.fillStyle = 'rgba(22,163,74,0.1)';
  roundRect(ctx, W - 32 - 240, y, 240, 80, 12);
  ctx.fill();
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 2;
  roundRect(ctx, W - 32 - 240, y, 240, 80, 12);
  ctx.stroke();
  ctx.fillStyle = '#16A34A';
  ctx.font = '700 11px Outfit, sans-serif';
  ctx.fillText('YOU WON', W - 32 - 120, y + 28);
  ctx.font = '900 24px Outfit, sans-serif';
  ctx.fillText(`GHS ${bet.potential_return.toFixed(2)}`, W - 32 - 120, y + 60);

  // Selections
  y = 432;
  ctx.textAlign = 'left';
  ctx.font = '700 11px Outfit, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(`${bet.selections.length} WINNING SELECTIONS`.toUpperCase(), 32, y);
  y += 20;

  bet.selections.slice(0, 5).forEach((s) => {
    if (y > 660) return;
    ctx.fillStyle = 'rgba(22,163,74,0.06)';
    roundRect(ctx, 32, y, W - 64, 50, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(22,163,74,0.2)';
    ctx.lineWidth = 1;
    roundRect(ctx, 32, y, W - 64, 50, 8);
    ctx.stroke();

    // Check
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.arc(56, y + 25, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', 56, y + 30);

    // Match name
    ctx.fillStyle = '#111827';
    ctx.font = '500 14px Outfit, sans-serif';
    ctx.textAlign = 'left';
    const match = (s.match || s.match_label || '').slice(0, 42);
    ctx.fillText(match, 78, y + 22);

    // Market · pick
    ctx.fillStyle = '#6B7280';
    ctx.font = '400 12px Outfit, sans-serif';
    ctx.fillText(`${s.market} · ${s.selection || s.pick}`, 78, y + 40);

    // Odds
    ctx.fillStyle = '#16A34A';
    ctx.font = '900 16px Outfit, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText((s.odds || 1).toFixed(2), W - 48, y + 32);
    ctx.textAlign = 'left';

    y += 56;
  });

  // Footer brand
  ctx.fillStyle = '#7C3AED';
  ctx.font = '900 26px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SpeedBet', W / 2, H - 40);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '500 11px Outfit, sans-serif';
  ctx.fillText(`#${bet.id.slice(-8).toUpperCase()}  ·  speedbet.app`, W / 2, H - 20);

  return canvas.toDataURL('image/png');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
