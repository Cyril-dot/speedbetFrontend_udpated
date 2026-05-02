import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { matches as matchesApi, adminMatches as adminMatchesApi } from '../api';
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

// ─── Adapt raw API entry → normalised match shape ─────────────────────────────
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

// ─── Adapt admin match (public admin endpoint field shape) ────────────────────
function adaptAdminMatch(m) {
  const homeName = m.homeTeam ?? m.home?.name ?? '';
  const awayName = m.awayTeam ?? m.away?.name ?? '';
  return {
    id:      m.id,
    status:  m.status ?? 'SCHEDULED',
    league:  m.league ?? 'SpeedBet Special',
    home: {
      name:  homeName,
      short: homeName.slice(0, 3).toUpperCase(),
      color: '#63d2ff',
      logo:  m.homeLogo ?? null,
    },
    away: {
      name:  awayName,
      short: awayName.slice(0, 3).toUpperCase(),
      color: '#ff4757',
      logo:  m.awayLogo ?? null,
    },
    score:   { home: m.scoreHome ?? null, away: m.scoreAway ?? null },
    minute:  m.minutePlayed ?? m.metadata?.current_minute ?? null,
    kickoff: m.kickoffAt ?? null,
    odds:    m.odds ?? null,
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

// ─── For You match card ───────────────────────────────────────────────────────
function ForYouMatchCard({ match }) {
  const navigate   = useNavigate();
  const isLive     = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const hasScore   = match.score?.home != null && match.score?.away != null;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={() => navigate(`/app/match/${match.id}`)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 10,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(99,210,255,0.08) 0%, rgba(56,145,255,0.04) 100%)',
        border: isLive
          ? '1.5px solid rgba(255,71,87,0.5)'
          : '1.5px solid rgba(99,210,255,0.15)',
        padding: '12px 14px',
        minWidth: 220,
        flex: '0 0 auto',
        boxShadow: isLive
          ? '0 0 20px rgba(255,71,87,0.12)'
          : '0 4px 24px rgba(0,0,0,0.25)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Badge */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
        color: isLive ? '#ff4757' : '#63d2ff',
        textTransform: 'uppercase',
        background: isLive ? 'rgba(255,71,87,0.12)' : 'rgba(99,210,255,0.12)',
        padding: '2px 6px', borderRadius: 4,
      }}>
        {isLive ? '🔴 LIVE' : isFinished ? 'FT' : 'CURATED'}
      </div>

      {/* League */}
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
        color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
        marginBottom: 10, paddingRight: 56,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {match.league || 'SpeedBet Special'}
      </div>

      {/* Teams + score */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { team: match.home, score: match.score?.home, winning: hasScore && match.score?.home > match.score?.away },
          { team: match.away, score: match.score?.away, winning: hasScore && match.score?.away > match.score?.home },
        ].map(({ team, score, winning }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(99,210,255,0.2), rgba(56,145,255,0.1))',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#aaa', letterSpacing: '0.04em',
              }}>
                {(team?.short || team?.name?.slice(0, 3) || '?').toUpperCase().slice(0, 3)}
              </div>
              <span style={{
                fontSize: 13, fontWeight: winning ? 700 : 500,
                color: winning ? '#fff' : 'rgba(255,255,255,0.7)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {team?.name || '—'}
              </span>
            </div>
            {hasScore && (
              <span style={{
                fontSize: 16, fontWeight: 900,
                color: isLive ? '#ff4757' : (winning ? '#fff' : 'rgba(255,255,255,0.6)'),
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}>{score}</span>
            )}
          </div>
        ))}
      </div>

      {!hasScore && !isFinished && (
        <div style={{
          marginTop: 10, paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 10, color: 'rgba(255,255,255,0.3)',
          fontWeight: 600, letterSpacing: '0.04em',
        }}>
          Tap to bet →
        </div>
      )}
    </motion.div>
  );
}

// ─── For You horizontal scroll section ───────────────────────────────────────
function ForYouSection({ matches, loading }) {
  if (!loading && matches.length === 0) return null;

  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      marginBottom: 28,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'linear-gradient(135deg, #63d2ff, #3891ff)',
              boxShadow: '0 0 8px #63d2ff88',
            }} />
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#63d2ff',
            }}>SpeedBet Picks · Curated for you</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-100)' }}>For You</h2>
        </div>
        {!loading && matches.length > 0 && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>
        )}
      </div>

      {/* Horizontal scroll rail */}
      <div style={{ overflowX: 'auto', marginLeft: -16, marginRight: -16, paddingBottom: 18 }} className="no-scrollbar">
        <div style={{
          display: 'flex', gap: 10,
          paddingLeft: 16, paddingRight: 16,
          paddingTop: 4,
          minWidth: 'max-content',
        }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    width: 220, height: 110, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1.5px solid rgba(255,255,255,0.05)',
                  }}
                />
              ))
            : matches.map((m) => (
                <ForYouMatchCard key={m.id} match={m} />
              ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Live() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin-curated For You
  const [forYouMatches, setForYouMatches] = useState([]);
  const [forYouLoading, setForYouLoading] = useState(true);

  // ── Load For You admin matches ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadForYou() {
      try {
        const data = await adminMatchesApi.all();
        if (!cancelled) {
          const adapted  = (data ?? []).map(adaptAdminMatch);
          const active   = adapted.filter((m) => m.status !== 'FINISHED');
          const finished = adapted.filter((m) => m.status === 'FINISHED');
          setForYouMatches([...active, ...finished].slice(0, 12));
        }
      } catch (err) {
        console.error('Live: failed to load admin matches', err);
      } finally {
        if (!cancelled) setForYouLoading(false);
      }
    }

    loadForYou();

    const iv = setInterval(async () => {
      try {
        const data = await adminMatchesApi.all();
        if (!cancelled) {
          const adapted  = (data ?? []).map(adaptAdminMatch);
          const active   = adapted.filter((m) => m.status !== 'FINISHED');
          const finished = adapted.filter((m) => m.status === 'FINISHED');
          setForYouMatches([...active, ...finished].slice(0, 12));
        }
      } catch { /* silent */ }
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  // ── Load live feed ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
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
        <div style={{ marginBottom: 20 }}>
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

        {/* ═══ FOR YOU — Admin-curated matches ═══ */}
        <ForYouSection matches={forYouMatches} loading={forYouLoading} />

        {/* ── Live feed content ── */}
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