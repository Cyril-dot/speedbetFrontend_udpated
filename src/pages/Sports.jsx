import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { matches as matchesApi, adminMatches as adminMatchesApi } from '../api';
import { MatchCard, MatchGroup } from '../components/Shared';
import { SectionHeader, Badge, EmptyState, Button } from '../components/ui/UIKit';
import { SearchIcon, CalendarIcon, ChartBarIcon, ArrowRightIcon } from '../components/icons';
import { CardSkeleton } from '../components/ui/Skeleton';

const DEMO_MATCH_PAIRS = [
  ['Bayern Munich', 'Dortmund'],
  ['Arsenal',       'Chelsea'],
  ['Barcelona',     'Real Madrid'],
];

function isDemoMatch(m) {
  const home = m.home?.name ?? m.homeTeam ?? '';
  const away = m.away?.name ?? m.awayTeam ?? '';
  return DEMO_MATCH_PAIRS.some(([dh, da]) => home.includes(dh) && away.includes(da));
}

function adaptMatch(entry) {
  const m = entry.match ?? entry;
  return {
    id:       m.id ?? m.externalId ?? `match-${Math.random().toString(36).slice(2)}`,
    status:   m.status,
    league:   m.league,
    country:  m.country ?? null,
    home:     { name: m.homeTeam, short: m.homeTeam?.slice(0, 3).toUpperCase(), color: '#888', logo: m.homeLogo },
    away:     { name: m.awayTeam, short: m.awayTeam?.slice(0, 3).toUpperCase(), color: '#888', logo: m.awayLogo },
    score:    { home: m.scoreHome ?? null, away: m.scoreAway ?? null },
    minute:   m.metadata?.['current_minute'] ?? null,
    kickoff:  m.kickoffAt,
    odds:     entry.odds ?? m.odds ?? null,
  };
}

function adaptAdminMatch(m) {
  const homeName = m.homeTeam ?? m.home?.name ?? '';
  const awayName = m.awayTeam ?? m.away?.name ?? '';
  return {
    id:      m.id,
    status:  m.status ?? 'SCHEDULED',
    league:  m.league ?? 'SpeedBet Special',
    country: null,
    home:    { name: homeName, short: homeName.slice(0, 3).toUpperCase(), color: '#63d2ff', logo: m.homeLogo ?? null },
    away:    { name: awayName, short: awayName.slice(0, 3).toUpperCase(), color: '#ff4757', logo: m.awayLogo ?? null },
    score:   { home: m.scoreHome ?? null, away: m.scoreAway ?? null },
    minute:  m.minutePlayed ?? m.metadata?.current_minute ?? null,
    kickoff: m.kickoffAt ?? null,
    odds:    null, // odds fetched separately via oddsAll()
  };
}

// ─── Fetch admin matches and enrich each with odds from oddsAll ───────────────
async function fetchAdminMatchesWithOdds() {
  const data = await adminMatchesApi.all();
  const adapted = (data ?? [])
    .map(adaptAdminMatch)
    .filter((m) => m.status !== 'FINISHED'); // never show finished

  const withOdds = await Promise.all(
    adapted.map(async (m) => {
      try {
        const bundle = await adminMatchesApi.oddsAll(m.id);
        return { ...m, odds: bundle?.match_result ?? null };
      } catch {
        return m;
      }
    })
  );

  return withOdds;
}

// ─── For You match card ───────────────────────────────────────────────────────
function ForYouMatchCard({ match, onHide }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);

  const isLive   = match.status === 'LIVE';
  const hasScore = match.score?.home != null && match.score?.away != null;

  if (!visible) return null;

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => navigate(`/app/match/${match.id}`)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 10,
        overflow: 'hidden',
        background: hovered ? 'rgba(99,210,255,0.03)' : 'var(--surface-0)',
        border: isLive
          ? '1.5px solid rgba(255,71,87,0.5)'
          : '1.5px solid rgba(255,255,255,0.07)',
        padding: '10px 14px',
        minWidth: 220,
        flex: '0 0 auto',
        transition: 'background 0.18s ease',
      }}
    >
      {isLive && (
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #ff4757, #ff6b81)' }}
        />
      )}

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 8 }}>
        {match.league || 'SpeedBet Special'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { team: match.home, score: match.score?.home, winning: hasScore && match.score?.home > match.score?.away },
          { team: match.away, score: match.score?.away, winning: hasScore && match.score?.away > match.score?.home },
        ].map(({ team, score, winning }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{
              fontSize: 13, fontWeight: winning ? 700 : 500,
              color: winning ? '#fff' : 'rgba(255,255,255,0.75)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {team?.name || '—'}
            </span>
            {hasScore && (
              <span style={{
                fontSize: 15, fontWeight: 900,
                color: isLive ? '#ff4757' : (winning ? '#fff' : 'rgba(255,255,255,0.6)'),
                fontVariantNumeric: 'tabular-nums', flexShrink: 0,
              }}>{score}</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isLive ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 800, color: '#ff4757', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4757', display: 'inline-block' }}
            />
            Live{match.minute ? ` · ${match.minute}'` : ''}
          </span>
        ) : (
          <span style={{ fontSize: 9, fontWeight: 700, color: '#63d2ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Curated</span>
        )}
        {!hasScore && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>Tap to bet →</span>
        )}
      </div>
    </motion.div>
  );
}

// ─── For You section ──────────────────────────────────────────────────────────
function ForYouSection({ matches, loading, onHideMatch }) {
  if (!loading && matches.length === 0) return null;

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0 }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #63d2ff, #3891ff)', boxShadow: '0 0 8px #63d2ff88' }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#63d2ff' }}>SpeedBet Picks · Curated for you</span>
            </div>
            <h2 className="text-xl md:text-2xl" style={{ margin: 0 }}>For You</h2>
          </div>
          {!loading && matches.length > 0 && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 18 }} className="no-scrollbar">
        <div style={{ display: 'flex', gap: 10, paddingLeft: 'max(16px, calc((100vw - 1280px) / 2 + 32px))', paddingRight: 'max(16px, calc((100vw - 1280px) / 2 + 32px))', paddingTop: 10, minWidth: 'max-content' }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse" style={{ width: 220, height: 110, borderRadius: 10, flexShrink: 0, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.05)' }} />
              ))
            : matches.map((m) => (
                <ForYouMatchCard key={m.id} match={m} onHide={onHideMatch} />
              ))
          }
        </div>
      </div>
    </div>
  );
}

export default function Sports() {
  const [status, setStatus] = useState('ALL');
  const [league, setLeague] = useState('ALL');
  const [q, setQ] = useState('');
  const [matches,       setMatches]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [forYouMatches, setForYouMatches] = useState([]);
  const [forYouLoading, setForYouLoading] = useState(true);
  const [hiddenIds,     setHiddenIds]     = useState(new Set());

  const handleHide = useCallback((id) => {
    setHiddenIds((prev) => new Set([...prev, id]));
  }, []);

  // ─── For You: admin matches with odds, no finished ────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadForYou() {
      try {
        const withOdds = await fetchAdminMatchesWithOdds();
        if (!cancelled) setForYouMatches(withOdds.slice(0, 12));
      } catch (err) {
        console.error('Sports: failed to load admin matches', err);
      } finally {
        if (!cancelled) setForYouLoading(false);
      }
    }

    loadForYou();

    const iv = setInterval(async () => {
      try {
        const withOdds = await fetchAdminMatchesWithOdds();
        if (!cancelled) setForYouMatches(withOdds.slice(0, 12));
      } catch { /* silent */ }
    }, 30_000);

    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // ─── Main match feed ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [withOddsData, resultsData] = await Promise.all([
          matchesApi.withOdds(),
          matchesApi.results(),
        ]);
        if (!cancelled) {
          const adaptWithOdds = (arr) => (arr ?? []).map(adaptMatch).filter((m) => !isDemoMatch(m));
          const live     = adaptWithOdds(withOddsData?.live);
          const upcoming = adaptWithOdds(withOddsData?.upcoming);
          const finished = (resultsData ?? []).map(adaptMatch).filter((m) => !isDemoMatch(m));
          setMatches([...live, ...upcoming, ...finished]);
        }
      } catch (err) {
        console.error('Sports: failed to load matches', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const interval = setInterval(async () => {
      try {
        const data = await matchesApi.withOdds();
        if (!cancelled) {
          const live     = (data?.live     ?? []).map(adaptMatch).filter((m) => !isDemoMatch(m));
          const upcoming = (data?.upcoming ?? []).map(adaptMatch).filter((m) => !isDemoMatch(m));
          setMatches((prev) => {
            const finished = prev.filter((m) => m.status === 'FINISHED');
            return [...live, ...upcoming, ...finished];
          });
        }
      } catch { /* silent */ }
    }, 30_000);

    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (status !== 'ALL' && m.status !== status) return false;
      if (league !== 'ALL' && m.league !== league) return false;
      if (q) {
        const needle   = q.toLowerCase();
        const homeName = m.home?.name ?? m.homeTeam ?? '';
        const awayName = m.away?.name ?? m.awayTeam ?? '';
        if (!homeName.toLowerCase().includes(needle) && !awayName.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [status, league, q, matches]);

  const groupedByLeague = useMemo(() => {
    const g = {};
    for (const m of filtered) {
      if (!g[m.league]) g[m.league] = [];
      g[m.league].push(m);
    }
    return g;
  }, [filtered]);

  const counts = useMemo(() => ({
    ALL:      matches.length,
    LIVE:     matches.filter((m) => m.status === 'LIVE').length,
    UPCOMING: matches.filter((m) => m.status === 'UPCOMING').length,
    FINISHED: matches.filter((m) => m.status === 'FINISHED').length,
  }), [matches]);

  const leagues = useMemo(() => {
    const uniqueLeagues = new Set(matches.map((m) => m.league));
    return Array.from(uniqueLeagues).map((name, idx) => ({ id: idx, name }));
  }, [matches]);

  const visibleForYou = forYouMatches.filter((m) => !hiddenIds.has(m.id));

  return (
    <div className="min-h-screen">
      <div className="bg-black-900 border-b border-black-700 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-[10px] caps text-crimson-400 mb-2">SPORTS · 5 LEAGUES · LIVE & PRE-MATCH</div>
          <h1 className="font-display text-4xl md:text-6xl text-white-100 leading-none" style={{ fontFamily: 'Outfit', letterSpacing: '0.01em' }}>
            ALL FIXTURES
          </h1>
          <p className="text-white-80 text-sm md:text-base mt-2 max-w-2xl">
            Every match in every league. Filter, find, bet at the speed of play.
          </p>
        </div>
      </div>

      <ForYouSection matches={visibleForYou} loading={forYouLoading} onHideMatch={handleHide} />

      <div className="sticky top-16 z-20 bg-black-950/95 backdrop-blur border-b border-black-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center gap-2">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {[
              ['ALL',      'ALL'],
              ['LIVE',     'LIVE'],
              ['UPCOMING', 'UPCOMING'],
              ['FINISHED', 'RESULTS'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                className={`px-3 py-2 text-[11px] caps font-semibold whitespace-nowrap transition-all ${
                  status === key
                    ? 'bg-crimson-400 text-white-100 border-2 border-crimson-400'
                    : 'bg-black-800 text-white-80 border-2 border-black-700 hover:border-black-700'
                }`}
              >
                {label} <span className="opacity-60">({counts[key]})</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <select
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="bg-black-800 border-2 border-black-700 text-white-100 text-xs px-3 py-2 focus:border-electric-400 outline-none"
          >
            <option value="ALL">All Leagues</option>
            {leagues.map((l) => (
              <option key={l.id} value={l.name}>{l.name}</option>
            ))}
          </select>

          <div className="relative">
            <SearchIcon size={14} color="#888" className="absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search team…"
              className="bg-black-800 border-2 border-black-700 pl-7 pr-3 py-2 text-xs text-white-100 placeholder-white-60 focus:border-electric-400 outline-none w-36 md:w-48"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matches match these filters"
            subtitle="Try clearing filters or switching league."
            icon={<ChartBarIcon size={48} color="#888" />}
            action={
              <Button variant="outline" onClick={() => { setStatus('ALL'); setLeague('ALL'); setQ(''); }}>
                CLEAR FILTERS
              </Button>
            }
          />
        ) : (
          Object.entries(groupedByLeague).map(([lg, items], idx) => (
            <motion.section
              key={lg}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="mb-10"
            >
              <SectionHeader
                kicker={`${items.length} matches`}
                title={lg}
                action={<Badge variant="default">{items[0].country || 'Intl'}</Badge>}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </motion.section>
          ))
        )}
      </div>
    </div>
  );
}