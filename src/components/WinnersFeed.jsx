import { useState, useEffect, useRef } from 'react';
import { TrophyIcon, CrownIcon, RocketIcon, BallIcon } from './icons';

const NAMES = [
  'Kwame', 'Yaw', 'Akosua', 'Kojo', 'Ama', 'Kofi', 'Esi', 'Kweku',
  'Abena', 'Yaa', 'Adjoa', 'Mensah', 'Nana', 'Kwabena', 'Akua', 'Sarpong',
];
const GAMES = [
  { name: 'Aviator', icon: RocketIcon, color: '#E8003D' },
  { name: 'Mines', icon: TrophyIcon, color: '#00D4FF' },
  { name: 'Sporty Jet', icon: RocketIcon, color: '#00D4FF' },
  { name: 'Premier League', icon: BallIcon, color: '#00E676' },
  { name: 'La Liga', icon: BallIcon, color: '#00E676' },
  { name: 'Magic Ball', icon: CrownIcon, color: '#B388FF' },
  { name: 'Spin Bottle', icon: TrophyIcon, color: '#FFB300' },
  { name: 'Champions League', icon: BallIcon, color: '#00E676' },
];

const maskName = (name) => {
  if (name.length <= 2) return name[0] + '*';
  return name[0] + '*'.repeat(Math.min(name.length - 2, 4)) + name[name.length - 1];
};

const randomWinner = () => {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const game = GAMES[Math.floor(Math.random() * GAMES.length)];
  // Weighted amounts: many small, occasional big
  const r = Math.random();
  let amount;
  if (r < 0.6) amount = Math.floor(20 + Math.random() * 200);
  else if (r < 0.9) amount = Math.floor(200 + Math.random() * 1500);
  else amount = Math.floor(1500 + Math.random() * 8000);

  return {
    id: `${Date.now()}-${Math.random()}`,
    name: maskName(name),
    game,
    amount,
    timestamp: Date.now(),
  };
};

const seedWinners = () => {
  const arr = [];
  for (let i = 0; i < 6; i++) {
    arr.push({
      ...randomWinner(),
      id: `seed-${i}`,
      timestamp: Date.now() - i * 30 * 1000,
    });
  }
  return arr;
};

const fmtTimeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

export default function WinnersFeed({ compact = false }) {
  const [winners, setWinners] = useState(seedWinners);
  const [, force] = useState(0); // for re-rendering "time ago"

  useEffect(() => {
    // Add a new winner every 4-9 seconds
    const tick = () => {
      setWinners((prev) => [randomWinner(), ...prev].slice(0, 12));
    };
    const id = setInterval(tick, 4000 + Math.random() * 5000);

    // Re-render every 15s for time-ago updates
    const tickRender = setInterval(() => force((n) => n + 1), 15000);

    return () => {
      clearInterval(id);
      clearInterval(tickRender);
    };
  }, []);

  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse shadow-[0_0_8px_#00E676]" />
          <span className="font-display text-sm font-semibold text-white">Live Winners</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-60)] font-semibold">Real-time</span>
      </div>

      <div className={`divide-y divide-[var(--border)] ${compact ? 'max-h-[280px]' : 'max-h-[420px]'} overflow-y-auto`}>
        {winners.map((w, i) => (
          <WinnerRow key={w.id} winner={w} isNew={i === 0} />
        ))}
      </div>

      <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-center" style={{ background: 'var(--surface-2)', color: 'var(--text-60)' }}>
        Could be you next
      </div>
    </div>
  );
}

function WinnerRow({ winner, isNew }) {
  const Icon = winner.game.icon;
  return (
    <div className={`px-4 py-2.5 flex items-center gap-3 ${isNew ? 'slide-in-right' : ''}`}>
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-display text-xs font-bold flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${winner.game.color}, ${winner.game.color}88)`,
          color: '#fff',
        }}
      >
        {winner.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-white truncate font-mono">{winner.name}</span>
          <Icon size={11} color={winner.game.color} />
        </div>
        <div className="text-[11px] text-[var(--text-60)] truncate">
          {winner.game.name} · {fmtTimeAgo(winner.timestamp)}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <div className="font-mono text-[13px] font-bold tabular-nums" style={{ color: '#00E676' }}>
          +₵{winner.amount.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
