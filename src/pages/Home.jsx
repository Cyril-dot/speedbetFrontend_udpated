import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { matches as matchesApi, adminMatches as adminMatchesApi } from '../api';
import { MatchCard, MatchGroup } from '../components/Shared';
import {
  scrollFadeIn,
  scrollScaleIn,
  staggerFadeIn,
  cardHover,
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
import { useStore } from '../store';
import { useTimezone } from '../hooks/useTimezone';
import { formatKickoff } from '../utils/time';

import {
  isTop6LeagueMatch,
} from '../data/TOP_6_LEAGUES_DATA';

const arcadeGames = [
  { slug: 'aviator',          name: 'Aviator',          family: 'crash',   max_payout: '1000x', desc: 'Cash out before the crash. The longer you wait, the higher the multiplier.' },
  { slug: 'sporty-jet',       name: 'Sporty Jet',       family: 'crash',   max_payout: '750x',  desc: 'High-speed crash game with sports-themed visuals and fast-paced action.' },
  { slug: 'sporty-kick',      name: 'Ball Crush',       family: 'skill',   max_payout: '500x',  desc: 'Smash the ball with perfect timing in this explosive football-themed game.' },
  { slug: 'spin-bottle',      name: 'Spin & Win',       family: 'classic', max_payout: '100x',  desc: 'Classic spinning bottle game with exciting multipliers and bonuses.' },
  { slug: 'mines',            name: 'Mines',            family: 'skill',   max_payout: '1000x', desc: 'Navigate the minefield and find gems while avoiding explosive mines.' },
  { slug: 'magic-ball',       name: 'Magic Ball',       family: 'classic', max_payout: '250x',  desc: 'Mystical fortune-telling ball that reveals your winning multiplier.' },
  { slug: 'spaceman',         name: 'Spaceman',         family: 'crash',   max_payout: '5000x', desc: 'Intergalactic crash game with the highest multipliers in the galaxy.' },
  { slug: 'virtual-football', name: 'Virtual Football', family: 'virtual', max_payout: '200x',  desc: 'Fast-paced virtual football matches with realistic odds and outcomes.' },
  { slug: 'lucky-slots',      name: 'Lucky Slots',      family: 'slots',   max_payout: '5000x', desc: 'Classic slot machine with lucky sevens, bars, and massive jackpots.' },
  { slug: 'fruit-frenzy',     name: 'Fruit Frenzy',     family: 'slots',   max_payout: '2500x', desc: 'Colorful fruit-themed slot game with exciting bonus rounds.' },
];

const CUP_CHAMPIONSHIP_KEYWORDS = [
  'cup', 'champions', 'championship', 'copa', 'coupe', 'pokal', 'fa cup',
  'carabao', 'league cup', 'super cup', 'supercup', 'libertadores',
  'europa', 'conference', 'world cup', 'nations', 'shield', 'trophy',
  'final', 'playoff', 'play-off', 'knockout', 'ucl', 'uel', 'uecl',
  'premier league', 'la liga', 'bundesliga', 'serie a', 'ligue 1', 'ligue1',
];

const DEMO_MATCH_PAIRS = [
  ['Bayern Munich', 'Dortmund'],
  ['Arsenal',       'Chelsea'],
  ['Barcelona',     'Real Madrid'],
];

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

function isDemoMatch(m) {
  const home = resolveTeamName(m, 'home');
  const away = resolveTeamName(m, 'away');
  return DEMO_MATCH_PAIRS.some(([dh, da]) => home.includes(dh) && away.includes(da));
}

export function isCupOrChampionship(leagueName = '') {
  const l = leagueName.toLowerCase();
  return CUP_CHAMPIONSHIP_KEYWORDS.some((kw) => l.includes(kw));
}

function adaptMatch(m) {
  const homeName  = resolveTeamName(m, 'home');
  const awayName  = resolveTeamName(m, 'away');
  const league    = m.league ?? m.competition?.name ?? m.league_name ?? '';
  const scoreHome = m.scoreHome ?? m.score?.home ?? m.score_home ?? null;
  const scoreAway = m.scoreAway ?? m.score?.away ?? m.score_away ?? null;
  const kickoff   = m.kickoffAt ?? m.kickoff ?? m.kick_off ?? m.startTime ?? null;
  const minute    = m.minute ?? m.metadata?.current_minute ?? m.metadata?.['current_minute'] ?? null;
  const rawHome   = { name: homeName, short: (m.home?.short ?? homeName.slice(0, 3)).toUpperCase(), color: m.home?.color ?? '#888', logo: null };
  const rawAway   = { name: awayName, short: (m.away?.short ?? awayName.slice(0, 3)).toUpperCase(), color: m.away?.color ?? '#888', logo: null };
  return {
    id: m.id ?? m.externalId ?? `match-${Math.random().toString(36).slice(2)}`,
    status: m.status ?? 'SCHEDULED',
    league, home: rawHome, away: rawAway,
    score: { home: scoreHome, away: scoreAway },
    minute, kickoff, odds: m.odds ?? null,
  };
}

function adaptAdminMatch(m) {
  const homeName = m.homeTeam ?? m.home?.name ?? '';
  const awayName = m.awayTeam ?? m.away?.name ?? '';

  return {
    id: m.id,
    status: m.status ?? 'SCHEDULED',
    league: m.league ?? 'SpeedBet Special',
    home: { name: homeName, short: homeName.slice(0, 3).toUpperCase(), color: '#63d2ff', logo: m.homeLogo ?? null },
    away: { name: awayName, short: awayName.slice(0, 3).toUpperCase(), color: '#ff4757', logo: m.awayLogo ?? null },
    score: { home: m.scoreHome ?? null, away: m.scoreAway ?? null },
    minute: m.minutePlayed ?? m.metadata?.current_minute ?? null,
    kickoff: m.kickoffAt ?? null,
    odds: null, // odds fetched separately via oddsAll()
  };
}

function matchIsTop6(m) {
  return isTop6LeagueMatch(m.home?.name ?? '', m.away?.name ?? '');
}

export function getFallbackCarouselMatches() {
  return [
    { id: 'fallback-1', status: 'UPCOMING', league: 'Premier League', home: { name: 'Arsenal', logo: null, short: 'ARS', color: '#EF0107' }, away: { name: 'Liverpool', logo: null, short: 'LIV', color: '#C8102E' }, score: { home: null, away: null }, minute: null, kickoff: null, odds: null },
    { id: 'fallback-2', status: 'UPCOMING', league: 'La Liga', home: { name: 'Real Madrid', logo: null, short: 'RMA', color: '#FEBE10' }, away: { name: 'Barcelona', logo: null, short: 'BAR', color: '#A50044' }, score: { home: null, away: null }, minute: null, kickoff: null, odds: null },
    { id: 'fallback-3', status: 'UPCOMING', league: 'Bundesliga', home: { name: 'Bayern Munich', logo: null, short: 'BAY', color: '#DC052D' }, away: { name: 'Borussia Dortmund', logo: null, short: 'BVB', color: '#FDE100' }, score: { home: null, away: null }, minute: null, kickoff: null, odds: null },
    { id: 'fallback-4', status: 'UPCOMING', league: 'Serie A', home: { name: 'Inter Milan', logo: null, short: 'INT', color: '#0068A8' }, away: { name: 'Juventus', logo: null, short: 'JUV', color: '#000000' }, score: { home: null, away: null }, minute: null, kickoff: null, odds: null },
    { id: 'fallback-5', status: 'UPCOMING', league: 'Ligue 1', home: { name: 'Paris Saint-Germain', logo: null, short: 'PSG', color: '#004170' }, away: { name: 'Marseille', logo: null, short: 'OM', color: '#2faee0' }, score: { home: null, away: null }, minute: null, kickoff: null, odds: null },
  ];
}

// ─── Helper: fetch admin matches list then enrich each with odds ──────────────
async function fetchAdminMatchesWithOdds() {
  const data = await adminMatchesApi.all();
  const adapted = (data ?? []).map(adaptAdminMatch);

  const withOdds = await Promise.all(
    adapted
      .filter((m) => m.status !== 'FINISHED')
      .map(async (m) => {
        try {
          const bundle = await adminMatchesApi.oddsAll(m.id);
          // bundle shape: { match_result: [{selection, odd}, ...], half_time: [...], ... }
          return { ...m, odds: bundle?.match_result ?? null };
        } catch {
          return m; // show card without odds rather than drop it entirely
        }
      })
  );

  return withOdds;
}

function MatchRowSkeleton() {
  return (
    <div className="animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: 'var(--surface-0)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: 46, height: 32, borderRadius: 4, background: 'var(--surface-2)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 12, width: '60%', borderRadius: 3, background: 'var(--surface-2)' }} />
        <div style={{ height: 12, width: '50%', borderRadius: 3, background: 'var(--surface-2)' }} />
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 44, height: 32, borderRadius: 5, background: 'var(--surface-2)' }} />)}
      </div>
    </div>
  );
}

// ─── Odds button ──────────────────────────────────────────────────────────────
function OddsBtn({ label, value, selected, onClick }) {
  const has = value && value !== '—';
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={has ? onClick : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        padding: '6px 0',
        width: 44,
        borderRadius: 8,
        border: selected
          ? '1.5px solid rgba(99,210,255,0.7)'
          : '1.5px solid rgba(255,255,255,0.08)',
        background: selected
          ? 'linear-gradient(135deg, rgba(99,210,255,0.25), rgba(56,145,255,0.2))'
          : 'rgba(255,255,255,0.05)',
        cursor: has ? 'pointer' : 'default',
        transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(4px)',
        flexShrink: 0,
      }}
    >
      <span style={{
        fontSize: 9, fontWeight: 700,
        color: selected ? 'rgba(99,210,255,0.8)' : 'rgba(255,255,255,0.35)',
        letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1,
      }}>{label}</span>
      <span style={{
        fontSize: 14, fontWeight: 800,
        color: has ? (selected ? '#63d2ff' : '#fff') : 'rgba(255,255,255,0.18)',
        lineHeight: 1.2,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}>{has ? value : '—'}</span>
    </motion.button>
  );
}

// ─── Extract odds — handles array OR flat object ──────────────────────────────
function extractOdds(odds, homeTeam, awayTeam) {
  if (!odds) return { home: null, draw: null, away: null };

  // Flat object: { home, draw, away } or { homeOdds, drawOdds, awayOdds } or { '1', 'x', '2' }
  if (!Array.isArray(odds)) {
    const h = odds.home ?? odds.homeOdds ?? odds['1'] ?? odds.home_win ?? null;
    const d = odds.draw ?? odds.drawOdds ?? odds['x'] ?? odds['X'] ?? odds.draw_win ?? null;
    const a = odds.away ?? odds.awayOdds ?? odds['2'] ?? odds.away_win ?? null;
    return {
      home: h ? parseFloat(h).toFixed(2) : null,
      draw: d ? parseFloat(d).toFixed(2) : null,
      away: a ? parseFloat(a).toFixed(2) : null,
    };
  }

  // Array: [{ selection: '1', odd: '1.85' }, ...]
  // This is what match_result from oddsAll() returns.
  let home = null, draw = null, away = null;
  const hn = (homeTeam || '').toLowerCase().split(' ')[0];
  const an = (awayTeam || '').toLowerCase().split(' ')[0];
  for (const o of odds) {
    const sel = (o.selection || o.outcome || o.name || '').toLowerCase();
    const val = o.odd ?? o.value ?? o.odds ?? o.price;
    if (!val || val === '0') continue;
    if (!home && (sel === '1' || sel === 'home' || (hn && sel.includes(hn)))) home = parseFloat(val).toFixed(2);
    else if (!draw && (sel === 'x' || sel === 'draw')) draw = parseFloat(val).toFixed(2);
    else if (!away && (sel === '2' || sel === 'away' || (an && sel.includes(an)))) away = parseFloat(val).toFixed(2);
    if (home && draw && away) break;
  }
  return { home, draw, away };
}

// ─── For You match card — mobile-first ───────────────────────────────────────
function ForYouMatchCard({ match, onHide }) {
  const navigate  = useNavigate();
  const addToSlip = useStore((s) => s.addToSlip);
  const slip      = useStore((s) => s.slip);
  const [hovered, setHovered] = useState(false);
  const timezone = useTimezone();

  const isLive    = match.status === 'LIVE';
  const homeTeam  = match?.home?.name ?? '';
  const awayTeam  = match?.away?.name ?? '';
  const scoreHome = match?.score?.home ?? null;
  const scoreAway = match?.score?.away ?? null;
  const hasScore  = scoreHome != null && scoreAway != null;
  const minute    = match?.minute ?? null;

  const { home: oHome, draw: oDraw, away: oAway } = extractOdds(match?.odds, homeTeam, awayTeam);
  const isSelected = (sel) => slip?.some((s) => s.match_id === match?.id && s.selection === sel);

  const handleOdds = (e, selection, odd) => {
    e.stopPropagation();
    if (!odd) return;
    addToSlip({
      id: `sel-${match.id}-1X2-${selection}`,
      match_id: match.id,
      match_label: `${homeTeam} vs ${awayTeam}`,
      market: '1X2', selection,
      odds: parseFloat(odd),
    });
  };

  const kickoffTime = formatKickoff(match?.kickoff, timezone);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => navigate(`/app/match/${match.id}`)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 12,
        border: isLive
          ? '1.5px solid rgba(255,71,87,0.4)'
          : '1.5px solid rgba(255,255,255,0.07)',
        background: hovered ? 'rgba(99,210,255,0.03)' : 'var(--surface-0)',
        transition: 'background 0.18s ease',
        // Fluid width: fills ~80vw on mobile, caps at 260px on desktop
        width: 'clamp(200px, 78vw, 260px)',
        flex: '0 0 auto',
      }}
    >
      {/* Live accent bar */}
      {isLive && (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(to bottom, #ff4757, #ff6b81)',
          }}
        />
      )}

      {/* Top row: league + status badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 12px 0',
        gap: 6,
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
          color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
        }}>
          {match.league || 'SpeedBet Special'}
        </span>

        {/* Status pill */}
        {isLive ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
            fontSize: 9, fontWeight: 800, color: '#ff4757',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4757', display: 'inline-block', boxShadow: '0 0 6px #ff4757aa' }}
            />
            {minute ? `${minute}'` : 'LIVE'}
          </span>
        ) : kickoffTime ? (
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
            {kickoffTime}
          </span>
        ) : (
          <span style={{ fontSize: 9, fontWeight: 700, color: '#63d2ff', flexShrink: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            SOON
          </span>
        )}
      </div>

      {/* Teams + scores */}
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { name: homeTeam, score: scoreHome, winning: hasScore && scoreHome > scoreAway },
          { name: awayTeam, score: scoreAway, winning: hasScore && scoreAway > scoreHome },
        ].map(({ name, score, winning }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span style={{
              fontSize: 13, fontWeight: winning ? 700 : 500,
              color: winning ? '#ffffff' : 'rgba(255,255,255,0.82)',
              letterSpacing: '-0.01em', lineHeight: 1.25,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
            }}>{name || '—'}</span>
            {hasScore && (
              <span style={{
                fontSize: 15, fontWeight: 900, flexShrink: 0,
                color: isLive ? '#ff4757' : 'rgba(255,255,255,0.9)',
                fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
              }}>{score}</span>
            )}
          </div>
        ))}
      </div>

      {/* Odds row — full width, three equal buttons */}
      <div style={{
        display: 'flex', gap: 4, padding: '0 10px 10px',
      }}>
        {[
          { label: '1', value: oHome, sel: 'HOME' },
          { label: 'X', value: oDraw, sel: 'DRAW' },
          { label: '2', value: oAway, sel: 'AWAY' },
        ].map(({ label, value, sel }) => {
          const has      = value && value !== '—';
          const selected = isSelected(sel);
          return (
            <motion.button
              key={sel}
              whileTap={{ scale: 0.93 }}
              onClick={has ? (e) => handleOdds(e, sel, value) : undefined}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 1, padding: '7px 0',
                borderRadius: 8,
                border: selected
                  ? '1.5px solid rgba(99,210,255,0.7)'
                  : '1.5px solid rgba(255,255,255,0.08)',
                background: selected
                  ? 'linear-gradient(135deg, rgba(99,210,255,0.25), rgba(56,145,255,0.2))'
                  : 'rgba(255,255,255,0.05)',
                cursor: has ? 'pointer' : 'default',
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 700, lineHeight: 1,
                color: selected ? 'rgba(99,210,255,0.8)' : 'rgba(255,255,255,0.35)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>{label}</span>
              <span style={{
                fontSize: 13, fontWeight: 800, lineHeight: 1.2,
                fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                color: has ? (selected ? '#63d2ff' : '#fff') : 'rgba(255,255,255,0.18)',
              }}>{has ? value : '—'}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── For You horizontal scroll section ───────────────────────────────────────
function ForYouSection({ matches, loading, onHideMatch }) {
  const navigate = useNavigate();

  if (!loading && matches.length === 0) return null;

  return (
    <section style={{ background: 'var(--surface-1)', paddingBottom: 0 }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #63d2ff, #3891ff)', boxShadow: '0 0 8px #63d2ff88' }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#63d2ff' }}>
                SpeedBet Picks · Curated for you
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl" style={{ margin: 0 }}>For You</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/sports')}>
            See all <ArrowRightIcon size={12} />
          </Button>
        </div>
      </div>

      {/* Scroll container — no padding tricks so first card bleeds to edge on mobile */}
      <div style={{ overflowX: 'auto', paddingBottom: 16, WebkitOverflowScrolling: 'touch' }} className="no-scrollbar">
        <div style={{
          display: 'flex',
          gap: 10,
          // On mobile: 16px left padding so first card starts nicely
          // On desktop: centres inside max-w-7xl like the rest of the page
          paddingLeft: 'max(16px, calc((100vw - 1280px) / 2 + 32px))',
          paddingRight: 'max(16px, calc((100vw - 1280px) / 2 + 32px))',
          paddingTop: 4,
          // Do NOT set minWidth: max-content — let cards be fluid so the
          // scroll container knows its natural width from card widths (clamp)
        }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse" style={{
                  width: 'clamp(200px, 78vw, 260px)',
                  height: 130, borderRadius: 12, flexShrink: 0,
                  background: 'var(--surface-0)',
                  border: '1.5px solid rgba(255,255,255,0.05)',
                }} />
              ))
            : matches.map((m) => (
                <ForYouMatchCard key={m.id} match={m} onHide={onHideMatch} />
              ))
          }
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', marginTop: 4 }} />
    </section>
  );
}

function groupByLeague(matches) {
  const map = {};
  for (const m of matches) {
    const key = m.league || 'Other';
    if (!map[key]) map[key] = [];
    map[key].push(m);
  }
  return Object.entries(map);
}

function MatchListContainer({ children }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface-0)' }}>
      {children}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [liveMatches,     setLiveMatches]     = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [endedMatches,    setEndedMatches]    = useState([]);
  const [allMatches,      setAllMatches]      = useState([]);
  const [loading,         setLoading]         = useState(true);

  const [forYouMatches,   setForYouMatches]   = useState([]);
  const [forYouLoading,   setForYouLoading]   = useState(true);
  const [hiddenForYouIds, setHiddenForYouIds] = useState(new Set());

  const featuredGames = arcadeGames.slice(0, 6);

  const liveSectionRef     = useRef(null);
  const upcomingSectionRef = useRef(null);
  const gamesSectionRef    = useRef(null);
  const quickNavRef        = useRef(null);
  const gameCardRefs       = useRef([]);

  const handleHideForYouMatch = useCallback((id) => {
    setHiddenForYouIds((prev) => new Set([...prev, id]));
  }, []);

  // ─── For You: fetch admin matches then enrich with odds ──────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadForYou() {
      try {
        const withOdds = await fetchAdminMatchesWithOdds();

        if (!cancelled) {
          setForYouMatches(withOdds.slice(0, 12));
        }
      } catch (err) {
        console.error('[ForYou] failed to load admin matches:', err);
      } finally {
        if (!cancelled) setForYouLoading(false);
      }
    }

    loadForYou();

    const iv = setInterval(async () => {
      try {
        const withOdds = await fetchAdminMatchesWithOdds();
        if (!cancelled) {
          setForYouMatches(withOdds.slice(0, 12));
        }
      } catch { /* silent */ }
    }, 30_000);

    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // ─── Main match feed ─────────────────────────────────────────────────────
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

        const adaptedLive     = adaptWithOdds(withOddsData?.live).filter((m) => !isDemoMatch(m));
        const allUpcoming     = adaptWithOdds(withOddsData?.upcoming).filter((m) => !isDemoMatch(m));
        const upTop6          = allUpcoming.filter((m) =>  matchIsTop6(m));
        const upWithLogos     = allUpcoming.filter((m) => !matchIsTop6(m));
        const adaptedUpcoming = [...upTop6, ...upWithLogos].slice(0, 12);
        const adaptedEnded    = (results ?? []).map((m) => adaptMatch(m)).filter((m) => !isDemoMatch(m)).slice(0, 6);

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

    return () => { cancelled = true; clearInterval(iv); cleanupAnimations(); };
  }, []);

  useEffect(() => {
    if (!loading) {
      if (quickNavRef.current)        staggerFadeIn(quickNavRef.current.children);
      if (liveSectionRef.current)     scrollFadeIn(liveSectionRef.current);
      if (upcomingSectionRef.current) scrollFadeIn(upcomingSectionRef.current);
      if (gamesSectionRef.current)    scrollScaleIn(gamesSectionRef.current);
    }
  }, [loading]);

  const apiCarouselMatches = allMatches.filter(
    (m) => isCupOrChampionship(m.league) || matchIsTop6(m)
  );
  const carouselMatches = apiCarouselMatches.length > 0 ? apiCarouselMatches : getFallbackCarouselMatches();
  const visibleForYouMatches = forYouMatches.filter((m) => !hiddenForYouIds.has(m.id));

  const OddsHeader = () => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 4, paddingRight: 36 }}>
        {['1', 'X', '2'].map(h => (
          <span key={h} style={{ width: 44, textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{h}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full overflow-x-hidden" style={{ background: 'var(--surface-1)' }}>

      {/* ═══ HERO CAROUSEL ═══ */}
      <HomeCarousel matches={carouselMatches} />

      {/* ═══ FOR YOU ═══ */}
      <ForYouSection
        matches={visibleForYouMatches}
        loading={forYouLoading}
        onHideMatch={handleHideForYouMatch}
      />

      {/* ═══ QUICK NAV STRIP ═══ */}
      <section ref={quickNavRef} className="border-b" style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}>
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
            <Link key={q.label} to={q.to}
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
      <section ref={liveSectionRef} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
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
          <MatchListContainer>
            <OddsHeader />
            {[0, 1, 2].map((i) => <MatchRowSkeleton key={i} />)}
          </MatchListContainer>
        ) : liveMatches.length > 0 ? (
          <MatchListContainer>
            <OddsHeader />
            {groupByLeague(liveMatches).map(([league, matches]) => (
              <MatchGroup key={league} label={league} matches={matches} />
            ))}
          </MatchListContainer>
        ) : (
          <div className="text-center py-10 rounded-xl" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}>
            <div className="text-3xl mb-2">⚽</div>
            <p className="text-sm" style={{ color: 'var(--text-60)' }}>No live matches right now. Check back soon.</p>
          </div>
        )}
      </section>

      {/* ═══ UPCOMING MATCHES ═══ */}
      <section ref={upcomingSectionRef} className="max-w-7xl mx-auto px-4 md:px-8 py-8 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--brand)' }}>Up next</div>
            <h2 className="text-2xl md:text-3xl">Upcoming</h2>
          </div>
          <Link to="/app/sports">
            <Button variant="ghost" size="sm">Full Schedule <ArrowRightIcon size={12} /></Button>
          </Link>
        </div>

        {loading ? (
          <MatchListContainer>
            <OddsHeader />
            {[0, 1, 2, 3, 4, 5].map((i) => <MatchRowSkeleton key={i} />)}
          </MatchListContainer>
        ) : upcomingMatches.length > 0 ? (
          <MatchListContainer>
            <OddsHeader />
            {groupByLeague(upcomingMatches).map(([league, matches]) => (
              <MatchGroup key={league} label={league} matches={matches} />
            ))}
          </MatchListContainer>
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
                ref={(el) => { if (el) { gameCardRefs.current[i] = el; mouseSpotlight(el); cardHover(el); } }}
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
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-4">
            <div className="text-[11px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--brand)' }}>Just finished</div>
            <h2 className="text-2xl md:text-3xl">Recent Results</h2>
          </div>
          <MatchListContainer>
            {groupByLeague(endedMatches).map(([league, matches]) => (
              <MatchGroup key={league} label={league} matches={matches} />
            ))}
          </MatchListContainer>
        </section>
      )}

      {/* ═══ SPONSORS ═══ */}
      <SponsorMarquee />

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  );
}

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