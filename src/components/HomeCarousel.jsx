import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useTimezone } from '../hooks/useTimezone';
import { formatKickoffFull } from '../utils/time';

// ─── Top 6 League Teams ───────────────────────────────────────────────────────
const TEAM_NAMES = new Set([
  'manchester city','man city','manchester united','man united','man utd',
  'arsenal','chelsea','liverpool','tottenham','spurs','tottenham hotspur',
  'newcastle','newcastle united','aston villa','west ham','west ham united',
  'brighton','brighton & hove albion','brentford','fulham','crystal palace',
  'wolverhampton','wolves','everton','nottingham forest',"nott'm forest",
  'leicester','leicester city','southampton','bournemouth','ipswich','ipswich town',
  'real madrid','barcelona','fc barcelona','atletico madrid','atlético madrid',
  'athletic bilbao','athletic club','real sociedad','villarreal','real betis',
  'sevilla','valencia','celta vigo','getafe','girona','osasuna','rayo vallecano',
  'mallorca','deportivo alaves','alaves','espanyol','leganes','valladolid',
  'bayern munich','fc bayern','borussia dortmund','dortmund','bayer leverkusen',
  'leverkusen','rb leipzig','leipzig','eintracht frankfurt','frankfurt',
  'vfb stuttgart','stuttgart','sc freiburg','freiburg','borussia monchengladbach',
  'gladbach','werder bremen','bremen','union berlin','fc augsburg','augsburg',
  'wolfsburg','hoffenheim','mainz','mainz 05','holstein kiel','heidenheim',
  'st. pauli','bochum',
  'inter milan','inter','internazionale','juventus','ac milan','milan','napoli',
  'as roma','roma','lazio','ss lazio','atalanta','fiorentina','bologna','torino',
  'udinese','genoa','cagliari','hellas verona','verona','lecce','frosinone',
  'como','venezia','parma','empoli','monza',
  'paris saint-germain','psg','paris sg','marseille','olympique de marseille',
  'lyon','olympique lyonnais','monaco','as monaco','lille','losc lille','rennes',
  'stade rennais','nice','ogc nice','lens','rc lens','montpellier','strasbourg',
  'nantes','toulouse','brest','stade brestois','reims','stade de reims',
  'auxerre','le havre','angers','saint-etienne',
  'porto','benfica','celtic','rangers','ajax','psv','psv eindhoven','feyenoord',
  'shakhtar donetsk','dynamo kyiv','anderlecht','club brugge','sporting cp',
  'galatasaray','fenerbahce','red bull salzburg','salzburg',
]);

const TOP6_LEAGUE_KEYWORDS = [
  'premier league','la liga','bundesliga','serie a','ligue 1',
  'champions league','uefa champions',
];

function isTop6Match(match) {
  const league = (match.league ?? '').toLowerCase();
  if (TOP6_LEAGUE_KEYWORDS.some((k) => league.includes(k))) return true;
  const home = (match.home?.name ?? match.homeTeam ?? '').toLowerCase().trim();
  const away = (match.away?.name ?? match.awayTeam ?? '').toLowerCase().trim();
  const inSet = (n) => [...TEAM_NAMES].some((k) => n.includes(k) || k.includes(n));
  return inSet(home) || inSet(away);
}

// ─── League theming ───────────────────────────────────────────────────────────
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

function accentForLeague(league = '') {
  const l = league.toLowerCase();
  if (l.includes('champions')) return '#19a4ff';
  if (l.includes('premier'))   return '#00ff87';
  if (l.includes('bundesliga'))return '#ff3333';
  if (l.includes('serie'))     return '#00aaff';
  if (l.includes('la liga'))   return '#ffd700';
  if (l.includes('ligue'))     return '#ee3124';
  if (l.includes('europa'))    return '#f77f00';
  if (l.includes('cup'))       return '#a855f7';
  if (l.includes('championship')) return '#06b6d4';
  return '#ff6b35';
}

function leagueLabelFor(league = '') {
  const l = league.toLowerCase();
  if (l.includes('champions')) return 'UEFA Champions League';
  if (l.includes('premier'))   return 'Premier League';
  if (l.includes('bundesliga'))return 'Bundesliga';
  if (l.includes('serie'))     return 'Serie A';
  if (l.includes('la liga'))   return 'La Liga';
  if (l.includes('ligue'))     return 'Ligue 1';
  if (l.includes('europa'))    return 'UEFA Europa League';
  return league || 'Football';
}

// ─── Odds parsing ─────────────────────────────────────────────────────────────
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

function buildSlides(matches) {
  if (!matches?.length) return [];
  const top6 = matches.filter(isTop6Match);
  const pool = [
    ...top6.filter((m) => m.status === 'LIVE'),
    ...top6.filter((m) => m.status === 'UPCOMING'),
  ].slice(0, 6);

  return pool.map((m) => {
    const homeTeam = m.home?.name ?? m.homeTeam ?? '';
    const awayTeam = m.away?.name ?? m.awayTeam ?? '';
    const league   = m.league ?? '';
    return {
      match_id:    m.id,
      type:        m.status === 'LIVE' ? 'live' : 'upcoming',
      bg:          bgForLeague(league),
      accent:      accentForLeague(league),
      leagueLabel: leagueLabelFor(league),
      homeTeam,
      awayTeam,
      score_home:  m.score?.home ?? m.scoreHome ?? null,
      score_away:  m.score?.away ?? m.scoreAway ?? null,
      minute:      m.minute ?? m.metadata?.current_minute ?? null,
      kickoff:     m.kickoff ?? m.kickoffAt ?? null,
      odds:        parseOdds(m.odds, homeTeam, awayTeam),
    };
  });
}

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

  // ── IP-based timezone detection — shared at carousel level ──
  const timezone = useTimezone();

  useEffect(() => {
    setSlides(buildSlides(matches ?? []));
    setIdx(0);
  }, [matches]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

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
      className="relative overflow-hidden select-none"
      style={{ minHeight: 440, background: '#07070d' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
      }}
    >
      {/* ── Cinematic background ── */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`bg-${idx}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.09 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.7 }, scale: { duration: 8, ease: 'linear' } }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${slide.bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      {/* ── Gradient vignette ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(105deg, rgba(7,7,13,0.97) 0%, rgba(7,7,13,0.84) 50%, rgba(7,7,13,0.38) 100%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(7,7,13,0.25) 0%, transparent 40%, rgba(7,7,13,0.9) 100%)',
      }} />

      {/* ── Accent glow ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`glow-${idx}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 80% 40%, ${slide.accent}1e 0%, transparent 58%)`,
          }}
        />
      </AnimatePresence>

      {/* ── Grain texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      {/* ── Content ── */}
      <div
        className="relative max-w-7xl mx-auto px-5 md:px-10 py-10 md:py-14"
        style={{ minHeight: 440, display: 'flex', alignItems: 'center' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${idx}`}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <SlideContent
              slide={slide}
              tick={tick}
              timezone={timezone}
              addToSlip={addToSlip}
              pushToast={pushToast}
              navigate={navigate}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Progress bar + dots ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        {!paused && slides.length > 1 && (
          <motion.div
            key={`prog-${idx}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 6, ease: 'linear' }}
            style={{ height: 2, background: slide.accent, opacity: 0.65 }}
          />
        )}
        {slides.length > 1 && (
          <div
            className="flex items-center justify-center gap-2 py-3"
            style={{ background: 'rgba(7,7,13,0.55)', backdropFilter: 'blur(12px)' }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                style={{
                  height: 3, borderRadius: 999,
                  width: i === idx ? 28 : 8,
                  background: i === idx ? slide.accent : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                  border: 'none', cursor: 'pointer', padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Side nav ── */}
      {slides.length > 1 && (
        <>
          <NavArrow dir="left"  accent={slide.accent} onClick={() => go(idx - 1)} />
          <NavArrow dir="right" accent={slide.accent} onClick={() => go(idx + 1)} />
        </>
      )}
    </section>
  );
}

// ─── Nav arrow ────────────────────────────────────────────────────────────────
function NavArrow({ dir, accent, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 items-center justify-center"
      style={{
        [dir === 'left' ? 'left' : 'right']: 14,
        width: 40, height: 40, borderRadius: '50%',
        background: hov ? `${accent}22` : 'rgba(255,255,255,0.07)',
        border: `1.5px solid ${hov ? accent : 'rgba(255,255,255,0.13)'}`,
        backdropFilter: 'blur(12px)',
        color: hov ? accent : 'rgba(255,255,255,0.65)',
        fontSize: 20, cursor: 'pointer',
        transition: 'all 0.18s ease',
      }}
    >
      {dir === 'left' ? '‹' : '›'}
    </button>
  );
}

// ─── Slide Content ────────────────────────────────────────────────────────────
function SlideContent({ slide, tick, timezone, addToSlip, pushToast, navigate }) {
  const [added, setAdded] = useState({});

  const oddsHome = drifted(slide.odds?.home, tick, 1);
  const oddsDraw = drifted(slide.odds?.draw, tick, 2);
  const oddsAway = drifted(slide.odds?.away, tick, 3);
  const hasOdds  = !!(oddsHome || oddsAway);
  const accent   = slide.accent;

  const handleAdd = (label, sel, odd) => {
    if (!odd) return;
    addToSlip({
      id: `sel-${slide.match_id}-1X2-${sel}`,
      match_id:    slide.match_id,
      match_label: `${slide.homeTeam} vs ${slide.awayTeam}`,
      market: '1X2', selection: sel, odds: odd,
    });
    setAdded((a) => ({ ...a, [sel]: true }));
    pushToast?.({ kind: 'win', message: `${label} @ ${odd.toFixed(2)} added` });
    setTimeout(() => setAdded((a) => ({ ...a, [sel]: false })), 1800);
  };

  // ── Kickoff formatted using IP-detected timezone ──
  const kickoffFormatted = formatKickoffFull(slide.kickoff, timezone);

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-16 items-center">

      {/* ──── LEFT ──── */}
      <div>
        {/* League + status pills */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 }}
          className="flex items-center gap-2.5 flex-wrap mb-7"
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 13px', borderRadius: 999,
            background: `${accent}16`, border: `1px solid ${accent}38`,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: accent,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
            {slide.leagueLabel}
          </span>

          {slide.type === 'live' ? (
            <LivePill minute={slide.minute} />
          ) : kickoffFormatted ? (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
            }}>
              {kickoffFormatted}
            </span>
          ) : null}
        </motion.div>

        {/* Team names — pure typography, zero badge or logo */}
        <div className="flex flex-col" style={{ gap: 4 }}>
          <TeamName
            name={slide.homeTeam}
            score={slide.type === 'live' ? slide.score_home : null}
            isLive={slide.type === 'live'}
            delay={0.1}
            accent={accent}
          />

          {/* VS rule */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0' }}
          >
            <div style={{ height: 1, width: 32, background: `${accent}35` }} />
            <span style={{
              fontSize: 9, fontWeight: 900, letterSpacing: '0.25em',
              color: `${accent}80`, textTransform: 'uppercase',
            }}>vs</span>
            <div style={{ height: 1, width: 32, background: `${accent}35` }} />
          </motion.div>

          <TeamName
            name={slide.awayTeam}
            score={slide.type === 'live' ? slide.score_away : null}
            isLive={slide.type === 'live'}
            delay={0.3}
            accent={accent}
          />
        </div>

        {/* Odds chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="flex items-center gap-2 flex-wrap mt-7"
        >
          {hasOdds ? (
            <>
              <OddsChip label="1" sublabel={slide.homeTeam} odd={oddsHome} added={added.HOME} accent={accent} onClick={() => handleAdd(slide.homeTeam, 'HOME', oddsHome)} />
              {oddsDraw && <OddsChip label="X" sublabel="Draw" odd={oddsDraw} added={added.DRAW} accent={accent} onClick={() => handleAdd('Draw', 'DRAW', oddsDraw)} />}
              <OddsChip label="2" sublabel={slide.awayTeam} odd={oddsAway} added={added.AWAY} accent={accent} onClick={() => handleAdd(slide.awayTeam, 'AWAY', oddsAway)} />
            </>
          ) : (
            <span style={{
              fontSize: 11, padding: '8px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.3)',
            }}>Odds loading…</span>
          )}
        </motion.div>
      </div>

      {/* ──── RIGHT ──── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-3"
      >
        {/* Primary CTA */}
        <button
          onClick={() => navigate(`/app/match/${slide.match_id}`)}
          style={{
            width: '100%', padding: '15px 20px', borderRadius: 14,
            fontWeight: 800, fontSize: 14, color: '#fff',
            background: `linear-gradient(135deg, ${accent}cc, ${accent})`,
            boxShadow: `0 0 0 1px ${accent}40, 0 8px 32px ${accent}40`,
            border: 'none', cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}60, 0 14px 40px ${accent}55`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}40, 0 8px 32px ${accent}40`;
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>View Match Details →</span>
          <motion.div
            animate={{ x: ['-110%', '210%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 1.8 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)',
              pointerEvents: 'none',
            }}
          />
        </button>

        {/* Secondary CTA */}
        <button
          onClick={() => navigate(slide.type === 'live' ? '/app/live' : '/app/sports')}
          style={{
            width: '100%', padding: '13px 20px', borderRadius: 14,
            fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.7)',
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(255,255,255,0.11)',
            cursor: 'pointer', transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          {slide.type === 'live' ? '⚡ All Live Matches' : '📅 Browse Matches'}
        </button>

        {/* Win simulator */}
        {hasOdds && oddsHome && (
          <div style={{
            borderRadius: 14, overflow: 'hidden',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}>
            <div style={{
              padding: '9px 16px',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
              }}>Win Simulator</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: accent }}>GHS 10 stake</span>
            </div>
            <div style={{ padding: '14px 16px', textAlign: 'center' }}>
              <motion.div
                key={oddsHome}
                initial={{ y: 4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 30, fontWeight: 900, lineHeight: 1,
                  color: '#39ff7c',
                  textShadow: '0 0 20px rgba(57,255,124,0.4)',
                  letterSpacing: '-0.02em',
                  marginBottom: 6,
                }}
              >
                GHS {(10 * oddsHome).toFixed(2)}
              </motion.div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                {slide.homeTeam} to win{' '}
                <span style={{
                  padding: '1px 7px', borderRadius: 6,
                  background: `${accent}1e`, color: accent,
                  fontWeight: 700, fontSize: 10,
                }}>
                  @ {oddsHome.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Team name — pure text, no badge or logo ──────────────────────────────────
function TeamName({ name, score, isLive, delay, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}
    >
      <h2 style={{
        margin: 0,
        fontSize: 'clamp(24px, 4.5vw, 52px)',
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '-0.03em',
        lineHeight: 1.05,
        textShadow: '0 2px 28px rgba(0,0,0,0.75)',
        wordBreak: 'break-word',
        flex: 1,
      }}>
        {name}
      </h2>
      {isLive && score != null && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.15 }}
          style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 'clamp(26px, 4vw, 46px)',
            fontWeight: 900,
            color: '#ff4757',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            flexShrink: 0,
            textShadow: '0 0 18px rgba(255,71,87,0.55)',
          }}
        >
          {score}
        </motion.span>
      )}
    </motion.div>
  );
}

// ─── Live pill ────────────────────────────────────────────────────────────────
function LivePill({ minute }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.38)',
      color: '#ef4444',
      fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
    }}>
      <motion.span
        animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#ef4444',
          boxShadow: '0 0 8px #ef4444aa',
          display: 'inline-block', flexShrink: 0,
        }}
      />
      Live{minute ? ` · ${minute}'` : ''}
    </span>
  );
}

// ─── Odds chip ────────────────────────────────────────────────────────────────
function OddsChip({ label, sublabel, odd, added, accent, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        padding: '10px 14px', borderRadius: 12, minWidth: 82,
        background: added ? `${accent}20` : hov ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.06)',
        border: `1.5px solid ${added || hov ? accent : 'rgba(255,255,255,0.13)'}`,
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: added || hov ? `0 4px 20px ${accent}28` : '0 2px 10px rgba(0,0,0,0.2)',
      }}
    >
      <span style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: added ? accent : 'rgba(255,255,255,0.35)',
        lineHeight: 1, marginBottom: 5,
      }}>
        {added ? '✓ Added' : label}
      </span>
      <motion.span
        key={odd}
        initial={{ y: 3, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: 20, fontWeight: 900, lineHeight: 1,
          color: added ? accent : '#fff',
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}
      >
        {odd ? odd.toFixed(2) : '—'}
      </motion.span>
      <span style={{
        fontSize: 9, color: 'rgba(255,255,255,0.28)', fontWeight: 600,
        maxWidth: 76, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        lineHeight: 1,
      }}>
        {sublabel}
      </span>
    </motion.button>
  );
}