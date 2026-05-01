import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { matches as matchesApi } from '../api';
import { MatchCard } from '../components/Shared';

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
    id:      m.id ?? m.externalId ?? `match-${Math.random().toString(36).slice(2)}`,
    status:  m.status,
    league:  m.league,
    home:    { name: m.homeTeam, short: m.homeTeam?.slice(0, 3).toUpperCase(), color: '#888', logo: m.homeLogo },
    away:    { name: m.awayTeam, short: m.awayTeam?.slice(0, 3).toUpperCase(), color: '#888', logo: m.awayLogo },
    score:   { home: m.scoreHome ?? null, away: m.scoreAway ?? null },
    minute:  m.metadata?.['current_minute'] ?? null,
    kickoff: m.kickoffAt,
    odds:    entry.odds ?? m.odds ?? null,
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function MatchSkeleton() {
  return (
    <div
      className="rounded-xl p-4 animate-pulse"
      style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', minHeight: 110 }}
    >
      <div className="h-3 w-24 rounded mb-3" style={{ background: 'var(--surface-2)' }} />
      <div className="flex justify-between items-center gap-4">
        <div className="h-4 w-28 rounded" style={{ background: 'var(--surface-2)' }} />
        <div className="h-6 w-12 rounded" style={{ background: 'var(--surface-2)' }} />
        <div className="h-4 w-28 rounded" style={{ background: 'var(--surface-2)' }} />
      </div>
    </div>
  );
}

// ─── Pulsing live dot ─────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: '#ef4444', opacity: 0.6,
        animation: 'ping 1.4s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'block' }} />
      <style>{`@keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }`}</style>
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--surface-0)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-60)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: 'var(--text-100)', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Live() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Use withOdds() so odds are included — same source as Home.jsx
        const data = await matchesApi.withOdds();
        if (!cancelled) {
          const live = (data?.live ?? [])
            .map(adaptMatch)
            .filter((m) => !isDemoMatch(m));
          setMatches(live);
          setLoading(false);
        }
      } catch (err) {
        console.error('Live: failed to load matches', err);
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const interval = setInterval(async () => {
      try {
        const data = await matchesApi.withOdds();
        if (!cancelled) {
          const live = (data?.live ?? [])
            .map(adaptMatch)
            .filter((m) => !isDemoMatch(m));
          setMatches(live);
        }
      } catch { /* silent */ }
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const live = matches.filter((m) => m.status === 'LIVE');

  const totalGoals  = live.reduce((s, m) => s + (m.score?.home ?? 0) + (m.score?.away ?? 0), 0);
  const avgMinute   = live.length
    ? Math.round(live.reduce((s, m) => s + (m.minute ?? 0), 0) / live.length)
    : null;
  const leagueCount = new Set(live.map((m) => m.league)).size;

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

        {/* ── Page heading ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <LiveDot />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ef4444' }}>
              In Play
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text-100)', lineHeight: 1.1, margin: 0 }}>
              Live Now
            </h1>
            {!loading && live.length > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                padding: '4px 10px', borderRadius: 999,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
              }}>
                {live.length} match{live.length !== 1 ? 'es' : ''} in play
              </span>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => <MatchSkeleton key={i} />)}
          </div>
        ) : live.length === 0 ? (
          <div
            style={{
              textAlign: 'center', padding: '60px 24px',
              background: 'var(--surface-0)', border: '1px solid var(--border)',
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-100)', marginBottom: 6 }}>
              No live matches right now
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-60)', marginBottom: 20 }}>
              Check back soon or browse upcoming fixtures.
            </p>
            <Link
              to="/app/sports"
              style={{
                display: 'inline-block', padding: '9px 20px', borderRadius: 8,
                background: 'var(--grad-primary)', color: '#fff',
                fontWeight: 700, fontSize: 13, textDecoration: 'none',
              }}
            >
              See upcoming →
            </Link>
          </div>
        ) : (
          <>
            {/* Match grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {live.map((m, i) => (
                <motion.div
                  key={m.id ?? i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <MatchCard match={m} />
                </motion.div>
              ))}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
              <StatCard label="Matches in play" value={live.length} />
              <StatCard label="Total goals" value={totalGoals} />
              <StatCard label="Avg minute" value={avgMinute != null ? `${avgMinute}'` : '—'} />
              <StatCard label="Leagues" value={leagueCount} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}