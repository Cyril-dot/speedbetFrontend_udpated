import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { matches as matchesApi } from '../api';
import { MatchCard } from '../components/Shared';
import { SectionHeader, Badge, EmptyState, Button } from '../components/ui/UIKit';
import { SearchIcon, CalendarIcon, ChartBarIcon } from '../components/icons';
import { CardSkeleton } from '../components/ui/Skeleton';

// ─── Demo / hardcoded matches to suppress ────────────────────────────────────
const DEMO_MATCH_PAIRS = [
  ['Bayern Munich', 'Dortmund'],
  ['Arsenal',       'Chelsea'],
  ['Barcelona',     'Real Madrid'],
];

function isDemoMatch(m) {
  const home = m.home?.name ?? m.homeTeam ?? '';
  const away = m.away?.name ?? m.awayTeam ?? '';
  return DEMO_MATCH_PAIRS.some(
    ([dh, da]) => home.includes(dh) && away.includes(da)
  );
}

// ─── Adapt raw API entry → normalised match shape (same as Home.jsx) ─────────
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

export default function Sports() {
  const [status, setStatus] = useState('ALL'); // ALL | LIVE | UPCOMING | FINISHED
  const [league, setLeague] = useState('ALL');
  const [q, setQ] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Fetch live+upcoming (with odds) and results in parallel
        const [withOddsData, resultsData] = await Promise.all([
          matchesApi.withOdds(),
          matchesApi.results(),
        ]);

        if (!cancelled) {
          const adaptWithOdds = (arr) =>
            (arr ?? []).map(adaptMatch).filter((m) => !isDemoMatch(m));

          const adaptResults = (arr) =>
            (arr ?? []).map(adaptMatch).filter((m) => !isDemoMatch(m));

          const live     = adaptWithOdds(withOddsData?.live);
          const upcoming = adaptWithOdds(withOddsData?.upcoming);
          const finished = adaptResults(resultsData);

          setMatches([...live, ...upcoming, ...finished]);
        }
      } catch (err) {
        console.error('Sports: failed to load matches', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Poll live + upcoming every 30s
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

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (status !== 'ALL' && m.status !== status) return false;
      if (league !== 'ALL' && m.league !== league) return false;
      if (q) {
        const needle = q.toLowerCase();
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

  const counts = useMemo(
    () => ({
      ALL:      matches.length,
      LIVE:     matches.filter((m) => m.status === 'LIVE').length,
      UPCOMING: matches.filter((m) => m.status === 'UPCOMING').length,
      FINISHED: matches.filter((m) => m.status === 'FINISHED').length,
    }),
    [matches]
  );

  const leagues = useMemo(() => {
    const uniqueLeagues = new Set(matches.map((m) => m.league));
    return Array.from(uniqueLeagues).map((name, idx) => ({ id: idx, name }));
  }, [matches]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
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

      {/* Filters */}
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
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
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

      {/* Content */}
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
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('ALL');
                  setLeague('ALL');
                  setQ('');
                }}
              >
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
                {items.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </motion.section>
          ))
        )}
      </div>
    </div>
  );
}