// Custom SVG illustrations for each arcade game tile.
// Each art piece reflects the gameplay visually.

export const AviatorArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="av-sky" x1="0" y1="0" x2="0" y2="120">
        <stop offset="0" stopColor="#991B1B" />
        <stop offset="1" stopColor="#450A0A" />
      </linearGradient>
      <linearGradient id="av-trail" x1="0" y1="0" x2="200" y2="120">
        <stop offset="0" stopColor="#FBBF24" stopOpacity="0" />
        <stop offset="1" stopColor="#FBBF24" stopOpacity="1" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" fill="url(#av-sky)" />
    {/* Stars */}
    {[[20,20],[50,15],[170,25],[140,35],[80,8],[185,55]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="1" fill="#fff" opacity="0.7" />
    ))}
    {/* Trail */}
    <path d="M 20 100 Q 80 80 130 50 T 180 20" stroke="url(#av-trail)" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Plane */}
    <g transform="translate(165, 28) rotate(-25)">
      <path d="M 0 0 L 16 -4 L 14 0 L 16 4 Z" fill="#fff" />
      <path d="M 4 -8 L 8 0 L 4 8 Z" fill="#FBBF24" />
    </g>
    {/* Multiplier badge */}
    <g transform="translate(8, 100)">
      <rect width="44" height="14" rx="3" fill="rgba(0,0,0,0.5)" />
      <text x="22" y="10" textAnchor="middle" fontSize="9" fontWeight="700" fill="#39FF7C" fontFamily="Outfit">2.45x</text>
    </g>
  </svg>
);

export const SportyJetArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="sj-bg" x1="0" y1="0" x2="0" y2="120">
        <stop offset="0" stopColor="#0F172A" />
        <stop offset="1" stopColor="#1E1B4B" />
      </linearGradient>
      <linearGradient id="sj-jet" x1="0" y1="0" x2="200" y2="60">
        <stop offset="0" stopColor="#06B6D4" />
        <stop offset="1" stopColor="#DC2626" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" fill="url(#sj-bg)" />
    {/* Grid */}
    <g stroke="rgba(220,38,38,0.15)" strokeWidth="0.5">
      {[20,40,60,80,100].map(y => <line key={y} x1="0" x2="200" y1={y} y2={y} />)}
      {[40,80,120,160].map(x => <line key={x} y1="0" y2="120" x1={x} x2={x} />)}
    </g>
    {/* Trajectory */}
    <path d="M 20 100 Q 100 90 180 30" stroke="url(#sj-jet)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="3,2" opacity="0.8" />
    {/* Jet icon */}
    <g transform="translate(170, 25) rotate(-30)">
      <path d="M -10 0 L 8 -3 L 12 0 L 8 3 Z" fill="#06B6D4" />
      <path d="M -2 -8 L 2 -3 L 2 3 L -2 8 Z" fill="#fff" opacity="0.85" />
    </g>
    {/* Particles */}
    {[[40,75],[60,68],[80,60],[100,52]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r="1.5" fill="#06B6D4" opacity={0.4 + i*0.12} />
    ))}
  </svg>
);

export const SportyKickArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="sk-grass" x1="0" y1="0" x2="0" y2="120">
        <stop offset="0" stopColor="#15803D" />
        <stop offset="1" stopColor="#052E16" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" fill="url(#sk-grass)" />
    {/* Field stripes */}
    {[0,40,80,120,160].map((x,i) => (
      <rect key={i} x={x} y="0" width="20" height="120" fill="rgba(255,255,255,0.04)" />
    ))}
    {/* Field lines */}
    <g stroke="#fff" strokeWidth="1" fill="none" opacity="0.45">
      <rect x="10" y="20" width="180" height="80" />
      <line x1="100" y1="20" x2="100" y2="100" />
      <circle cx="100" cy="60" r="18" />
      <rect x="10" y="40" width="30" height="40" />
      <rect x="160" y="40" width="30" height="40" />
    </g>
    {/* Goal post */}
    <g stroke="#fff" strokeWidth="1.5" fill="none">
      <rect x="170" y="48" width="14" height="24" />
    </g>
    {/* Ball with motion arc */}
    <path d="M 70 80 Q 120 30 165 60" stroke="#fff" strokeWidth="1.5" strokeDasharray="2,2" fill="none" opacity="0.7" />
    <circle cx="70" cy="80" r="6" fill="#fff" />
    <circle cx="70" cy="80" r="6" fill="none" stroke="#1F2937" strokeWidth="1" />
    <path d="M 70 76 L 73 78 L 72 82 L 68 82 L 67 78 Z" fill="#1F2937" />
  </svg>
);

export const SpinBottleArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="sb-bg" cx="0.5" cy="0.5" r="0.7">
        <stop offset="0" stopColor="#7C2D12" />
        <stop offset="1" stopColor="#1C0A03" />
      </radialGradient>
      <linearGradient id="sb-bottle" x1="0" y1="0" x2="0" y2="60">
        <stop offset="0" stopColor="#FBBF24" />
        <stop offset="1" stopColor="#92400E" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" fill="url(#sb-bg)" />
    {/* Felt circle */}
    <circle cx="100" cy="60" r="50" fill="rgba(0,0,0,0.45)" stroke="#FFD700" strokeWidth="1" />
    <circle cx="100" cy="60" r="42" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
    {/* UP/DOWN arrows */}
    <path d="M 95 28 L 100 22 L 105 28 Z" fill="#39FF7C" />
    <path d="M 95 92 L 100 98 L 105 92 Z" fill="#EF4444" />
    {/* Bottle (rotated) */}
    <g transform="translate(100,60) rotate(35)">
      <rect x="-3" y="-22" width="6" height="14" rx="2" fill="#92400E" />
      <ellipse cx="0" cy="-5" rx="6" ry="14" fill="url(#sb-bottle)" />
      <ellipse cx="0" cy="-5" rx="6" ry="14" fill="none" stroke="#78350F" strokeWidth="0.5" />
      <ellipse cx="-2" cy="-12" rx="1.5" ry="3" fill="#FFF6D5" opacity="0.5" />
    </g>
    {/* Spin lines */}
    {[0,72,144,216,288].map(d => (
      <line key={d} x1="100" y1="60" x2={100 + Math.cos(d*Math.PI/180)*48} y2={60 + Math.sin(d*Math.PI/180)*48}
            stroke="rgba(255,215,0,0.2)" strokeWidth="0.5" strokeDasharray="1,3" />
    ))}
  </svg>
);

export const MinesArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="m-bg" x1="0" y1="0" x2="0" y2="120">
        <stop offset="0" stopColor="#0F172A" />
        <stop offset="1" stopColor="#020617" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" fill="url(#m-bg)" />
    {/* Grid 5x3 of tiles */}
    {[0,1,2,3,4].map(c => [0,1,2].map(r => {
      const x = 32 + c*28;
      const y = 16 + r*28;
      const isDiamond = (c === 1 && r === 0) || (c === 3 && r === 1);
      const isBomb = c === 2 && r === 2;
      const isRevealed = isDiamond || isBomb;
      return (
        <g key={`${c}-${r}`}>
          <rect x={x} y={y} width="22" height="22" rx="3"
                fill={isRevealed ? (isBomb ? '#7F1D1D' : '#0E4A6B') : '#1E293B'}
                stroke={isRevealed ? (isBomb ? '#EF4444' : '#06B6D4') : '#334155'}
                strokeWidth="1" />
          {isDiamond && (
            <path d={`M ${x+11} ${y+5} L ${x+18} ${y+11} L ${x+11} ${y+17} L ${x+4} ${y+11} Z`} fill="#67E8F9" stroke="#fff" strokeWidth="0.5" />
          )}
          {isBomb && (
            <g>
              <circle cx={x+11} cy={y+12} r="5" fill="#1F2937" stroke="#FCA5A5" strokeWidth="0.5" />
              <line x1={x+11} y1={y+5} x2={x+11} y2={y+7} stroke="#FBBF24" strokeWidth="1.5" />
            </g>
          )}
        </g>
      );
    }))}
  </svg>
);

export const MagicBallArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="mb-bg" cx="0.5" cy="0.5" r="0.7">
        <stop offset="0" stopColor="#991B1B" />
        <stop offset="1" stopColor="#450A0A" />
      </radialGradient>
      <radialGradient id="mb-orb" cx="0.4" cy="0.35" r="0.55">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.4" stopColor="#EF4444" />
        <stop offset="1" stopColor="#B91C1C" />
      </radialGradient>
    </defs>
    <rect width="200" height="120" fill="url(#mb-bg)" />
    {/* Sparkles */}
    {[[30,20],[170,18],[40,90],[160,95],[15,55],[185,60]].map(([x,y],i)=>(
      <g key={i} transform={`translate(${x},${y})`}>
        <path d="M 0 -3 L 1 -1 L 3 0 L 1 1 L 0 3 L -1 1 L -3 0 L -1 -1 Z" fill="#fff" opacity="0.7" />
      </g>
    ))}
    {/* Floating small balls */}
    <circle cx="55" cy="40" r="9" fill="#EF4444" opacity="0.6" />
    <text x="55" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Outfit">7</text>
    <circle cx="150" cy="45" r="9" fill="#DC2626" opacity="0.65" />
    <text x="150" y="49" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Outfit">23</text>
    <circle cx="65" cy="90" r="8" fill="#F87171" opacity="0.55" />
    <text x="65" y="93" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1F2937" fontFamily="Outfit">11</text>
    {/* Main orb */}
    <circle cx="100" cy="65" r="22" fill="url(#mb-orb)" />
    <text x="100" y="71" textAnchor="middle" fontSize="20" fontWeight="800" fill="#1F2937" fontFamily="Outfit">36</text>
    {/* Orb glow */}
    <circle cx="100" cy="65" r="22" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
    <circle cx="100" cy="65" r="28" fill="none" stroke="#EF4444" strokeWidth="0.5" opacity="0.5" />
  </svg>
);

// Spaceman Tile Art
export const SpacemanTileArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="spt-bg" x1="0" y1="0" x2="0" y2="120">
        <stop offset="0" stopColor="#050510" />
        <stop offset="1" stopColor="#0A0A2A" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" fill="url(#spt-bg)" />
    {/* Stars */}
    {[20,40,60,80,100,150,170].map((x, i) => (
      <circle key={i} cx={x} cy={10 + Math.random()*100} r={0.5 + Math.random()*1} fill="#fff" opacity={0.5 + Math.random()*0.5} />
    ))}
    {/* Spaceman icon */}
    <g transform="translate(100, 60)">
      <ellipse cx="0" cy="3" rx="10" ry="14" fill="#E8E8E8" />
      <circle cx="0" cy="-14" r="9" fill="#F0F0F0" />
      <path d="M -6 -18 Q 0 -12 6 -18" fill="rgba(0,212,255,0.8)" />
      <rect x="-12" y="-3" width="5" height="12" fill="#D0D0D0" rx="1" />
      <ellipse cx="-10" cy="12" rx="3" ry="10" fill="rgba(255,150,50,0.7)" />
    </g>
    {/* Multiplier */}
    <text x="100" y="105" fontSize="14" fontFamily="Orbitron" fill="#00D4FF" textAnchor="middle" fontWeight="700">2.45x</text>
  </svg>
);

// Virtual Football Tile Art
export const VirtualFootballTileArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="vft-bg" x1="0" y1="0" x2="0" y2="120">
        <stop offset="0" stopColor="#0a3d0a" />
        <stop offset="1" stopColor="#0d4d0d" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" fill="url(#vft-bg)" />
    {/* Mini pitch */}
    <rect x="10" y="15" width="180" height="90" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <line x1="100" y1="15" x2="100" y2="105" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
    {/* Players */}
    <circle cx="50" cy="40" r="5" fill="#E8003D" opacity="0.8" />
    <circle cx="50" cy="80" r="5" fill="#E8003D" opacity="0.8" />
    <circle cx="150" cy="40" r="5" fill="#00D4FF" opacity="0.8" />
    <circle cx="150" cy="80" r="5" fill="#00D4FF" opacity="0.8" />
    {/* Ball */}
    <circle cx="100" cy="60" r="4" fill="#fff" />
    {/* Score */}
    <text x="100" y="14" fontSize="10" fontFamily="Orbitron" fill="#00E676" textAnchor="middle" fontWeight="700">2 - 1</text>
  </svg>
);

// Lucky Slots Tile Art
export const LuckySlotsTileArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="lst-bg" x1="0" y1="0" x2="0" y2="120">
        <stop offset="0" stopColor="#2A1A00" />
        <stop offset="1" stopColor="#0A0A0A" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" fill="url(#lst-bg)" />
    {/* Machine */}
    <rect x="25" y="15" width="150" height="90" rx="8" fill="#1C1C1C" stroke="#FFB300" strokeWidth="1.5" />
    {/* Reels */}
    {[0,1,2,3,4].map((i) => (
      <rect key={i} x={35 + i*27} y="25" width="22" height="70" rx="3" fill="#0A0A0A" stroke="#2A2A2A" strokeWidth="0.8" />
    ))}
    {/* Symbols */}
    <text x="46" y="40" fontSize="10">7️⃣</text>
    <text x="73" y="40" fontSize="10">💎</text>
    <text x="100" y="40" fontSize="10">🔔</text>
    <text x="127" y="40" fontSize="10">🍋</text>
    <text x="154" y="40" fontSize="10">🍊</text>
    {/* Win line */}
    <line x1="25" y1="60" x2="175" y2="60" stroke="#FFB300" strokeWidth="1" opacity="0.6" />
  </svg>
);

// Fruit Frenzy Tile Art
export const FruitFrenzyTileArt = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="fft-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3D0000" />
        <stop offset="1" stopColor="#1A3D00" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" fill="url(#fft-bg)" />
    {/* Machine */}
    <rect x="40" y="15" width="120" height="90" rx="8" fill="#1C1C1C" stroke="#FF6B6B" strokeWidth="1.5" />
    {/* Reels */}
    {[0,1,2].map((i) => (
      <rect key={i} x={50 + i*35} y="25" width="25" height="70" rx="3" fill="#0A0A0A" stroke="#2A2A2A" strokeWidth="0.8" />
    ))}
    {/* Fruits */}
    <text x="62" y="40" fontSize="10">🍉</text>
    <text x="97" y="40" fontSize="10">🍋</text>
    <text x="132" y="40" fontSize="10">🍇</text>
    <text x="62" y="65" fontSize="10">🍓</text>
    <text x="97" y="65" fontSize="10">🍎</text>
    <text x="132" y="65" fontSize="10">⭐</text>
    {/* Flying fruits */}
    <text x="30" y="50" fontSize="14">🍉</text>
    <text x="160" y="70" fontSize="12">🍊</text>
  </svg>
);

// Map slug → component
export const GAME_TILE_ART = {
  'aviator': AviatorArt,
  'sporty-jet': SportyJetArt,
  'sporty-kick': SportyKickArt,
  'spin-bottle': SpinBottleArt,
  'mines': MinesArt,
  'magic-ball': MagicBallArt,
  'spaceman': SpacemanTileArt,
  'virtual-football': VirtualFootballTileArt,
  'lucky-slots': LuckySlotsTileArt,
  'fruit-frenzy': FruitFrenzyTileArt,
};
