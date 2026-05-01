import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from '../../components/ui/UIKit';

const arcadeGames = [
  {
    slug: 'aviator',
    name: 'Aviator',
    family: 'crash',
    max_payout: '1000x',
    desc: 'Cash out before the crash. The longer you wait, the higher the multiplier.',
    tagline: 'Don\'t let it fly away',
    instructions: {
      objective: 'Cash out before the multiplier crashes to win up to 1000x your stake.',
      steps: [
        'Place your bet before the round starts',
        'Watch the multiplier increase in real-time',
        'Cash out at any time before the crash',
        'If you don\'t cash out in time, you lose your bet',
      ],
      tip: 'Try the 1.5x strategy: cash out at 1.5x consistently for steady wins.',
    },
  },
  {
    slug: 'sporty-jet',
    name: 'Sporty Jet',
    family: 'crash',
    max_payout: '750x',
    desc: 'High-speed crash game with sports-themed visuals and fast-paced action.',
    tagline: 'Speed meets strategy',
    instructions: {
      objective: 'Navigate the jet and cash out before it crashes for up to 750x.',
      steps: [
        'Set your stake amount',
        'Watch the jet take off with increasing multiplier',
        'Cash out before the jet crashes',
        'Win big if you time it right',
      ],
      tip: 'Watch for patterns in crash points to improve your timing.',
    },
  },
  {
    slug: 'sporty-kick',
    name: 'Sporty Kick',
    family: 'skill',
    max_payout: '500x',
    desc: 'Test your timing skills in this football-themed penalty shootout game.',
    tagline: 'Score big with perfect timing',
    instructions: {
      objective: 'Time your kick perfectly to score goals and win multipliers.',
      steps: [
        'Choose your stake amount',
        'Wait for the power bar to fill',
        'Click to kick at the perfect moment',
        'Score goals to increase your multiplier',
      ],
      tip: 'Aim for the corners - they give higher multipliers!',
    },
  },
  {
    slug: 'spin-bottle',
    name: 'Spin & Win',
    family: 'classic',
    max_payout: '100x',
    desc: 'Classic spinning bottle game with exciting multipliers and bonuses.',
    tagline: 'Lady luck is on your side',
    instructions: {
      objective: 'Spin the bottle and win based on where it lands.',
      steps: [
        'Place your bet',
        'Spin the bottle',
        'Win based on the section it lands on',
        'Collect your winnings',
      ],
      tip: 'Look out for the golden section - it pays 100x!',
    },
  },
  {
    slug: 'mines',
    name: 'Mines',
    family: 'skill',
    max_payout: '1000x',
    desc: 'Navigate the minefield and find gems while avoiding explosive mines.',
    tagline: 'One wrong move and boom!',
    instructions: {
      objective: 'Reveal gems without hitting mines to increase your multiplier.',
      steps: [
        'Choose grid size and number of mines',
        'Click squares to reveal what\'s underneath',
        'Cash out anytime with your current multiplier',
        'Avoid mines or lose everything',
      ],
      tip: 'Start with fewer mines to learn the game mechanics.',
    },
  },
  {
    slug: 'magic-ball',
    name: 'Magic Ball',
    family: 'classic',
    max_payout: '250x',
    desc: 'Mystical fortune-telling ball that reveals your winning multiplier.',
    tagline: 'The ball knows your fortune',
    instructions: {
      objective: 'Shake the magic ball and reveal your fortune/multiplier.',
      steps: [
        'Place your bet',
        'Shake the magic ball',
        'Watch as your fortune is revealed',
        'Collect your multiplied winnings',
      ],
      tip: 'The ball tends to be more generous after a series of low numbers.',
    },
  },
  {
    slug: 'virtual-football',
    name: 'Virtual Football',
    family: 'virtual',
    max_payout: '200x',
    desc: 'Fast-paced virtual football matches with realistic odds and outcomes.',
    tagline: '90 seconds to glory',
    instructions: {
      objective: 'Bet on virtual football matches and win based on the outcome.',
      steps: [
        'Choose a virtual football match',
        'Place bets on 1X2, OU, BTTS markets',
        'Watch the 90-second compressed match',
        'Collect winnings based on match outcome',
      ],
      tip: 'Check the form guide before betting - some teams have better stats!',
    },
  },
  {
    slug: 'lucky-slots',
    name: 'Lucky Slots',
    family: 'slots',
    max_payout: '5000x',
    desc: 'Classic slot machine with lucky sevens, bars, and massive jackpots.',
    tagline: 'Spin to win the jackpot',
    instructions: {
      objective: 'Match symbols on the paylines to win multipliers and jackpots.',
      steps: [
        'Choose your bet per line',
        'Spin the reels',
        'Match 3+ symbols on active paylines',
        'Collect your winnings or spin again',
      ],
      tip: 'The lucky 7s pay the most - keep spinning for the jackpot!',
    },
  },
  {
    slug: 'fruit-frenzy',
    name: 'Fruit Frenzy',
    family: 'slots',
    max_payout: '2500x',
    desc: 'Colorful fruit-themed slot game with exciting bonus rounds.',
    tagline: 'Fruity fun with big wins',
    instructions: {
      objective: 'Match fruit symbols and trigger bonus rounds for big wins.',
      steps: [
        'Set your bet amount',
        'Spin the fruity reels',
        'Match fruits for line wins',
        'Trigger bonus rounds for free spins',
      ],
      tip: 'The scatter symbols unlock free spins - that\'s where the big wins hide!',
    },
  },
];

import {
  PlayIcon,
  TargetIcon,
  ShieldIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InfoIcon,
} from '../../components/icons';
import { useStore } from '../../store';
import { GAME_ART } from '../../components/GameArt';

export default function GameRunner() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const game = arcadeGames.find((g) => g.slug === slug);
  const user = useStore((s) => s.user);
  const wallet = useStore((s) => s.wallet);

  const [tab, setTab] = useState('play'); // 'play' | 'how-to-play' | 'related'
  const [howToOpen, setHowToOpen] = useState(false);

  useEffect(() => {
    setTab('play');
    setHowToOpen(false);
  }, [slug]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="font-display text-2xl text-white mb-2">Game not found</h2>
          <Link to="/app/games"><Button variant="primary">Back to Games</Button></Link>
        </Card>
      </div>
    );
  }

  const familyMeta = {
    crash:   { label: 'Crash Game', color: '#E8003D' },
    classic: { label: 'Casino Classic', color: '#FFB300' },
    skill:   { label: 'Skill Game', color: '#00D4FF' },
    virtual: { label: 'Virtual Sport', color: '#00E676' },
    slots:   { label: 'Slot Machine', color: '#FFB300' },
  }[game.family] || { label: 'Game', color: '#888' };

  const Art = GAME_ART[slug];
  const relatedGames = arcadeGames.filter((g) => g.slug !== slug).slice(0, 4);

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-0)' }}>
      {/* Visual header — game art */}
      <div className="relative h-[180px] md:h-[220px] overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
        {Art && <Art className="absolute inset-0 w-full h-full" />}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(5,8,16,0.7) 70%, var(--surface-0) 100%)' }} />
        <div className="relative max-w-7xl mx-auto h-full px-4 md:px-8 flex flex-col justify-end pb-5">
          <Link to="/app/games" className="text-xs text-white/70 hover:text-white mb-2 inline-flex items-center gap-1 self-start">
            ← Games
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span
              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded"
              style={{ background: familyMeta.color, color: 'white' }}
            >
              {familyMeta.label}
            </span>
            <span className="text-xs text-white/70">Max Win <span className="font-mono font-bold text-[var(--win)]">{game.max_payout}</span></span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white">{game.name}</h1>
          <p className="text-white/80 text-sm mt-1">{game.tagline}</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b sticky top-16 z-20 backdrop-blur" style={{ borderColor: 'var(--border)', background: 'rgba(5,8,16,0.92)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-1">
          {[
            { key: 'play', label: 'Play', icon: PlayIcon },
            { key: 'how-to-play', label: 'How to Play', icon: InfoIcon },
            { key: 'related', label: 'Related Games', icon: TargetIcon },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                tab === t.key ? 'text-white' : 'text-[var(--text-60)] hover:text-white'
              }`}
            >
              <t.icon size={14} color={tab === t.key ? '#E8003D' : '#8B92A4'} />
              {t.label}
              {tab === t.key && (
                <motion.div
                  layoutId="game-tab"
                  className="absolute bottom-0 left-2 right-2 h-0.5"
                  style={{ background: 'var(--brand)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {tab === 'play' && (
          <div className="space-y-4">
            {/* Inline collapsible "Quick Rules" reminder above iframe */}
            <Card className="overflow-visible">
              <button
                onClick={() => setHowToOpen(!howToOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <InfoIcon size={16} color="#FFB300" />
                  <span className="font-medium text-sm text-white">Quick Rules</span>
                  <span className="text-xs text-[var(--text-60)] hidden sm:inline">— Tap to {howToOpen ? 'hide' : 'see'} how to play</span>
                </div>
                {howToOpen ? <ChevronUpIcon size={16} color="#8B92A4" /> : <ChevronDownIcon size={16} color="#8B92A4" />}
              </button>
              <AnimatePresence>
                {howToOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-white/90">{game.instructions.objective}</p>
                      <ol className="space-y-1.5">
                        {game.instructions.steps.map((step, i) => (
                          <li key={i} className="flex gap-2 text-sm text-[var(--text-80)]">
                            <span className="font-mono font-bold text-[var(--brand-light)] flex-shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      {game.instructions.tip && (
                        <div className="px-3 py-2 rounded-lg border-l-4 text-xs" style={{ borderColor: 'var(--vip)', background: 'rgba(255,179,0,0.06)', color: 'var(--text-80)' }}>
                          💡 <strong style={{ color: 'var(--vip)' }}>Tip:</strong> {game.instructions.tip}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Iframe with the actual game */}
            <div
              className="rounded-xl overflow-hidden border"
              style={{
                borderColor: 'var(--border)',
                height: 'calc(100vh - 360px)',
                minHeight: '600px',
                background: 'var(--surface-1)',
              }}
            >
              <iframe
                src={`/games/${slug}/index.html`}
                title={game.name}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>

            {/* Footer info row */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-[var(--text-60)]">
              <div className="flex items-center gap-3">
                <ShieldIcon size={12} color="#8B92A4" />
                <span>Practice mode · virtual credits</span>
              </div>
              {user && (
                <div>
                  Balance: <span className="font-mono font-bold text-[var(--vip)]">₵{wallet.balance.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'how-to-play' && (
          <HowToPlayPanel game={game} familyMeta={familyMeta} onPlay={() => setTab('play')} />
        )}

        {tab === 'related' && (
          <div>
            <h3 className="font-display text-xl text-white mb-4">More games like {game.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedGames.map((g) => {
                const RelArt = GAME_ART[g.slug];
                return (
                  <Link
                    key={g.slug}
                    to={`/app/games/${g.slug}`}
                    className="group block rounded-xl overflow-hidden border hover-glow"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                  >
                    <div className="aspect-[16/9] relative">
                      {RelArt && <RelArt className="absolute inset-0 w-full h-full" />}
                    </div>
                    <div className="p-3">
                      <div className="font-display text-sm text-white group-hover:text-[var(--brand-light)] transition-colors">{g.name}</div>
                      <div className="text-[11px] text-[var(--text-60)]">{g.max_payout}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HowToPlayPanel({ game, familyMeta, onPlay }) {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card className="p-6 md:p-8">
        <div className="text-xs uppercase tracking-widest mb-2 font-semibold" style={{ color: familyMeta.color }}>
          How to Play
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-white mb-3">{game.name}</h2>
        <p className="text-[var(--text-80)] text-base">{game.instructions.objective}</p>
      </Card>

      <Card className="p-6 md:p-8">
        <h3 className="font-display text-lg text-white mb-4 flex items-center gap-2">
          <PlayIcon size={16} color={familyMeta.color} />
          Step by Step
        </h3>
        <ol className="space-y-3">
          {game.instructions.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold"
                style={{ background: familyMeta.color + '22', color: familyMeta.color, border: `1px solid ${familyMeta.color}55` }}
              >
                {i + 1}
              </div>
              <p className="text-[var(--text-80)] pt-1.5 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </Card>

      {game.instructions.tip && (
        <Card className="p-6">
          <div className="flex gap-4 items-start">
            <div className="text-3xl">💡</div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--vip)' }}>Pro Tip</div>
              <p className="text-[var(--text-80)] italic">{game.instructions.tip}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-60)' }}>Max Win</div>
          <div className="font-mono font-bold text-lg" style={{ color: 'var(--win)' }}>{game.max_payout}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-60)' }}>Type</div>
          <div className="text-sm font-medium text-white">{familyMeta.label}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-60)' }}>RTP</div>
          <div className="font-mono font-bold text-lg text-white">~97%</div>
        </Card>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={onPlay}>
        <PlayIcon size={16} /> Start Playing
      </Button>
    </div>
  );
}