import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TeamBadge } from './Shared';

// ─── Top 6 League Teams with hardcoded logos ──────────────────────────────────
const TEAM_LOGOS = {
  // ── Premier League ──────────────────────────────────────────────────────────
  'manchester city':        'https://media.api-sports.io/football/teams/50.png',
  'man city':               'https://media.api-sports.io/football/teams/50.png',
  'manchester united':      'https://media.api-sports.io/football/teams/33.png',
  'man united':             'https://media.api-sports.io/football/teams/33.png',
  'man utd':                'https://media.api-sports.io/football/teams/33.png',
  'arsenal':                'https://media.api-sports.io/football/teams/42.png',
  'chelsea':                'https://media.api-sports.io/football/teams/49.png',
  'liverpool':              'https://media.api-sports.io/football/teams/40.png',
  'tottenham':              'https://media.api-sports.io/football/teams/47.png',
  'spurs':                  'https://media.api-sports.io/football/teams/47.png',
  'tottenham hotspur':      'https://media.api-sports.io/football/teams/47.png',
  'newcastle':              'https://media.api-sports.io/football/teams/34.png',
  'newcastle united':       'https://media.api-sports.io/football/teams/34.png',
  'aston villa':            'https://media.api-sports.io/football/teams/66.png',
  'west ham':               'https://media.api-sports.io/football/teams/48.png',
  'west ham united':        'https://media.api-sports.io/football/teams/48.png',
  'brighton':               'https://media.api-sports.io/football/teams/51.png',
  'brighton & hove albion': 'https://media.api-sports.io/football/teams/51.png',
  'brentford':              'https://media.api-sports.io/football/teams/55.png',
  'fulham':                 'https://media.api-sports.io/football/teams/36.png',
  'crystal palace':         'https://media.api-sports.io/football/teams/52.png',
  'wolverhampton':          'https://media.api-sports.io/football/teams/39.png',
  'wolves':                 'https://media.api-sports.io/football/teams/39.png',
  'everton':                'https://media.api-sports.io/football/teams/45.png',
  'nottingham forest':      'https://media.api-sports.io/football/teams/65.png',
  "nott'm forest":          'https://media.api-sports.io/football/teams/65.png',
  'leicester':              'https://media.api-sports.io/football/teams/46.png',
  'leicester city':         'https://media.api-sports.io/football/teams/46.png',
  'southampton':            'https://media.api-sports.io/football/teams/41.png',
  'bournemouth':            'https://media.api-sports.io/football/teams/35.png',
  'ipswich':                'https://media.api-sports.io/football/teams/57.png',
  'ipswich town':           'https://media.api-sports.io/football/teams/57.png',

  // ── La Liga ─────────────────────────────────────────────────────────────────
  'real madrid':            'https://media.api-sports.io/football/teams/541.png',
  'barcelona':              'https://media.api-sports.io/football/teams/529.png',
  'fc barcelona':           'https://media.api-sports.io/football/teams/529.png',
  'atletico madrid':        'https://media.api-sports.io/football/teams/530.png',
  'atlético madrid':        'https://media.api-sports.io/football/teams/530.png',
  'athletic bilbao':        'https://media.api-sports.io/football/teams/531.png',
  'athletic club':          'https://media.api-sports.io/football/teams/531.png',
  'real sociedad':          'https://media.api-sports.io/football/teams/548.png',
  'villarreal':             'https://media.api-sports.io/football/teams/533.png',
  'real betis':             'https://media.api-sports.io/football/teams/543.png',
  'sevilla':                'https://media.api-sports.io/football/teams/536.png',
  'valencia':               'https://media.api-sports.io/football/teams/532.png',
  'celta vigo':             'https://media.api-sports.io/football/teams/538.png',
  'getafe':                 'https://media.api-sports.io/football/teams/546.png',
  'girona':                 'https://media.api-sports.io/football/teams/547.png',
  'osasuna':                'https://media.api-sports.io/football/teams/727.png',
  'rayo vallecano':         'https://media.api-sports.io/football/teams/728.png',
  'mallorca':               'https://media.api-sports.io/football/teams/798.png',
  'deportivo alaves':       'https://media.api-sports.io/football/teams/542.png',
  'alaves':                 'https://media.api-sports.io/football/teams/542.png',
  'espanyol':               'https://media.api-sports.io/football/teams/540.png',
  'leganes':                'https://media.api-sports.io/football/teams/724.png',
  'valladolid':             'https://media.api-sports.io/football/teams/720.png',

  // ── Bundesliga ──────────────────────────────────────────────────────────────
  'bayern munich':          'https://media.api-sports.io/football/teams/157.png',
  'fc bayern':              'https://media.api-sports.io/football/teams/157.png',
  'borussia dortmund':      'https://media.api-sports.io/football/teams/165.png',
  'dortmund':               'https://media.api-sports.io/football/teams/165.png',
  'bayer leverkusen':       'https://media.api-sports.io/football/teams/168.png',
  'leverkusen':             'https://media.api-sports.io/football/teams/168.png',
  'rb leipzig':             'https://media.api-sports.io/football/teams/173.png',
  'leipzig':                'https://media.api-sports.io/football/teams/173.png',
  'eintracht frankfurt':    'https://media.api-sports.io/football/teams/169.png',
  'frankfurt':              'https://media.api-sports.io/football/teams/169.png',
  'vfb stuttgart':          'https://media.api-sports.io/football/teams/172.png',
  'stuttgart':              'https://media.api-sports.io/football/teams/172.png',
  'sc freiburg':            'https://media.api-sports.io/football/teams/160.png',
  'freiburg':               'https://media.api-sports.io/football/teams/160.png',
  'borussia monchengladbach': 'https://media.api-sports.io/football/teams/163.png',
  'gladbach':               'https://media.api-sports.io/football/teams/163.png',
  'werder bremen':          'https://media.api-sports.io/football/teams/162.png',
  'bremen':                 'https://media.api-sports.io/football/teams/162.png',
  'union berlin':           'https://media.api-sports.io/football/teams/182.png',
  'fc augsburg':            'https://media.api-sports.io/football/teams/167.png',
  'augsburg':               'https://media.api-sports.io/football/teams/167.png',
  'wolfsburg':              'https://media.api-sports.io/football/teams/161.png',
  'vfl wolfsburg':          'https://media.api-sports.io/football/teams/161.png',
  'hoffenheim':             'https://media.api-sports.io/football/teams/167.png',
  'tsg hoffenheim':         'https://media.api-sports.io/football/teams/167.png',
  'mainz':                  'https://media.api-sports.io/football/teams/164.png',
  'mainz 05':               'https://media.api-sports.io/football/teams/164.png',
  'holstein kiel':          'https://media.api-sports.io/football/teams/192.png',
  'heidenheim':             'https://media.api-sports.io/football/teams/180.png',
  'st. pauli':              'https://media.api-sports.io/football/teams/181.png',
  'bochum':                 'https://media.api-sports.io/football/teams/176.png',

  // ── Serie A ─────────────────────────────────────────────────────────────────
  'inter milan':            'https://media.api-sports.io/football/teams/505.png',
  'inter':                  'https://media.api-sports.io/football/teams/505.png',
  'internazionale':         'https://media.api-sports.io/football/teams/505.png',
  'juventus':               'https://media.api-sports.io/football/teams/496.png',
  'ac milan':               'https://media.api-sports.io/football/teams/489.png',
  'milan':                  'https://media.api-sports.io/football/teams/489.png',
  'napoli':                 'https://media.api-sports.io/football/teams/492.png',
  'as roma':                'https://media.api-sports.io/football/teams/497.png',
  'roma':                   'https://media.api-sports.io/football/teams/497.png',
  'lazio':                  'https://media.api-sports.io/football/teams/487.png',
  'ss lazio':               'https://media.api-sports.io/football/teams/487.png',
  'atalanta':               'https://media.api-sports.io/football/teams/499.png',
  'fiorentina':             'https://media.api-sports.io/football/teams/502.png',
  'bologna':                'https://media.api-sports.io/football/teams/500.png',
  'torino':                 'https://media.api-sports.io/football/teams/503.png',
  'udinese':                'https://media.api-sports.io/football/teams/494.png',
  'sampdoria':              'https://media.api-sports.io/football/teams/507.png',
  'sassuolo':               'https://media.api-sports.io/football/teams/488.png',
  'genoa':                  'https://media.api-sports.io/football/teams/495.png',
  'cagliari':               'https://media.api-sports.io/football/teams/490.png',
  'hellas verona':          'https://media.api-sports.io/football/teams/504.png',
  'verona':                 'https://media.api-sports.io/football/teams/504.png',
  'lecce':                  'https://media.api-sports.io/football/teams/867.png',
  'frosinone':              'https://media.api-sports.io/football/teams/512.png',
  'como':                   'https://media.api-sports.io/football/teams/514.png',
  'venezia':                'https://media.api-sports.io/football/teams/517.png',
  'parma':                  'https://media.api-sports.io/football/teams/511.png',
  'empoli':                 'https://media.api-sports.io/football/teams/508.png',
  'monza':                  'https://media.api-sports.io/football/teams/1579.png',

  // ── Ligue 1 ─────────────────────────────────────────────────────────────────
  'paris saint-germain':    'https://media.api-sports.io/football/teams/85.png',
  'psg':                    'https://media.api-sports.io/football/teams/85.png',
  'paris sg':               'https://media.api-sports.io/football/teams/85.png',
  'marseille':              'https://media.api-sports.io/football/teams/81.png',
  'olympique de marseille': 'https://media.api-sports.io/football/teams/81.png',
  'lyon':                   'https://media.api-sports.io/football/teams/80.png',
  'olympique lyonnais':     'https://media.api-sports.io/football/teams/80.png',
  'monaco':                 'https://media.api-sports.io/football/teams/91.png',
  'as monaco':              'https://media.api-sports.io/football/teams/91.png',
  'lille':                  'https://media.api-sports.io/football/teams/79.png',
  'losc lille':             'https://media.api-sports.io/football/teams/79.png',
  'rennes':                 'https://media.api-sports.io/football/teams/94.png',
  'stade rennais':          'https://media.api-sports.io/football/teams/94.png',
  'nice':                   'https://media.api-sports.io/football/teams/84.png',
  'ogc nice':               'https://media.api-sports.io/football/teams/84.png',
  'lens':                   'https://media.api-sports.io/football/teams/116.png',
  'rc lens':                'https://media.api-sports.io/football/teams/116.png',
  'montpellier':            'https://media.api-sports.io/football/teams/93.png',
  'strasbourg':             'https://media.api-sports.io/football/teams/95.png',
  'nantes':                 'https://media.api-sports.io/football/teams/83.png',
  'toulouse':               'https://media.api-sports.io/football/teams/96.png',
  'brest':                  'https://media.api-sports.io/football/teams/113.png',
  'stade brestois':         'https://media.api-sports.io/football/teams/113.png',
  'reims':                  'https://media.api-sports.io/football/teams/82.png',
  'stade de reims':         'https://media.api-sports.io/football/teams/82.png',
  'auxerre':                'https://media.api-sports.io/football/teams/114.png',
  'le havre':               'https://media.api-sports.io/football/teams/1106.png',
  'angers':                 'https://media.api-sports.io/football/teams/119.png',
  'saint-etienne':          'https://media.api-sports.io/football/teams/97.png',

  // ── UEFA Champions League extras ─────────────────────────────────────────────
  'porto':                  'https://media.api-sports.io/football/teams/212.png',
  'benfica':                'https://media.api-sports.io/football/teams/211.png',
  'celtic':                 'https://media.api-sports.io/football/teams/264.png',
  'rangers':                'https://media.api-sports.io/football/teams/257.png',
  'ajax':                   'https://media.api-sports.io/football/teams/194.png',
  'psv':                    'https://media.api-sports.io/football/teams/197.png',
  'psv eindhoven':          'https://media.api-sports.io/football/teams/197.png',
  'feyenoord':              'https://media.api-sports.io/football/teams/193.png',
  'shakhtar donetsk':       'https://media.api-sports.io/football/teams/228.png',
  'dynamo kyiv':            'https://media.api-sports.io/football/teams/230.png',
  'anderlecht':             'https://media.api-sports.io/football/teams/235.png',
  'club brugge':            'https://media.api-sports.io/football/teams/234.png',
  'sporting cp':            'https://media.api-sports.io/football/teams/228.png',
  'galatasaray':            'https://media.api-sports.io/football/teams/357.png',
  'fenerbahce':             'https://media.api-sports.io/football/teams/356.png',
  'red bull salzburg':      'https://media.api-sports.io/football/teams/322.png',
  'salzburg':               'https://media.api-sports.io/football/teams/322.png',
};

// Top 6 league keyword identifiers
const TOP6_LEAGUE_KEYWORDS = [
  'premier league',
  'la liga',
  'bundesliga',
  'serie a',
  'ligue 1',
  'champions league',
  'uefa champions',
];

/**
 * Resolve a hardcoded logo URL for a team name.
 * Tries exact match first, then substring match.
 */
function resolveHardcodedLogo(teamName = '') {
  if (!teamName) return null;
  const n = teamName.toLowerCase().trim();
  if (TEAM_LOGOS[n]) return TEAM_LOGOS[n];
  for (const [key, url] of Object.entries(TEAM_LOGOS)) {
    if (n.includes(key) || key.includes(n)) return url;
  }
  return null;
}

/**
 * Returns true if either team belongs to a top-6 league,
 * OR if the league string itself matches one of our keywords.
 */
function isTop6Match(match) {
  const league = (match.league ?? '').toLowerCase();
  if (TOP6_LEAGUE_KEYWORDS.some((k) => league.includes(k))) return true;

  const homeTeam = (match.home?.name ?? match.homeTeam ?? '').toLowerCase().trim();
  const awayTeam = (match.away?.name ?? match.awayTeam ?? '').toLowerCase().trim();

  const inMap = (n) =>
    Object.keys(TEAM_LOGOS).some((k) => n.includes(k) || k.includes(n));

  return inMap(homeTeam) || inMap(awayTeam);
}

// ─── League background images ─────────────────────────────────────────────────
const LEAGUE_BG = {
  'champions': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1800&q=80',
  'premier':   'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1800&q=80',
  'bundesliga':'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1800&q=80',
  'serie':     'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1800&q=80',
  'la liga':   'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1800&q=80',
  'ligue':     'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1800&q=80',
  'europa':    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1800&q=80',
  'default':   'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1800&q=80',
};

function bgForLeague(league = '') {
  const l = league.toLowerCase();
  for (const [key, url] of Object.entries(LEAGUE_BG)) {
    if (l.includes(key)) return url;
  }
  return LEAGUE_BG.default;
}

// ─── League accent colour ──────────────────────────────────────────────────────
function accentForLeague(league = '') {
  const l = league.toLowerCase();
  if (l.includes('champions')) return '#19a4ff';
  if (l.includes('premier'))   return '#00ff87';
  if (l.includes('bundesliga'))return '#ff3333';
  if (l.includes('serie'))     return '#00aaff';
  if (l.includes('la liga'))   return '#ffd700';
  if (l.includes('ligue'))     return '#ee3124';
  if (l.includes('copa') || l.includes('libertadores')) return '#f77f00';
  if (l.includes('europa'))    return '#f77f00';
  if (l.includes('cup'))       return '#a855f7';
  if (l.includes('championship')) return '#06b6d4';
  return '#ff6b35';
}

// ─── Extract odds ──────────────────────────────────────────────────────────────
function parseOdds(oddsArr, homeTeam, awayTeam) {
  if (!Array.isArray(oddsArr) || !oddsArr.length) return null;
  let home = null, draw = null, away = null;
  const hn = (homeTeam || '').toLowerCase().split(' ')[0];
  const an = (awayTeam || '').toLowerCase().split(' ')[0];
  for (const o of oddsArr) {
    const sel = (o.selection || o.outcome || '').toLowerCase();
    const val = o.odd || o.value;
    if (!val || val === '0') continue;
    if (!home && (sel === '1' || sel === 'home' || (hn && sel.includes(hn)))) home = parseFloat(val);
    else if (!draw && (sel === 'x' || sel === 'draw')) draw = parseFloat(val);
    else if (!away && (sel === '2' || sel === 'away' || (an && sel.includes(an)))) away = parseFloat(val);
    if (home && draw && away) break;
  }
  if (!home && !away) return null;
  return { home, draw, away };
}

// ─── Enrich a team object with hardcoded logo if API logo is missing ──────────
function enrichTeam(teamObj, fallbackName = '') {
  const name = teamObj?.name ?? fallbackName;
  const apiLogo = teamObj?.logo ?? '';
  // Use API logo if present, otherwise fall back to hardcoded
  const logo = apiLogo || resolveHardcodedLogo(name) || '';
  return { ...teamObj, name, logo };
}

// ─── Build slides — only from top-6 league matches ────────────────────────────
function buildSlides(matches) {
  if (!matches?.length) return [];

  const top6 = matches.filter(isTop6Match);
  const live     = top6.filter((m) => m.status === 'LIVE');
  const upcoming = top6.filter((m) => m.status === 'UPCOMING');
  const pool = [...live, ...upcoming].slice(0, 6);

  return pool.map((m) => {
    const rawHome = m.home ?? { name: m.homeTeam, logo: m.homeLogo };
    const rawAway = m.away ?? { name: m.awayTeam, logo: m.awayLogo };

    const home = enrichTeam(rawHome);
    const away = enrichTeam(rawAway);
    const league = m.league ?? '';

    return {
      match_id:   m.id,
      type:       m.status === 'LIVE' ? 'live' : 'upcoming',
      bg:         bgForLeague(league),
      accent:     accentForLeague(league),
      homeTeam:   home.name,
      awayTeam:   away.name,
      homeLogo:   home.logo,
      awayLogo:   away.logo,
      homeShort:  m.home?.short,
      awayShort:  m.away?.short,
      score_home: m.score?.home ?? m.scoreHome ?? null,
      score_away: m.score?.away ?? m.scoreAway ?? null,
      minute:     m.minute ?? m.metadata?.current_minute ?? null,
      kickoff:    m.kickoff ?? m.kickoffAt ?? null,
      odds:       parseOdds(m.odds, home.name, away.name),
    };
  });
}

// ─── Odds drift ───────────────────────────────────────────────────────────────
function drifted(base, tick, seed) {
  if (!base) return null;
  return Math.max(1.05, +(base + Math.sin((tick + seed) * 0.7) * 0.03).toFixed(2));
}

// ─── Main Carousel ────────────────────────────────────────────────────────────
export default function HomeCarousel({ matches }) {
  const [slides, setSlides] = useState(() => buildSlides(matches ?? []));
  const [idx,    setIdx]    = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick,   setTick]   = useState(0);
  const navigate  = useNavigate();
  const addToSlip = useStore((s) => s.addToSlip);
  const pushToast = useStore((s) => s.pushToast);
  const touchX    = useRef(0);

  // Re-build slides when matches update
  useEffect(() => {
    const next = buildSlides(matches ?? []);
    setSlides(next);
    setIdx(0);
  }, [matches]);

  // Auto-advance
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  // Odds drift ticker
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 2400);
    return () => clearInterval(t);
  }, []);

  const go = useCallback((n) => setIdx((n + slides.length) % slides.length), [slides.length]);

  if (!slides.length) return null;

  const slide = slides[idx];
  if (!slide) return null;

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: 420, background: '#09090f' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 60) go(idx + (dx < 0 ? 1 : -1));
      }}
    >
      {/* ── Background ── */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`bg-${idx}`}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.07 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.55 }, scale: { duration: 7, ease: 'linear' } }}
          className="absolute inset-0"
          style={{ backgroundImage: `url(${slide.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      </AnimatePresence>

      {/* ── Gradient overlays ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(100deg,rgba(9,9,15,0.96) 0%,rgba(9,9,15,0.78) 50%,rgba(9,9,15,0.45) 100%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg,transparent 55%,rgba(9,9,15,0.75) 100%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 85% 50%, ${slide.accent}28, transparent 60%)`,
      }} />

      {/* ── Slide content ── */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 min-h-[420px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${idx}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45 }}
            className="w-full"
          >
            <SlideContent
              slide={slide}
              tick={tick}
              accent={slide.accent}
              addToSlip={addToSlip}
              pushToast={pushToast}
              navigate={navigate}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Nav arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(idx - 1)}
            aria-label="Previous"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-10 transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 20 }}
          >‹</button>
          <button
            onClick={() => go(idx + 1)}
            aria-label="Next"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-10 transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: 20 }}
          >›</button>
        </>
      )}

      {/* ── Dots ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              style={{
                height: 4, borderRadius: 2,
                width: i === idx ? 24 : 6,
                background: i === idx ? slide.accent : 'rgba(255,255,255,0.35)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Slide Content ────────────────────────────────────────────────────────────
function SlideContent({ slide, tick, accent, addToSlip, pushToast, navigate }) {
  const [added, setAdded] = useState({});

  const oddsHome = drifted(slide.odds?.home, tick, 1);
  const oddsDraw = drifted(slide.odds?.draw, tick, 2);
  const oddsAway = drifted(slide.odds?.away, tick, 3);
  const hasOdds  = !!(oddsHome || oddsAway);

  const handleAdd = (label, sel, odd) => {
    if (!odd) return;
    addToSlip({
      id: `sel-${slide.match_id}-1X2-${sel}`,
      match_id:    slide.match_id,
      match_label: `${slide.homeTeam} vs ${slide.awayTeam}`,
      market:      '1X2',
      selection:   sel,
      odds:        odd,
    });
    setAdded((a) => ({ ...a, [sel]: true }));
    pushToast?.({ kind: 'win', message: `${label} @ ${odd.toFixed(2)} added` });
    setTimeout(() => setAdded((a) => ({ ...a, [sel]: false })), 1800);
  };

  const ko = slide.kickoff ? new Date(slide.kickoff) : null;

  return (
    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-center">

      {/* LEFT — match info */}
      <div>
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {slide.type === 'live' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}>
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.3, repeat: Infinity }}
              />
              Live {slide.minute ? `· ${slide.minute}'` : ''}
            </span>
          ) : ko ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: `${accent}18`, border: `1px solid ${accent}44`, color: accent }}>
              {ko.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              {' · '}
              {ko.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
        </div>

        {/* Home team */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-2"
        >
          <TeamBadge
            team={{ name: slide.homeTeam, logo: slide.homeLogo, short: slide.homeShort }}
            size={44}
          />
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-none tracking-tight"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>
            {slide.homeTeam}
          </h2>
        </motion.div>

        {/* VS divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="text-xs font-black uppercase tracking-[0.3em] my-1.5 ml-14"
          style={{ color: accent }}
        >
          vs
        </motion.div>

        {/* Away team */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3 mb-4"
        >
          <TeamBadge
            team={{ name: slide.awayTeam, logo: slide.awayLogo, short: slide.awayShort }}
            size={44}
          />
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-none tracking-tight"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>
            {slide.awayTeam}
          </h2>
        </motion.div>

        {/* Live score */}
        {slide.type === 'live' && slide.score_home != null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl mb-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="font-mono text-4xl md:text-5xl font-black text-white tabular-nums">{slide.score_home}</span>
            <span style={{ color: accent, fontSize: 18 }}>·</span>
            <span className="font-mono text-4xl md:text-5xl font-black text-white tabular-nums">{slide.score_away}</span>
          </motion.div>
        )}

        {/* Odds row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="flex items-center gap-2 flex-wrap"
        >
          {hasOdds ? (
            <>
              <CarouselOddsBtn label={slide.homeTeam.split(' ').pop()?.slice(0, 5) || 'HOME'} sel="HOME" odd={oddsHome} added={added.HOME} accent={accent} onClick={() => handleAdd(slide.homeTeam, 'HOME', oddsHome)} />
              {oddsDraw && <CarouselOddsBtn label="Draw" sel="DRAW" odd={oddsDraw} added={added.DRAW} accent={accent} onClick={() => handleAdd('Draw', 'DRAW', oddsDraw)} />}
              <CarouselOddsBtn label={slide.awayTeam.split(' ').pop()?.slice(0, 5) || 'AWAY'} sel="AWAY" odd={oddsAway} added={added.AWAY} accent={accent} onClick={() => handleAdd(slide.awayTeam, 'AWAY', oddsAway)} />
            </>
          ) : (
            <span className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.45)' }}>
              Odds loading…
            </span>
          )}
        </motion.div>
      </div>

      {/* RIGHT — actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3"
      >
        <button
          onClick={() => navigate(`/app/match/${slide.match_id}`)}
          className="relative group w-full px-6 py-4 rounded-xl font-bold text-base text-white overflow-hidden transition-all hover:-translate-y-0.5"
          style={{ background: `linear-gradient(135deg,${accent}cc,${accent})`, boxShadow: `0 8px 24px ${accent}44` }}
        >
          View Match Details →
        </button>

        <button
          onClick={() => navigate(slide.type === 'live' ? '/app/live' : '/app/sports')}
          className="w-full px-6 py-3 rounded-xl font-semibold text-sm text-white border-2 transition-all hover:bg-white/10"
          style={{ borderColor: 'rgba(255,255,255,0.22)' }}
        >
          {slide.type === 'live' ? 'See All Live →' : 'See All Matches →'}
        </button>

        {/* Win simulator */}
        {hasOdds && oddsHome && (
          <div className="px-4 py-3 rounded-xl text-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Stake GHS 10 →
            </div>
            <motion.div
              key={oddsHome}
              initial={{ y: 4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-mono text-2xl font-black tabular-nums"
              style={{ color: '#39ff7c', textShadow: '0 0 14px rgba(57,255,124,0.4)' }}
            >
              Win GHS {(10 * oddsHome).toFixed(2)}
            </motion.div>
            <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {slide.homeTeam} to win @ {oddsHome.toFixed(2)}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Carousel odds button ─────────────────────────────────────────────────────
function CarouselOddsBtn({ label, sel, odd, added, accent, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      className="px-4 py-3 rounded-xl text-left relative overflow-hidden group transition-all"
      style={{
        background: added ? `${accent}25` : 'rgba(0,0,0,0.55)',
        border: `1.5px solid ${added ? accent : 'rgba(255,255,255,0.22)'}`,
        backdropFilter: 'blur(8px)',
        minWidth: 86,
        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
      }}
    >
      <div className="text-[9px] uppercase tracking-widest font-bold mb-0.5"
        style={{ color: added ? accent : 'rgba(255,255,255,0.8)' }}>
        {added ? '✓ Added' : label}
      </div>
      <motion.div
        key={odd}
        initial={{ y: 4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-mono text-xl font-black tabular-nums"
        style={{ color: added ? accent : '#fff' }}
      >
        {odd ? odd.toFixed(2) : '—'}
      </motion.div>
    </motion.button>
  );
}