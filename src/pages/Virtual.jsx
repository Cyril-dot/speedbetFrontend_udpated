import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge, Button, SectionHeader } from '../components/ui/UIKit';
import { BallIcon, ClockIcon, TargetIcon, PlayIcon, CloseIcon, CheckIcon } from '../components/icons';
import { useStore } from '../store';
import { fmtMoney } from '../utils';

const CATEGORIES = [
  { key: 'FOOTBALL',  label: 'Virtual Football',  icon: BallIcon },
  { key: 'HORSE',     label: 'Horse Racing',      icon: TargetIcon },
  { key: 'GREYHOUND', label: 'Greyhounds',         icon: TargetIcon },
  { key: 'PENALTIES', label: 'Instant Penalties', icon: BallIcon },
];

const CAT_LABEL = {
  FOOTBALL: 'FOOTBALL',
  HORSE: 'HORSE RACING',
  GREYHOUND: 'GREYHOUNDS',
  PENALTIES: 'PENALTIES',
};

export default function Virtual() {
  const [category, setCategory] = useState('ALL');
  const [, setTick] = useState(0);
  const [simEvent, setSimEvent] = useState(null);
  const addToSlip = useStore((s) => s.addToSlip);
  const pushToast = useStore((s) => s.pushToast);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const [virtualQueue, setVirtualQueue] = useState([]);

  useEffect(() => {
    // Virtual events would be fetched from API
    // For now, keep empty - API endpoint needed
  }, []);

  const filtered = category === 'ALL' ? virtualQueue : virtualQueue.filter((v) => v.category === category);

  const handleAddOdds = (event, market, pick, odds) => {
    addToSlip({
      id: `virt-${event.id}-${market}-${pick}`,
      match_id: event.id,
      match_label: `${event.home || `Event #${event.id}`}${event.away ? ' vs ' + event.away : ''}`,
      market,
      selection: pick,
      odds,
    });
    pushToast({ variant: 'win', title: 'Added to slip', message: `${pick} @ ${odds.toFixed(2)}` });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      {/* Hero strip — clean, no gradient */}
      <div className="border-b" style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="live-dot" />
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--brand)' }}>Rolling Queue · Auto-replenishing</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl mb-1" style={{ color: 'var(--text-100)' }}>
            Instant Virtuals
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'var(--text-60)' }}>
            Matches every 15 seconds · Never wait for real-world kickoff
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="border-b sticky top-[64px] z-10" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <CategoryPill
              active={category === 'ALL'}
              onClick={() => setCategory('ALL')}
              label="All"
              count={virtualQueue.length}
            />
            {CATEGORIES.map((c) => {
              const count = virtualQueue.filter((v) => v.category === c.key).length;
              return (
                <CategoryPill
                  key={c.key}
                  active={category === c.key}
                  onClick={() => setCategory(c.key)}
                  label={c.label}
                  count={count}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <SectionHeader
          kicker={`${filtered.length} events · kickoffs every 15s`}
          title="Next Up"
          action={<Badge variant="new">AUTO-REPLENISHED</Badge>}
        />

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((v, i) => (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.04 }}
              >
                <VirtualEventRow
                  event={v}
                  index={i}
                  onPlay={() => setSimEvent(v)}
                  onAddOdds={handleAddOdds}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* How it works panel */}
        <div className="mt-10 p-5 rounded-xl" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}>
          <div className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--brand)' }}>How it works</div>
          <h3 className="font-display text-xl mb-2" style={{ color: 'var(--text-100)' }}>
            The queue never stops
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-80)' }}>
            Virtual matches run continuously across multiple categories. Football features real-time matches with 
player tracking. Horse &amp; greyhound sprints settle quickly. Penalties deliver fast-paced action. 
Tap any odds button to add to your slip, or hit WATCH to view the event.
          </p>
        </div>
      </div>

      {/* Simulation modal */}
      {simEvent && <SimulationModal event={simEvent} onClose={() => setSimEvent(null)} onAddOdds={handleAddOdds} />}
    </div>
  );
}

function CategoryPill({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className="px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5"
      style={{
        background: active ? 'var(--brand)' : 'var(--surface-2)',
        color: active ? '#fff' : 'var(--text-80)',
      }}
    >
      {label}
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full"
        style={{
          background: active ? 'rgba(255,255,255,0.25)' : 'var(--surface-3)',
          color: active ? '#fff' : 'var(--text-60)',
        }}
      >
        {count}
      </span>
    </button>
  );
}

function VirtualEventRow({ event: v, index, onPlay, onAddOdds }) {
  const secondsToKick = v.kickoff_in;
  const label = v.category === 'FOOTBALL' && v.home
    ? `${v.home} vs ${v.away}`
    : `Event #${index + 1} — ${CAT_LABEL[v.category]}`;
  const showOdds = v.category === 'FOOTBALL' && v.odds;

  return (
    <Card className="p-4 card-hover">
      {/* Mobile: stacked layout */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Top row on mobile / left on desktop: icon + label */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--brand-bg)', border: '1px solid var(--brand)' }}
          >
            <BallIcon size={18} color="var(--brand)" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-60)' }}>
                {CAT_LABEL[v.category]}
              </span>
              {index === 0 && <Badge variant="vip">SPECIAL</Badge>}
            </div>
            <div className="font-semibold truncate" style={{ color: 'var(--text-100)' }}>{label}</div>
            <div className="md:hidden flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--text-60)' }}>
              <ClockIcon size={11} color="currentColor" />
              <span className="font-mono tabular-nums">{secondsToKick > 0 ? `${secondsToKick}s` : 'NOW'}</span>
            </div>
          </div>
          {/* Desktop only: kickoff timer */}
          <div className="hidden md:flex flex-col items-center text-xs flex-shrink-0" style={{ color: 'var(--text-60)' }}>
            <ClockIcon size={12} color="currentColor" />
            <span className="font-mono tabular-nums mt-0.5">{secondsToKick > 0 ? `${secondsToKick}s` : 'NOW'}</span>
          </div>
        </div>

        {/* Bottom row on mobile / right on desktop: odds + play */}
        <div className="flex items-center gap-2 md:flex-shrink-0">
          {showOdds ? (
            <div className="grid grid-cols-3 gap-1 flex-1 md:w-44">
              {[
                ['1', 'HOME', v.odds['1X2'].HOME],
                ['X', 'DRAW', v.odds['1X2'].DRAW],
                ['2', 'AWAY', v.odds['1X2'].AWAY],
              ].map(([p, sel, val]) => (
                <button
                  key={p}
                  onClick={() => onAddOdds(v, '1X2', sel, val)}
                  className="rounded-lg py-2 text-center transition-all"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand)';
                    e.currentTarget.style.background = 'var(--brand-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--surface-2)';
                  }}
                >
                  <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-60)' }}>{p}</div>
                  <div className="font-mono tabular-nums text-sm font-bold" style={{ color: 'var(--brand)' }}>
                    {val.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 md:flex-initial text-xs font-mono px-3 py-2 rounded-lg text-center" style={{ background: 'var(--surface-2)', color: 'var(--text-80)' }}>
              {v.entrants} entrants
            </div>
          )}
          <Button size="sm" variant="primary" onClick={onPlay}>
            <PlayIcon size={12} /> Watch
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// SIMULATION MODAL — actually simulates the event
// ─────────────────────────────────────────────
function SimulationModal({ event, onClose, onAddOdds }) {
  const [phase, setPhase] = useState('countdown'); // countdown | live | finished
  const [seconds, setSeconds] = useState(5);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [matchMinute, setMatchMinute] = useState(0);
  const [winner, setWinner] = useState(null);
  const [position, setPosition] = useState(0); // for races

  // Countdown phase
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (seconds <= 0) {
      setPhase('live');
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 800);
    return () => clearTimeout(t);
  }, [phase, seconds]);

  // Live simulation
  useEffect(() => {
    if (phase !== 'live') return;
    const isFootball = event.category === 'FOOTBALL';
    if (isFootball) {
      const total = 18; // ticks (90 in-game min compressed)
      let tick = 0;
      const id = setInterval(() => {
        tick++;
        setMatchMinute(Math.min(90, Math.round((tick / total) * 90)));
        // 25% chance of goal each tick
        if (Math.random() < 0.25) {
          const homeOrAway = Math.random() < 0.5;
          setScore((s) => homeOrAway ? { ...s, home: s.home + 1 } : { ...s, away: s.away + 1 });
        }
        if (tick >= total) {
          clearInterval(id);
          setPhase('finished');
        }
      }, 500);
      return () => clearInterval(id);
    } else {
      // Race / penalty: position-based simulation
      const total = 20;
      let tick = 0;
      const id = setInterval(() => {
        tick++;
        setPosition((tick / total) * 100);
        if (tick >= total) {
          clearInterval(id);
          // Pick random winner
          const w = Math.floor(Math.random() * (event.entrants || 6)) + 1;
          setWinner(w);
          setPhase('finished');
        }
      }, 250);
      return () => clearInterval(id);
    }
  }, [phase, event]);

  const isFootball = event.category === 'FOOTBALL';
  const label = isFootball && event.home ? `${event.home} vs ${event.away}` : `${CAT_LABEL[event.category]} Event`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#FFFFFF' }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--brand)' }}>
              {CAT_LABEL[event.category]}
            </div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text-100)' }}>{label}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-3)', color: 'var(--text-80)' }}
          >
            <CloseIcon size={14} color="currentColor" />
          </button>
        </div>

        {/* Body — phases */}
        <div className="p-6 min-h-[260px] flex flex-col items-center justify-center text-center">
          {phase === 'countdown' && (
            <>
              <div className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--text-60)' }}>Kicks off in</div>
              <motion.div
                key={seconds}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-mono font-extrabold tabular-nums"
                style={{ fontSize: '6rem', color: 'var(--brand)', lineHeight: 1 }}
              >
                {seconds}
              </motion.div>
              <div className="text-sm mt-3" style={{ color: 'var(--text-80)' }}>
                Get ready for the action…
              </div>
            </>
          )}

          {phase === 'live' && isFootball && (
            <>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="live-dot" />
                <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color: 'var(--loss)' }}>
                  Live · {matchMinute}'
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-3 w-full">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--text-60)' }}>Home</div>
                  <div className="text-base font-bold leading-tight" style={{ color: 'var(--text-100)' }}>{event.home}</div>
                </div>
                <motion.div
                  key={`${score.home}-${score.away}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="font-mono font-extrabold tabular-nums px-4 py-2 rounded-xl"
                  style={{ fontSize: '3rem', color: 'var(--brand)', background: 'var(--brand-bg)', lineHeight: 1 }}
                >
                  {score.home}·{score.away}
                </motion.div>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--text-60)' }}>Away</div>
                  <div className="text-base font-bold leading-tight" style={{ color: 'var(--text-100)' }}>{event.away}</div>
                </div>
              </div>
            </>
          )}

          {phase === 'live' && !isFootball && (
            <>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="live-dot" />
                <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color: 'var(--loss)' }}>Race in progress</span>
              </div>
              <div className="w-full space-y-2">
                {[1, 2, 3, 4, 5, 6].slice(0, event.entrants || 6).map((n) => {
                  const offset = Math.sin(n * 1.7) * 5;
                  return (
                    <div key={n} className="flex items-center gap-2">
                      <div className="text-xs font-mono w-6" style={{ color: 'var(--text-60)' }}>#{n}</div>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                        <motion.div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, position + offset))}%`,
                            background: n === 3 ? 'var(--brand)' : 'var(--brand-lighter)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {phase === 'finished' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="text-3xl mb-2">🏁</div>
              <div className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--text-60)' }}>Final Result</div>
              {isFootball ? (
                <>
                  <div className="font-mono text-4xl font-extrabold mb-1" style={{ color: 'var(--text-100)' }}>
                    {score.home} · {score.away}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-80)' }}>
                    {score.home > score.away ? `${event.home} wins` : score.away > score.home ? `${event.away} wins` : 'Draw'}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-mono text-4xl font-extrabold mb-1" style={{ color: 'var(--brand)' }}>
                    #{winner}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-80)' }}>Winner</div>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
          {phase === 'finished' ? (
            <>
              <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>Close</Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => {
                  // Reset the modal so the user can re-watch
                  setPhase('countdown');
                  setSeconds(5);
                  setScore({ home: 0, away: 0 });
                  setMatchMinute(0);
                  setWinner(null);
                  setPosition(0);
                }}
              >
                Watch Again
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="md" className="w-full" onClick={onClose}>Skip</Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
