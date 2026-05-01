import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { matches as matchesApi } from '../api';
import { MatchCard } from '../components/Shared';
import {
  scrollFadeIn,
  scrollScaleIn,
  staggerFadeIn,
  cardHover,
  mouseTilt,
  footerSlideUp,
  linkHoverUnderline,
  mouseSpotlight,
  cleanupAnimations,
} from '../utils/animations';
import { Button, Card } from '../components/ui/UIKit';
import { ArrowRightIcon, CrownIcon, TrophyIcon, GiftIcon, RocketIcon } from '../components/icons';
import WinnersFeed from '../components/WinnersFeed';
import SponsorMarquee, { TeamMarquee } from '../components/SponsorMarquee';
import HomeCarousel from '../components/HomeCarousel';
import { GAME_TILE_ART } from '../components/GameTileArt';

// ─── Top 6 league helpers ─────────────────────────────────────────────────────
import {
  resolveHardcodedLogo,
  isTop6LeagueMatch,
  TEAM_LOGOS,
  TOP6_LEAGUES,
} from '../data/TOP_6_LEAGUES_DATA';

// ─── Arcade games ─────────────────────────────────────────────────────────────
const arcadeGames = [
  { slug: 'aviator',          name: 'Aviator',          family: 'crash',   max_payout: '1000x', desc: 'Cash out before the crash. The longer you wait, the higher the multiplier.' },
  { slug: 'sporty-jet',       name: 'Sporty Jet',       family: 'crash',   max_payout: '750x',  desc: 'High-speed crash game with sports-themed visuals and fast-paced action.' },
  { slug: 'sporty-kick',      name: 'Sporty Kick',      family: 'skill',   max_payout: '500x',  desc: 'Test your timing skills in this football-themed penalty shootout game.' },
  { slug: 'spin-bottle',      name: 'Spin & Win',       family: 'classic', max_payout: '100x',  desc: 'Classic spinning bottle game with exciting multipliers and bonuses.' },
  { slug: 'mines',            name: 'Mines',            family: 'skill',   max_payout: '1000x', desc: 'Navigate the minefield and find gems while avoiding explosive mines.' },
  { slug: 'magic-ball',       name: 'Magic Ball',       family: 'classic', max_payout: '250x',  desc: 'Mystical fortune-telling ball that reveals your winning multiplier.' },
  { slug: 'spaceman',         name: 'Spaceman',         family: 'crash',   max_payout: '5000x', desc: 'Intergalactic crash game with the highest multipliers in the galaxy.' },
  { slug: 'virtual-football', name: 'Virtual Football', family: 'virtual', max_payout: '200x',  desc: 'Fast-paced virtual football matches with realistic odds and outcomes.' },
  { slug: 'lucky-slots',      name: 'Lucky Slots',      family: 'slots',   max_payout: '5000x', desc: 'Classic slot machine with lucky sevens, bars, and massive jackpots.' },
  { slug: 'fruit-frenzy',     name: 'Fruit Frenzy',     family: 'slots',   max_payout: '2500x', desc: 'Colorful fruit-themed slot game with exciting bonus rounds.' },
];

// ─── Keywords that identify cup / championship competitions ──────────────────
const CUP_CHAMPIONSHIP_KEYWORDS = [
  'cup', 'champions', 'championship', 'copa', 'coupe', 'pokal', 'fa cup',
  'carabao', 'league cup', 'super cup', 'supercup', 'libertadores',
  'europa', 'conference', 'world cup', 'nations', 'shield', 'trophy',
  'final', 'playoff', 'play-off', 'knockout', 'ucl', 'uel', 'uecl',
  'premier league', 'la liga', 'bundesliga', 'serie a', 'ligue 1', 'ligue1',
];

// ─── Demo / hardcoded matches to suppress ────────────────────────────────────
const DEMO_MATCH_PAIRS = [
  ['Bayern Munich', 'Dortmund'],
  ['Arsenal',       'Chelsea'],
  ['Barcelona',     'Real Madrid'],
];

// ─── Resolve raw API field variations ────────────────────────────────────────
function resolveTeamName(m, side) {
  const isHome = side === 'home';
  return (
    (isHome ? m.homeTeam : m.awayTeam) ??
    (isHome ? m.home?.name : m.away?.name) ??
    (isHome ? m.home_name : m.away_name) ??
    (isHome ? m.team_home : m.team_away) ??
    ''
  );
}

function resolveTeamLogo(m, side) {
  const isHome = side === 'home';
  return (
    (isHome ? m.homeLogo : m.awayLogo) ??
    (isHome ? m.home?.logo : m.away?.logo) ??
    (isHome ? m.home_logo : m.away_logo) ??
    ''
  );
}

function isDemoMatch(m) {
  const home = resolveTeamName(m, 'home');
  const away = resolveTeamName(m, 'away');
  return DEMO_MATCH_PAIRS.some(
    ([dh, da]) => home.includes(dh) && away.includes(da)
  );
}

export function isCupOrChampionship(leagueName = '') {
  const l = leagueName.toLowerCase();
  return CUP_CHAMPIONSHIP_KEYWORDS.some((kw) => l.includes(kw));
}

// ─── Enrich a single team object with hardcoded logo if API logo is missing ──
function enrichTeam(teamObj) {
  if (!teamObj) return teamObj;
  if (teamObj.logo) return teamObj; // API already provided a logo — keep it
  const hardcoded = resolveHardcodedLogo(teamObj.name);
  if (hardcoded) return { ...teamObj, logo: hardcoded };
  return teamObj;
}

// ─── Adapt raw API match to normalised shape, then enrich logos ───────────────
function adaptMatch(m) {
  const homeName = resolveTeamName(m, 'home');
  const awayName = resolveTeamName(m, 'away');
  const homeLogo = resolveTeamLogo(m, 'home');
  const awayLogo = resolveTeamLogo(m, 'away');

  const league =
    m.league ??
    m.competition?.name ??
    m.league_name ??
    '';

  const scoreHome =
    m.scoreHome ?? m.score?.home ?? m.score_home ?? null;
  const scoreAway =
    m.scoreAway ?? m.score?.away ?? m.score_away ?? null;

  const kickoff =
    m.kickoffAt ?? m.kickoff ?? m.kick_off ?? m.startTime ?? null;

  const minute =
    m.minute ??
    m.metadata?.current_minute ??
    m.metadata?.['current_minute'] ??
    null;

  const rawHome = {
    name:  homeName,
    short: (m.home?.short ?? homeName.slice(0, 3)).toUpperCase(),
    color: m.home?.color ?? '#888',
    logo:  homeLogo,
  };

  const rawAway = {
    name:  awayName,
    short: (m.away?.short ?? awayName.slice(0, 3)).toUpperCase(),
    color: m.away?.color ?? '#888',
    logo:  awayLogo,
  };

  return {
    id:      m.id ?? m.externalId ?? `match-${Math.random().toString(36).slice(2)}`,
    status:  m.status ?? 'SCHEDULED',
    league,
    // ── Enrich logos from hardcoded map when API logo is absent ──────────────
    home:    enrichTeam(rawHome),
    away:    enrichTeam(rawAway),
    score:   { home: scoreHome, away: scoreAway },
    minute,
    kickoff,
    odds:    m.odds ?? null,
  };
}

// ─── Check if a match has at least one top-6 team (uses adapted shape) ────────
function matchIsTop6(m) {
  return isTop6LeagueMatch(m.home?.name ?? '', m.away?.name ?? '');
}

// ─── Fallback carousel slides built purely from hardcoded data ────────────────
// Picks one high-profile fixture per league so the carousel is never empty.
export function getFallbackCarouselMatches() {
  return [
    {
      id: 'fallback-1', status: 'UPCOMING', league: 'Premier League',
      home: { name: 'Arsenal',   logo: resolveHardcodedLogo('Arsenal'),   short: 'ARS', color: '#EF0107' },
      away: { name: 'Liverpool', logo: resolveHardcodedLogo('Liverpool'),  short: 'LIV', color: '#C8102E' },
      score: { home: null, away: null }, minute: null, kickoff: null, odds: null,
    },
    {
      id: 'fallback-2', status: 'UPCOMING', league: 'La Liga',
      home: { name: 'Real Madrid', logo: resolveHardcodedLogo('Real Madrid'), short: 'RMA', color: '#FEBE10' },
      away: { name: 'Barcelona',   logo: resolveHardcodedLogo('Barcelona'),   short: 'BAR', color: '#A50044' },
      score: { home: null, away: null }, minute: null, kickoff: null, odds: null,
    },
    {
      id: 'fallback-3', status: 'UPCOMING', league: 'Bundesliga',
      home: { name: 'Bayern Munich',      logo: resolveHardcodedLogo('Bayern Munich'),      short: 'BAY', color: '#DC052D' },
      away: { name: 'Borussia Dortmund',  logo: resolveHardcodedLogo('Borussia Dortmund'),  short: 'BVB', color: '#FDE100' },
      score: { home: null, away: null }, minute: null, kickoff: null, odds: null,
    },
    {
      id: 'fallback-4', status: 'UPCOMING', league: 'Serie A',
      home: { name: 'Inter Milan', logo: resolveHardcodedLogo('Inter Milan'), short: 'INT', color: '#0068A8' },
      away: { name: 'Juventus',    logo: resolveHardcodedLogo('Juventus'),    short: 'JUV', color: '#000000' },
      score: { home: null, away: null }, minute: null, kickoff: null, odds: null,
    },
    {
      id: 'fallback-5', status: 'UPCOMING', league: 'Ligue 1',
      home: { name: 'Paris Saint-Germain', logo: resolveHardcodedLogo('PSG'),       short: 'PSG', color: '#004170' },
      away: { name: 'Marseille',           logo: resolveHardcodedLogo('Marseille'),  short: 'OM',  color: '#2faee0' },
      score: { home: null, away: null }, minute: null, kickoff: null, odds: null,
    },
  ];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function MatchSkeleton() {
  return (
    <div className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', minHeight: 110 }}>
      <div className="h-3 w-24 rounded mb-3" style={{ background: 'var(--surface-2)' }} />
      <div className="flex justify-between items-center gap-4">
        <div className="h-4 w-28 rounded" style={{ background: 'var(--surface-2)' }} />
        <div className="h-6 w-12 rounded" style={{ background: 'var(--surface-2)' }} />
        <div className="h-4 w-28 rounded" style={{ background: 'var(--surface-2)' }} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  const [liveMatches,     setLiveMatches]     = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [endedMatches,    setEndedMatches]    = useState([]);
  const [allMatches,      setAllMatches]      = useState([]);
  const [loading,         setLoading]         = useState(true);

  const featuredGames = arcadeGames.slice(0, 6);

  const liveSectionRef     = useRef(null);
  const upcomingSectionRef = useRef(null);
  const gamesSectionRef    = useRef(null);
  const quickNavRef        = useRef(null);
  const gameCardRefs       = useRef([]);

  useEffect(() => {
    let cancelled = false;

    function adaptWithOdds(arr) {
      return (arr ?? []).map((entry) => {
        const raw     = entry.match ?? entry;
        const odds    = entry.odds ?? raw.odds ?? null;
        const adapted = adaptMatch(raw);
        adapted.odds  = odds;
        return adapted;
      });
    }

    async function load() {
      try {
        const [withOddsData, results] = await Promise.all([
          matchesApi.withOdds(),
          matchesApi.results(),
        ]);

        if (cancelled) return;

        const adaptedLive = adaptWithOdds(withOddsData?.live)
          .filter((m) => !isDemoMatch(m));

        // Sort upcoming: top-6 teams first → then any with logos → then rest
        const allUpcoming = adaptWithOdds(withOddsData?.upcoming)
          .filter((m) => !isDemoMatch(m));

        const upTop6       = allUpcoming.filter((m) =>  matchIsTop6(m));
        const upWithLogos  = allUpcoming.filter((m) => !matchIsTop6(m) && m.home?.logo && m.away?.logo);
        const upRest       = allUpcoming.filter((m) => !matchIsTop6(m) && (!m.home?.logo || !m.away?.logo));
        const adaptedUpcoming = [...upTop6, ...upWithLogos, ...upRest].slice(0, 6);

        const adaptedEnded = (results ?? [])
          .map((m) => adaptMatch(m))
          .filter((m) => !isDemoMatch(m))
          .slice(0, 4);

        setLiveMatches(adaptedLive);
        setUpcomingMatches(adaptedUpcoming);
        setEndedMatches(adaptedEnded);
        setAllMatches([...adaptedLive, ...adaptedUpcoming]);
      } catch (err) {
        console.error('Home: failed to load matches', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Refresh live matches every 30 s
    const iv = setInterval(async () => {
      try {
        const data = await matchesApi.withOdds();
        if (!cancelled) {
          const live = (data?.live ?? []).map((entry) => {
            const raw     = entry.match ?? entry;
            const adapted = adaptMatch(raw);
            adapted.odds  = entry.odds ?? raw.odds ?? null;
            return adapted;
          }).filter((m) => !isDemoMatch(m));

          setLiveMatches(live);
          setAllMatches((prev) => {
            const upcoming = prev.filter((m) => m.status !== 'LIVE');
            return [...live, ...upcoming];
          });
        }
      } catch { /* silent */ }
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(iv);
      cleanupAnimations();
    };
  }, []);

  // GSAP animations after load
  useEffect(() => {
    if (!loading) {
      if (quickNavRef.current)      staggerFadeIn(quickNavRef.current.children);
      if (liveSectionRef.current)   scrollFadeIn(liveSectionRef.current);
      if (upcomingSectionRef.current) scrollFadeIn(upcomingSectionRef.current);
      if (gamesSectionRef.current)  scrollScaleIn(gamesSectionRef.current);
    }
  }, [loading]);

  // ── Carousel: prefer top-6 / cup matches from API; fall back to hardcoded ──
  const apiCarouselMatches = allMatches.filter(
    (m) => isCupOrChampionship(m.league) || matchIsTop6(m)
  );
  const carouselMatches = apiCarouselMatches.length > 0
    ? apiCarouselMatches
    : getFallbackCarouselMatches();

  return (
    <div className="w-full overflow-x-hidden" style={{ background: 'var(--surface-1)' }}>

      {/* ═══ HERO CAROUSEL ═══ */}
      <HomeCarousel matches={carouselMatches} />

      {/* ═══ QUICK NAV STRIP ═══ */}
      <section
        ref={quickNavRef}
        className="border-b"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {[
            { label: 'Live Now',      to: '/app/live',        accent: 'var(--loss)' },
            { label: 'Sports',        to: '/app/sports',      accent: 'var(--brand)' },
            { label: 'Predictions',   to: '/app/predictions', accent: 'var(--info)' },
            { label: 'Booking Codes', to: '/app/booking',     accent: 'var(--vip)' },
            { label: 'Casino',        to: '/app/games',       accent: 'var(--win)' },
            { label: 'Virtual',       to: '/app/virtual',     accent: 'var(--brand-lighter)' },
            { label: 'My Wallet',     to: '/app/wallet',      accent: 'var(--text-100)' },
          ].map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
              style={{ background: 'var(--surface-2)', color: 'var(--text-100)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = q.accent; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-100)'; }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: q.accent }} />
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ LIVE MATCHES ═══ */}
      <section ref={liveSectionRef} className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="live-dot" />
              <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color: 'var(--loss)' }}>In Play</span>
            </div>
            <h2 className="text-2xl md:text-3xl">Live Now</h2>
          </div>
          <Link to="/app/live">
            <Button variant="ghost" size="sm">All Live <ArrowRightIcon size={12} /></Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <MatchSkeleton key={i} />)}
          </div>
        ) : liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {liveMatches.map((m, i) => (
              <motion.div key={m.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <MatchCard match={m} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 rounded-xl" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}>
            <div className="text-3xl mb-2">⚽</div>
            <p className="text-sm" style={{ color: 'var(--text-60)' }}>No live matches right now. Check back soon.</p>
          </div>
        )}
      </section>

      {/* ═══ UPCOMING MATCHES ═══ */}
      <section ref={upcomingSectionRef} className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--brand)' }}>Up next</div>
            <h2 className="text-2xl md:text-3xl">Upcoming</h2>
          </div>
          <Link to="/app/sports">
            <Button variant="ghost" size="sm">Full Schedule <ArrowRightIcon size={12} /></Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => <MatchSkeleton key={i} />)}
          </div>
        ) : upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.map((m, i) => (
              <motion.div key={m.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <MatchCard match={m} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 rounded-xl" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-60)' }}>No upcoming matches scheduled yet.</p>
          </div>
        )}
      </section>

      {/* ═══ TEAM LOGOS MARQUEE ═══ */}
      <TeamMarquee />

      {/* ═══ FEATURED GAMES ═══ */}
      <section ref={gamesSectionRef} className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--brand)' }}>Beyond the slip</div>
            <h2 className="text-2xl md:text-3xl">Featured Games</h2>
          </div>
          <Link to="/app/games">
            <Button variant="ghost" size="sm">All Games <ArrowRightIcon size={12} /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {featuredGames.map((g, i) => {
            const Art = GAME_TILE_ART[g.slug];
            return (
              <motion.button
                ref={(el) => {
                  if (el) {
                    gameCardRefs.current[i] = el;
                    mouseSpotlight(el);
                    cardHover(el);
                  }
                }}
                key={g.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/app/games/${g.slug}`)}
                className="rounded-xl card-hover relative overflow-hidden group flex flex-col text-left"
                style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}
              >
                <div className="aspect-[5/3] relative overflow-hidden">
                  {Art ? <Art /> : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--grad-deep)' }}>
                      <span className="text-3xl">🎮</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="p-3">
                  <div className="font-display text-sm font-bold leading-tight" style={{ color: 'var(--text-100)' }}>{g.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-60)' }}>{g.family}</div>
                    <div className="font-mono text-xs font-bold" style={{ color: 'var(--brand)' }}>{g.max_payout}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ═══ VIP BANNER ═══ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <Card className="relative overflow-hidden p-8 md:p-12" style={{ background: 'var(--grad-hero)', color: '#fff' }}>
          <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
          <div className="relative grid md:grid-cols-[1.5fr_1fr] gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CrownIcon size={20} color="#FFD700" />
                <span className="text-[11px] uppercase tracking-widest font-bold text-amber-200">Exclusive Membership</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight" style={{ color: '#fff' }}>
                Unlock VIP — GHS 250 / 30 days
              </h3>
              <p className="text-white/85 mb-5">
                Crash schedule, weekly cashback, free bets, boosted odds, and priority withdrawals. Your sharpest 30 days.
              </p>
              <button
                onClick={() => navigate('/app/vip')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white font-bold text-sm hover:bg-gray-100 transition-all hover:-translate-y-0.5"
                style={{ color: 'var(--brand-dark)' }}
              >
                Become VIP →
              </button>
            </div>
            <div className="hidden md:flex flex-col gap-2">
              {[
                { icon: RocketIcon, label: 'See next 5 crash points' },
                { icon: GiftIcon,   label: '5% weekly cashback' },
                { icon: TrophyIcon, label: 'Monthly giveaway spin' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                  <b.icon size={16} color="#FFD700" />
                  <span className="text-sm font-medium" style={{ color: '#fff' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* ═══ WINNERS FEED ═══ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="mb-5">
          <div className="text-[11px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--brand)' }}>Live wins right now</div>
          <h2 className="text-2xl md:text-3xl">Recent Winners</h2>
        </div>
        <WinnersFeed compact />
      </section>

      {/* ═══ RECENT RESULTS ═══ */}
      {!loading && endedMatches.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-5">
            <div className="text-[11px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--brand)' }}>Just finished</div>
            <h2 className="text-2xl md:text-3xl">Recent Results</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {endedMatches.map((m, i) => (
              <motion.div key={m.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <MatchCard match={m} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ SPONSORS ═══ */}
      <SponsorMarquee />

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const footerRef = useRef(null);
  const linkRefs  = useRef([]);

  useEffect(() => {
    if (footerRef.current) footerSlideUp(footerRef.current);
    linkRefs.current.forEach((l) => { if (l) linkHoverUnderline(l); });
  }, []);

  const links = {
    Sports:  [{ label: 'Live Now', to: '/app/live' }, { label: 'All Sports', to: '/app/sports' }, { label: 'Predictions', to: '/app/predictions' }, { label: 'Booking Codes', to: '/app/booking' }, { label: 'Virtuals', to: '/app/virtual' }],
    Casino:  [{ label: 'All Games', to: '/app/games' }, { label: 'Aviator', to: '/app/games/aviator' }, { label: 'Mines', to: '/app/games/mines' }, { label: 'Sporty Jet', to: '/app/games/sporty-jet' }, { label: 'Magic Ball', to: '/app/games/magic-ball' }],
    Account: [{ label: 'Sign In', to: '/auth/login' }, { label: 'Register', to: '/auth/register' }, { label: 'My Wallet', to: '/app/wallet' }, { label: 'My Bets', to: '/app/bets' }, { label: 'VIP', to: '/app/vip' }],
    Help:    [{ label: 'Profile', to: '/app/profile' }, { label: 'Crash History', to: '/app/games/aviator/history' }, { label: 'FAQs', to: '/app/profile' }, { label: 'Responsible Gaming', to: '/app/profile' }, { label: 'Contact', to: '/app/profile' }],
  };

  let linkIndex = 0;

  return (
    <footer ref={footerRef} className="border-t mt-10" style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <img src="/favicon.png" alt="SpeedBet" width="28" height="28" style={{ borderRadius: '8px' }} />
              <span className="font-display text-lg font-extrabold" style={{ color: 'var(--text-100)' }}>
                Speed<span style={{ color: 'var(--brand)' }}>Bet</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-60)' }}>
              Bet at the speed of play. Ghana's modern sportsbook.
            </p>
            <div className="flex gap-2">
              {[{ id: 'fb', url: 'https://facebook.com' }, { id: 'tw', url: 'https://twitter.com' }, { id: 'ig', url: 'https://instagram.com' }, { id: 'tk', url: 'https://tiktok.com' }].map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded flex items-center justify-center text-xs uppercase font-bold transition-colors"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-60)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-60)'; }}
                >{s.id}</a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <div className="font-display text-sm font-bold mb-3" style={{ color: 'var(--text-100)' }}>{cat}</div>
              <ul className="space-y-2">
                {items.map((l) => (
                  <li key={l.label}>
                    <Link
                      ref={(el) => { if (el) { linkRefs.current[linkIndex++] = el; linkHoverUnderline(el); } }}
                      to={l.to}
                      className="text-sm transition-colors hover:text-brand-600"
                      style={{ color: 'var(--text-60)' }}
                    >{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t flex flex-wrap items-center justify-between gap-4 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-60)' }}>
          <div>© 2026 SpeedBet Ghana. All rights reserved.</div>
          <div className="flex flex-wrap gap-3">
            <span>Licensed by the Gaming Commission of Ghana</span>
            <span>·</span>
            <span>18+ Only</span>
            <span>·</span>
            <span style={{ color: 'var(--vip)' }}>Play Responsibly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}