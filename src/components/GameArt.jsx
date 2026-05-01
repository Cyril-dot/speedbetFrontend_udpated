// Premium SVG game art — distinct visual per game type
// All use shared color tokens for unified palette

export function FootballArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fb-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B5345" />
          <stop offset="1" stopColor="#0B0F1A" />
        </linearGradient>
        <radialGradient id="fb-spot" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="url(#fb-bg)" />
      {/* Pitch lines */}
      <g stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none">
        <rect x="20" y="20" width="360" height="180" />
        <line x1="200" y1="20" x2="200" y2="200" />
        <circle cx="200" cy="110" r="35" />
        <rect x="20" y="60" width="60" height="100" />
        <rect x="320" y="60" width="60" height="100" />
        <rect x="20" y="85" width="20" height="50" />
        <rect x="360" y="85" width="20" height="50" />
      </g>
      <ellipse cx="200" cy="110" rx="80" ry="40" fill="url(#fb-spot)" />
      {/* Ball */}
      <circle cx="200" cy="110" r="6" fill="white" />
      <circle cx="200" cy="110" r="6" fill="url(#fb-spot)" opacity="0.5" />
      {/* Stadium lights */}
      <g fill="#FFD700">
        <circle cx="50" cy="35" r="2" />
        <circle cx="350" cy="35" r="2" />
        <circle cx="80" cy="35" r="2" />
        <circle cx="320" cy="35" r="2" />
      </g>
    </svg>
  );
}

export function BasketballArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bb-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5C2A00" />
          <stop offset="1" stopColor="#0B0F1A" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#bb-bg)" />
      {/* Court lines (top-down) */}
      <g stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none">
        <rect x="20" y="20" width="360" height="180" />
        <line x1="200" y1="20" x2="200" y2="200" />
        <circle cx="200" cy="110" r="22" />
        <path d="M 20 60 Q 70 110 20 160" />
        <path d="M 380 60 Q 330 110 380 160" />
        <line x1="20" y1="60" x2="60" y2="60" />
        <line x1="20" y1="160" x2="60" y2="160" />
        <line x1="340" y1="60" x2="380" y2="60" />
        <line x1="340" y1="160" x2="380" y2="160" />
      </g>
      {/* Basketball */}
      <g transform="translate(200, 110)">
        <circle r="14" fill="#E8003D" />
        <path d="M -14 0 L 14 0 M 0 -14 L 0 14" stroke="#1A0008" strokeWidth="1.5" fill="none" />
        <path d="M -10 -10 Q 0 -4 10 -10 M -10 10 Q 0 4 10 10" stroke="#1A0008" strokeWidth="1.5" fill="none" />
      </g>
    </svg>
  );
}

export function HorseRacingArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="hr-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2D1810" />
          <stop offset="1" stopColor="#0B0F1A" />
        </linearGradient>
        <linearGradient id="hr-track" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8B5A2B" />
          <stop offset="1" stopColor="#5C3A1B" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#hr-bg)" />
      {/* Track curves */}
      <path d="M 0 140 Q 200 100 400 140 L 400 220 L 0 220 Z" fill="url(#hr-track)" opacity="0.7" />
      {/* Track lines */}
      <g stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none">
        <path d="M 0 150 Q 200 110 400 150" strokeDasharray="6 4" />
        <path d="M 0 170 Q 200 130 400 170" strokeDasharray="6 4" />
        <path d="M 0 190 Q 200 150 400 190" strokeDasharray="6 4" />
      </g>
      {/* Horse silhouettes */}
      {[
        { x: 100, y: 140, color: '#E8003D' },
        { x: 180, y: 150, color: '#FFB300' },
        { x: 260, y: 145, color: '#00D4FF' },
        { x: 320, y: 155, color: '#00E676' },
      ].map((h, i) => (
        <g key={i} transform={`translate(${h.x}, ${h.y})`}>
          {/* Body */}
          <ellipse cx="0" cy="0" rx="16" ry="8" fill={h.color} />
          {/* Neck */}
          <path d={`M 12 -2 L 18 -10 L 22 -8 L 16 0 Z`} fill={h.color} />
          {/* Head */}
          <ellipse cx="22" cy="-9" rx="4" ry="3" fill={h.color} />
          {/* Legs (stylized) */}
          <line x1="-8" y1="6" x2="-10" y2="14" stroke={h.color} strokeWidth="2" />
          <line x1="-3" y1="6" x2="-5" y2="14" stroke={h.color} strokeWidth="2" />
          <line x1="6" y1="6" x2="8" y2="14" stroke={h.color} strokeWidth="2" />
          <line x1="11" y1="6" x2="13" y2="14" stroke={h.color} strokeWidth="2" />
          {/* Number */}
          <text x="0" y="2" fontSize="6" fontFamily="Roboto Mono" fill="white" textAnchor="middle" fontWeight="700">{i + 1}</text>
        </g>
      ))}
      {/* Sky / sun */}
      <circle cx="60" cy="50" r="25" fill="#FFB300" opacity="0.4" />
    </svg>
  );
}

export function VirtualGamesArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1A0033" />
          <stop offset="0.5" stopColor="#0B0F1A" />
          <stop offset="1" stopColor="#001A33" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#vr-bg)" />
      {/* Grid floor (perspective) */}
      <g stroke="#B388FF" strokeWidth="0.6" opacity="0.4">
        {[0, 30, 60, 90, 120, 150, 180].map((y) => (
          <line key={y} x1="0" y1={130 + y * 0.4} x2="400" y2={130 + y * 0.4} opacity={0.6 - y * 0.003} />
        ))}
        {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => {
          const cx = 200;
          const slope = (x - cx) * 0.8;
          return <line key={x} x1={x} y1="130" x2={cx + slope} y2="220" />;
        })}
      </g>
      {/* Neon orbs */}
      <g>
        <circle cx="100" cy="80" r="20" fill="#E8003D" opacity="0.7" />
        <circle cx="100" cy="80" r="40" fill="#E8003D" opacity="0.15" />
        <circle cx="300" cy="60" r="15" fill="#00D4FF" opacity="0.7" />
        <circle cx="300" cy="60" r="32" fill="#00D4FF" opacity="0.15" />
        <circle cx="200" cy="50" r="12" fill="#B388FF" opacity="0.7" />
      </g>
      {/* Crown center */}
      <g transform="translate(200, 100)">
        <path d="M -25 10 L -25 -5 L -15 5 L -5 -10 L 5 -10 L 15 5 L 25 -5 L 25 10 Z" fill="#FFB300" opacity="0.85" />
      </g>
    </svg>
  );
}

export function CasinoArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cs-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A0808" />
          <stop offset="1" stopColor="#0B0F1A" />
        </linearGradient>
        <radialGradient id="cs-spot" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="rgba(255,179,0,0.18)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="url(#cs-bg)" />
      <ellipse cx="200" cy="120" rx="180" ry="60" fill="url(#cs-spot)" />
      {/* Chips stack */}
      <g transform="translate(95, 130)">
        {[0, -8, -16, -24, -32].map((y, i) => (
          <ellipse key={i} cx="0" cy={y} rx="32" ry="8"
            fill={['#E8003D', '#00D4FF', '#FFB300', '#00E676', '#E8003D'][i]} stroke="#000" strokeWidth="1" />
        ))}
        <ellipse cx="0" cy="-32" rx="32" ry="8" fill="#FF1F5C" />
        <text x="0" y="-30" fontSize="9" fontFamily="Poppins" fill="white" textAnchor="middle" fontWeight="700">$</text>
      </g>
      {/* Cards */}
      <g transform="translate(220, 100) rotate(-10)">
        <rect width="55" height="80" rx="6" fill="white" />
        <text x="10" y="20" fontFamily="Poppins" fontSize="14" fontWeight="700" fill="#E8003D">A</text>
        <text x="44" y="74" fontFamily="Poppins" fontSize="14" fontWeight="700" fill="#E8003D" textAnchor="end" transform="rotate(180 44 74)">A</text>
        <path d="M 27 30 L 35 42 L 27 54 L 19 42 Z" fill="#E8003D" />
      </g>
      <g transform="translate(280, 90) rotate(8)">
        <rect width="55" height="80" rx="6" fill="white" />
        <text x="10" y="20" fontFamily="Poppins" fontSize="14" fontWeight="700" fill="#1A1A1A">K</text>
        <path d="M 27 30 L 35 42 L 27 54 L 19 42 Z" fill="#1A1A1A" />
      </g>
    </svg>
  );
}

export function CrashGameArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B0F1A" />
          <stop offset="1" stopColor="#1A0008" />
        </linearGradient>
        <linearGradient id="cr-line" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#E8003D" stopOpacity="0" />
          <stop offset="0.6" stopColor="#E8003D" />
          <stop offset="1" stopColor="#FF1F5C" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#cr-bg)" />
      {/* Grid */}
      <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
        {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} />)}
        {[80, 160, 240, 320].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="220" />)}
      </g>
      {/* Curve */}
      <path d="M 20 200 Q 150 180 250 100 T 380 30" stroke="url(#cr-line)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 20 200 Q 150 180 250 100 T 380 30 L 380 220 L 20 220 Z" fill="url(#cr-line)" opacity="0.15" />
      {/* Plane */}
      <g transform="translate(380, 30)">
        <path d="M -8 -3 L 8 0 L -8 3 L -4 0 Z" fill="#FFFFFF" />
        <path d="M -4 -1 L 0 -8 L 2 -7 L -2 0 Z" fill="#FFFFFF" />
      </g>
      {/* Multiplier text */}
      <text x="200" y="115" fontSize="44" fontFamily="Poppins" fontWeight="800" fill="#FFFFFF" textAnchor="middle" opacity="0.9">2.45x</text>
    </svg>
  );
}

export function MinesArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="mn-bg" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor="#001833" />
          <stop offset="1" stopColor="#050810" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="url(#mn-bg)" />
      {/* Tiles 5x3 */}
      {Array.from({ length: 15 }, (_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 60 + col * 56;
        const y = 30 + row * 56;
        const isDiamond = [3, 6, 8, 11].includes(i);
        const isBomb = [4, 9].includes(i);
        return (
          <g key={i} transform={`translate(${x}, ${y})`}>
            <rect width="48" height="48" rx="8"
              fill={isDiamond ? '#001a2a' : isBomb ? '#2a0008' : '#131826'}
              stroke={isDiamond ? '#00D4FF' : isBomb ? '#E8003D' : '#1F2433'}
              strokeWidth="1.5" />
            {isDiamond && (
              <path d="M 24 14 L 38 24 L 24 38 L 10 24 Z" fill="#00D4FF" opacity="0.9" />
            )}
            {isBomb && (
              <circle cx="24" cy="24" r="10" fill="#E8003D" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Spaceman Art
export function SpacemanArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050510" />
          <stop offset="1" stopColor="#0A0A2A" />
        </linearGradient>
        <radialGradient id="sp-nebula" cx="0.3" cy="0.3" r="0.5">
          <stop offset="0" stopColor="rgba(0,212,255,0.1)" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sp-bg)" />
      {/* Nebula */}
      <circle cx="100" cy="60" r="80" fill="url(#sp-nebula)" />
      {/* Stars */}
      {[30,50,80,120,150,180,200,250,300,350].map((x, i) => (
        <circle key={i} cx={x} cy={20 + Math.random()*180} r={0.5 + Math.random()*1.5} fill="#fff" opacity={0.3 + Math.random()*0.7} />
      ))}
      {/* Spaceman */}
      <g transform="translate(200, 110)">
        {/* Body */}
        <ellipse cx="0" cy="5" rx="16" ry="22" fill="#E8E8E8" />
        {/* Helmet */}
        <circle cx="0" cy="-22" r="15" fill="#F0F0F0" />
        {/* Visor */}
        <path d="M -10 -28 Q 0 -20 10 -28" fill="rgba(0,212,255,0.8)" />
        {/* Jetpack */}
        <rect x="-20" y="-5" width="8" height="18" fill="#D0D0D0" rx="2" />
        {/* Flame */}
        <ellipse cx="-17" cy="18" rx="5" ry="15" fill="rgba(255,150,50,0.8)">
          <animate attributeName="ry" values="15;20;15" dur="0.3s" repeatCount="indefinite" />
        </ellipse>
        {/* Flag line */}
        <text x="25" y="5" fontSize="14" fontFamily="Orbitron" fill="#00D4FF" fontWeight="700">2.45x</text>
      </g>
      {/* Planets */}
      <circle cx="320" cy="40" r="30" fill="#4ECDC4" opacity="0.15" />
      <circle cx="60" cy="180" r="20" fill="#45B7D1" opacity="0.12" />
    </svg>
  );
}

// Virtual Football Art
export function VirtualFootballArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vf-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a3d0a" />
          <stop offset="1" stopColor="#0d4d0d" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#vf-bg)" />
      {/* Grass stripes */}
      {[0,40,80,120,160].map((y) => (
        <rect key={y} x="0" y={y} width="400" height="40" fill="rgba(255,255,255,0.02)" />
      ))}
      {/* Pitch outline */}
      <rect x="20" y="20" width="360" height="180" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <line x1="200" y1="20" x2="200" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <circle cx="200" cy="110" r="35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      {/* Players */}
      {[100,140,180,220,260,300].map((x, i) => (
        <circle key={i} cx={x} cy={60 + (i%2)*80} r="8" fill={i < 3 ? '#E8003D' : '#00D4FF'} opacity="0.8" />
      ))}
      {/* Ball */}
      <circle cx="200" cy="110" r="6" fill="#fff" />
      {/* Scoreboard */}
      <rect x="160" y="30" width="80" height="25" rx="4" fill="rgba(0,0,0,0.5)" />
      <text x="200" y="48" fontSize="14" fontFamily="Orbitron" fill="#00E676" textAnchor="middle" fontWeight="700">2 - 1</text>
    </svg>
  );
}

// Lucky Slots Art
export function LuckySlotsArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="ls-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A1A00" />
          <stop offset="1" stopColor="#0A0A0A" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#ls-bg)" />
      {/* Machine frame */}
      <rect x="50" y="30" width="300" height="160" rx="12" fill="#1C1C1C" stroke="#FFB300" strokeWidth="2" />
      {/* Reels */}
      {[0,1,2,3,4].map((i) => (
        <rect key={i} x={70 + i*55} y="50" width="45" height="120" rx="6" fill="#0A0A0A" stroke="#2A2A2A" strokeWidth="1" />
      ))}
      {/* Symbols in reels */}
      {[
        {x: 0, y: 0, sym: '7️⃣'}, {x: 1, y: 0, sym: '💎'}, {x: 2, y: 0, sym: '🔔'},
        {x: 0, y: 1, sym: '🍋'}, {x: 1, y: 1, sym: '7️⃣'}, {x: 2, y: 1, sym: '🍊'},
        {x: 0, y: 2, sym: '🍇'}, {x: 1, y: 2, sym: '🍒'}, {x: 2, y: 2, sym: '💎'},
        {x: 3, y: 0, sym: '🔔'}, {x: 4, y: 0, sym: '🍋'},
        {x: 3, y: 1, sym: '💎'}, {x: 4, y: 1, sym: '🍇'},
        {x: 3, y: 2, sym: '7️⃣'}, {x: 4, y: 2, sym: '🍊'},
      ].map(({x, y, sym}, i) => (
        <text key={i} x={70 + x*55 + 22} y={65 + y*40} fontSize="20" textAnchor="middle" dominantBaseline="middle">{sym}</text>
      ))}
      {/* Win line */}
      <line x1="50" y1="110" x2="350" y2="110" stroke="#FFB300" strokeWidth="2" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
      </line>
      {/* Title */}
      <text x="200" y="20" fontSize="14" fontFamily="Orbitron" fill="#FFB300" textAnchor="middle" fontWeight="700">LUCKY SLOTS</text>
    </svg>
  );
}

// Fruit Frenzy Art
export function FruitFrenzyArt({ className = '' }) {
  return (
    <svg viewBox="0 0 400 220" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="ff-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3D0000" />
          <stop offset="0.5" stopColor="#2A0A0A" />
          <stop offset="1" stopColor="#1A3D00" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#ff-bg)" />
      {/* Machine frame */}
      <rect x="80" y="30" width="240" height="160" rx="12" fill="#1C1C1C" stroke="#FF6B6B" strokeWidth="2" />
      {/* Reels */}
      {[0,1,2].map((i) => (
        <rect key={i} x={100 + i*70} y="50" width="50" height="120" rx="6" fill="#0A0A0A" stroke="#2A2A2A" strokeWidth="1" />
      ))}
      {/* Fruit symbols */}
      {[
        {x: 0, y: 0, sym: '🍉'}, {x: 1, y: 0, sym: '🍋'}, {x: 2, y: 0, sym: '🍊'},
        {x: 0, y: 1, sym: '🍇'}, {x: 1, y: 1, sym: '🍓'}, {x: 2, y: 1, sym: '🍎'},
        {x: 0, y: 2, sym: '🍑'}, {x: 1, y: 2, sym: '🍒'}, {x: 2, y: 2, sym: '⭐'},
      ].map(({x, y, sym}, i) => (
        <text key={i} x={100 + x*70 + 25} y={65 + y*40} fontSize="22" textAnchor="middle" dominantBaseline="middle">{sym}</text>
      ))}
      {/* Win lines */}
      {[60, 110, 160].map((y) => (
        <line key={y} x1="80" y1={y} x2="320" y2={y} stroke="#FFB300" strokeWidth="1.5" opacity="0.5" strokeDasharray="4,2" />
      ))}
      {/* Title */}
      <text x="200" y="20" fontSize="14" fontFamily="Orbitron" fill="#FF6B6B" textAnchor="middle" fontWeight="700">FRUIT FRENZY</text>
      {/* Flying fruit */}
      <text x="40" y="80" fontSize="24">🍉</text>
      <text x="360" y="140" fontSize="20">🍊</text>
      <text x="50" y="180" fontSize="18">🍇</text>
    </svg>
  );
}

// Map arcade game slug -> art component
export const GAME_ART = {
  aviator: CrashGameArt,
  'sporty-jet': CrashGameArt,
  'sporty-kick': FootballArt,
  'spin-bottle': CasinoArt,
  mines: MinesArt,
  'magic-ball': CasinoArt,
  'spaceman': SpacemanArt,
  'virtual-football': VirtualFootballArt,
  'lucky-slots': LuckySlotsArt,
  'fruit-frenzy': FruitFrenzyArt,
};

// Map sport category -> art
export const SPORT_ART = {
  football: FootballArt,
  basketball: BasketballArt,
  horse: HorseRacingArt,
  virtual: VirtualGamesArt,
  casino: CasinoArt,
  crash: CrashGameArt,
};
