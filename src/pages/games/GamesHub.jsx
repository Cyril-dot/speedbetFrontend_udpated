import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card, Badge, SectionHeader } from '../../components/ui/UIKit';

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
  // {
  //   slug: 'magic-ball',
  //   name: 'Magic Ball',
  //   family: 'classic',
  //   max_payout: '250x',
  //   desc: 'Mystical fortune-telling ball that reveals your winning multiplier.',
  //   tagline: 'The ball knows your fortune',
  //   instructions: {
  //     objective: 'Shake the magic ball and reveal your fortune/multiplier.',
  //     steps: [
  //       'Place your bet',
  //       'Shake the magic ball',
  //       'Watch as your fortune is revealed',
  //       'Collect your multiplied winnings',
  //     ],
  //     tip: 'The ball tends to be more generous after a series of low numbers.',
  //   },
  // },
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
  // {
  //   slug: 'lucky-slots',
  //   name: 'Lucky Slots',
  //   family: 'slots',
  //   max_payout: '5000x',
  //   desc: 'Classic slot machine with lucky sevens, bars, and massive jackpots.',
  //   tagline: 'Spin to win the jackpot',
  //   instructions: {
  //     objective: 'Match symbols on the paylines to win multipliers and jackpots.',
  //     steps: [
  //       'Choose your bet per line',
  //       'Spin the reels',
  //       'Match 3+ symbols on active paylines',
  //       'Collect your winnings or spin again',
  //     ],
  //     tip: 'The lucky 7s pay the most - keep spinning for the jackpot!',
  //   },
  // },
  // {
  //   slug: 'fruit-frenzy',
  //   name: 'Fruit Frenzy',
  //   family: 'slots',
  //   max_payout: '2500x',
  //   desc: 'Colorful fruit-themed slot game with exciting bonus rounds.',
  //   tagline: 'Fruity fun with big wins',
  //   instructions: {
  //     objective: 'Match fruit symbols and trigger bonus rounds for big wins.',
  //     steps: [
  //       'Set your bet amount',
  //       'Spin the fruity reels',
  //       'Match fruits for line wins',
  //       'Trigger bonus rounds for free spins',
  //     ],
  //     tip: 'The scatter symbols unlock free spins - that\'s where the big wins hide!',
  //   },
  // },
];

import { GAME_TILE_ART } from '../../components/GameTileArt';
import {
  RocketIcon,
  PlayIcon,
  CrownIcon,
  ChartBarIcon,
  ArrowRightIcon,
  TrophyIcon,
  FlameIcon,
  BoltIcon,
} from '../../components/icons';
import { useStore } from '../../store';

const FAMILY_META = {
  crash:   { label: 'Crash', icon: RocketIcon, color: '#E8003D' },
  classic: { label: 'Classic', icon: TrophyIcon, color: '#FFB300' },
  skill:   { label: 'Skill', icon: ChartBarIcon, color: '#00D4FF' },
  virtual: { label: 'Virtual', icon: BoltIcon, color: '#00E676' },
  slots:   { label: 'Slots', icon: FlameIcon, color: '#FFB300' },
};

export default function GamesHub() {
  const user = useStore((s) => s.user);

  return (
    <div className="min-h-screen">

      {/* All games grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <SectionHeader kicker={`${arcadeGames.length} games available`} title="All Games" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {arcadeGames.map((g, i) => (
            <motion.div
              key={g.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <GameTile game={g} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <SectionHeader kicker="Browse by type" title="Categories" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(FAMILY_META).map(([key, meta]) => {
            const count = arcadeGames.filter((g) => g.family === key).length;
            return (
              <Card key={key} className="p-5 text-center hover:border-crimson-400 transition-all cursor-pointer">
                <meta.icon size={28} color={meta.color} className="mx-auto mb-2" />
                <div className="font-display text-lg text-white mb-1">{meta.label}</div>
                <div className="font-mono text-2xl tabular-nums" style={{ color: meta.color }}>
                  {count}
                </div>
                <div className="text-xs uppercase tracking-wider text-white-60 mt-1">games</div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* VIP teaser */}
      {!user?.vip && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <Card className="relative overflow-hidden border-amber-400 bg-gradient-to-br from-amber-400/10 via-crimson-400/5 to-black-900 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-5">
              <CrownIcon size={36} color="#FFB300" />
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1">VIP Exclusive</div>
                <h3 className="font-display text-2xl text-white">Unlock crash schedule + free spins</h3>
                <p className="text-white-80 text-sm mt-1">See the next 5 crash multipliers + monthly giveaway spin.</p>
              </div>
              <Link to="/app/vip">
                <Button variant="primary" size="lg">
                  Become VIP <ArrowRightIcon size={14} />
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

function GameTile({ game }) {
  const meta = FAMILY_META[game.family];
  const Art = GAME_TILE_ART[game.slug];

  return (
    <Link
      to={`/app/games/${game.slug}`}
      className="group block relative overflow-hidden rounded-xl border transition-all card-hover"
      style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
    >
      {/* Custom art area */}
      <div className="aspect-[16/9] relative overflow-hidden">
        {Art ? <Art /> : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--grad-deep)' }}>
            <span className="text-4xl">🎮</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        <Badge variant="default" className="absolute top-3 left-3">{meta.label.toUpperCase()}</Badge>
        <div className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold" style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', backdropFilter: 'blur(4px)' }}>
          <span className="opacity-70 mr-1">Max</span>
          <span className="font-mono" style={{ color: '#39FF7C' }}>{game.max_payout}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display text-lg font-bold mb-1 group-hover:text-brand-600 transition-colors" style={{ color: 'var(--text-100)' }}>
          {game.name}
        </h3>
        <p className="text-sm mb-3 line-clamp-1" style={{ color: 'var(--text-60)' }}>{game.desc}</p>
        <Button variant="primary" size="sm" className="w-full">
          <PlayIcon size={12} /> Play Now
        </Button>
      </div>
    </Link>
  );
}