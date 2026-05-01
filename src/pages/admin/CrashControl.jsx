import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { admin } from '../../api';
import { Card, Badge, Button, SectionHeader, Modal, LiveDot } from '../../components/ui/UIKit';
import { RocketIcon, FlameIcon, BellIcon, ClockIcon, ShieldIcon, PlusIcon } from '../../components/icons';
import { tierColor } from '../../utils';
import { useStore } from '../../store';
import AdminShell from './AdminShell';

// All available games — keep in sync with CrashService.GAME_SLUGS
// + the extra ones registered in GamesHub
const AVAILABLE_GAMES = [
  { slug: 'aviator',     label: 'Aviator',     emoji: '✈️' },
  { slug: 'sporty-jet',  label: 'Sporty Jet',  emoji: '🚀' },
  { slug: 'crash',       label: 'Crash',       emoji: '💥' },
  { slug: 'superhero',   label: 'Superhero',   emoji: '🦸' },
];

export default function CrashControl() {
  // ── Game selection ────────────────────────────────────────────────────
  const [activeGame, setActiveGame] = useState(AVAILABLE_GAMES[0].slug);

  // ── Modal state ───────────────────────────────────────────────────────
  const [overrideOpen,  setOverrideOpen]  = useState(false);
  const [scheduleOpen,  setScheduleOpen]  = useState(false);
  const [alertOpen,     setAlertOpen]     = useState(false);

  // ── Form state ────────────────────────────────────────────────────────
  const [overrideValue, setOverrideValue] = useState(2.0);
  const [overrideRound, setOverrideRound] = useState('');
  const [alertText,     setAlertText]     = useState('Big crash incoming — buckle up.');

  // ── Data ──────────────────────────────────────────────────────────────
  const [crashHistory,  setCrashHistory]  = useState([]);
  const [crashUpcoming, setCrashUpcoming] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);

  const pushToast = useStore((s) => s.pushToast);

  // Re-load whenever the active game changes
  useEffect(() => {
    load(activeGame);
  }, [activeGame]);

  async function load(slug = activeGame) {
    setLoading(true);
    try {
      const [historyPage, schedule] = await Promise.all([
        admin.crashHistory(slug, 0, 50),
        admin.crashSchedule(slug, 20),
      ]);
      setCrashHistory(historyPage.content ?? historyPage);
      setCrashUpcoming(schedule);
    } catch (err) {
      console.error('CrashControl: failed to load', err);
      pushToast({ variant: 'loss', title: 'Load failed', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  // ── Derived values ────────────────────────────────────────────────────
  const liveRound = crashUpcoming[0] ?? null;
  const upcoming  = crashUpcoming.slice(0, 8);
  const highRoundsAhead = upcoming.filter(
    (r) => r.tier === 'HIGH' || r.tier === 'EXTREME',
  );

  const stats = crashHistory.length > 0 ? {
    avg: +(crashHistory.reduce((s, r) => s + Number(r.crashAt ?? r.crash_at), 0) / crashHistory.length).toFixed(2),
    max: Math.max(...crashHistory.map((r) => Number(r.crashAt ?? r.crash_at))),
    high:    crashHistory.filter((r) => Number(r.crashAt ?? r.crash_at) >= 10).length,
    extreme: crashHistory.filter((r) => Number(r.crashAt ?? r.crash_at) >= 20).length,
    totalRounds: crashHistory.length + crashUpcoming.length,
  } : { avg: 0, max: 0, high: 0, extreme: 0, totalRounds: 0 };

  // ── Actions ───────────────────────────────────────────────────────────
  async function handleOverride() {
    if (!overrideRound) return;
    setSubmitting(true);
    try {
      const target = crashUpcoming.find(
        (r) => (r.roundNumber ?? r.round_number) === Number(overrideRound),
      );
      if (!target) throw new Error('Round not found in upcoming schedule');
      await admin.overrideCrash(target.id, {
        crashAt: overrideValue,
        reason:  'Admin manual override',
      });
      pushToast({ variant: 'win', title: 'Override applied', message: `Round #${overrideRound} → ${overrideValue}x` });
      setOverrideOpen(false);
      load();
    } catch (err) {
      pushToast({ variant: 'loss', title: 'Override failed', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerate() {
    setSubmitting(true);
    try {
      await admin.generateCrashSchedule(activeGame);
      pushToast({ variant: 'win', title: 'Schedule generated', message: 'New rounds queued' });
      setScheduleOpen(false);
      load();
    } catch (err) {
      pushToast({ variant: 'loss', title: 'Generate failed', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Field normaliser (camelCase ↔ snake_case) ─────────────────────────
  const norm = (r) => ({
    ...r,
    crash_at:       Number(r.crashAt    ?? r.crash_at    ?? 0),
    round_number:   r.roundNumber       ?? r.round_number,
    generated_by:   r.generatedBy       ?? r.generated_by,
    eta_seconds:    r.etaSeconds        ?? r.eta_seconds  ?? 0,
    is_extreme_crash: r.extremeCrash    ?? r.is_extreme_crash ?? false,
  });

  const activeGameMeta = AVAILABLE_GAMES.find((g) => g.slug === activeGame);

  return (
    <AdminShell
      title="Crash Control"
      kicker="Admin · Crash Engine"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
            <BellIcon size={12} /> ALERT
          </Button>
          <Button variant="outline" size="sm" onClick={() => setScheduleOpen(true)}>
            <PlusIcon size={12} /> GENERATE
          </Button>
          <Button variant="primary" size="sm" onClick={() => setOverrideOpen(true)}>
            <ShieldIcon size={12} /> OVERRIDE
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* ── Game selector ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_GAMES.map((game) => {
            const isActive = game.slug === activeGame;
            return (
              <button
                key={game.slug}
                onClick={() => {
                  if (game.slug !== activeGame) {
                    setActiveGame(game.slug);
                    // Reset form state so stale round numbers don't bleed through
                    setOverrideRound('');
                  }
                }}
                className={[
                  'flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-widest border transition-all',
                  isActive
                    ? 'border-electric-400 text-electric-400 bg-electric-400/10'
                    : 'border-black-700 text-white-60 hover:border-white-40 hover:text-white-100',
                ].join(' ')}
              >
                <span>{game.emoji}</span>
                {game.label}
                {isActive && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-electric-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Live monitor ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-5 border-crimson-400">
              <div className="flex items-center gap-3 mb-3">
                <LiveDot label="LIVE MONITOR" />
                <SectionHeader
                  kicker={`${activeGameMeta?.emoji} ${activeGameMeta?.label} · Round in flight`}
                  title="Right Now"
                />
              </div>
              {loading ? (
                <div className="text-white-60 text-sm p-4">Loading…</div>
              ) : liveRound ? (() => {
                const r = norm(liveRound);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 bg-black-800 p-4 border border-black-700">
                      <div className="text-[10px] caps text-white-60">CURRENT ROUND</div>
                      <div className="font-mono text-4xl text-white-100 tabular-nums">#{r.round_number}</div>
                      <div className="text-white-60 text-xs mt-1">Generated by {r.generated_by}</div>
                    </div>
                    <div className="bg-black-800 p-4 border border-black-700">
                      <div className="text-[10px] caps text-white-60">SCHEDULED CRASH</div>
                      <div className="font-mono text-3xl tabular-nums" style={{ color: tierColor(liveRound.tier).text }}>
                        {r.crash_at.toFixed(2)}x
                      </div>
                      <Badge variant={liveRound.tier?.toLowerCase()} className="mt-1">{liveRound.tier}</Badge>
                    </div>
                    <div className="bg-black-800 p-4 border border-black-700">
                      <div className="text-[10px] caps text-white-60">ETA</div>
                      <div className="font-mono text-3xl text-electric-400 tabular-nums">{r.eta_seconds}s</div>
                    </div>
                  </div>
                );
              })() : (
                <div className="text-white-60 text-sm p-4">
                  No upcoming rounds for <strong>{activeGameMeta?.label}</strong>. Generate a schedule.
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* ── Upcoming + high crash alerts ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <SectionHeader kicker="Next 8 rounds" title="Upcoming Schedule" />
            {loading ? (
              <div className="text-white-60 text-sm">Loading…</div>
            ) : (
              <div className="space-y-2">
                {upcoming.map((round) => {
                  const r  = norm(round);
                  const tc = tierColor(round.tier);
                  return (
                    <div
                      key={round.id}
                      className="flex items-center gap-3 p-3 border"
                      style={{ borderColor: tc.text + '55', backgroundColor: tc.bg }}
                    >
                      <div className="font-mono text-white-60 text-xs w-16">#{r.round_number}</div>
                      <Badge variant={round.tier?.toLowerCase()}>{round.tier}</Badge>
                      <div className="flex-1" />
                      <div className="font-mono text-2xl tabular-nums" style={{ color: tc.text }}>
                        {r.crash_at.toFixed(2)}x
                      </div>
                      <div className="text-white-60 text-xs font-mono w-12 text-right">
                        <ClockIcon size={10} className="inline" /> {r.eta_seconds}s
                      </div>
                    </div>
                  );
                })}
                {upcoming.length === 0 && (
                  <div className="text-white-60 text-sm">No upcoming rounds scheduled.</div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-5 border-amber-400">
            <div className="flex items-center gap-2 mb-2">
              <FlameIcon size={16} color="#FFB300" />
              <span className="text-[10px] caps text-amber-400">HIGH CRASH ALERTS</span>
            </div>
            <h3 className="font-display text-2xl text-white-100 mb-3">HEADS UP</h3>
            {highRoundsAhead.length === 0 ? (
              <p className="text-white-60 text-sm">No high crash rounds in the next 8.</p>
            ) : (
              <div className="space-y-2">
                {highRoundsAhead.map((round) => {
                  const r = norm(round);
                  return (
                    <motion.div
                      key={round.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-3 border-2 ${r.is_extreme_crash ? 'border-brand-400 bg-brand-400/10' : 'border-crimson-400 bg-crimson-400/10'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-white-60 text-xs">#{r.round_number}</span>
                        <Badge variant={r.is_extreme_crash ? 'extreme' : 'high'}>
                          {r.is_extreme_crash ? 'EXTREME' : 'HIGH'}
                        </Badge>
                      </div>
                      <div className="font-mono text-2xl text-white-100 tabular-nums">
                        {r.crash_at.toFixed(2)}x
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            <Button variant="primary" size="sm" className="w-full mt-3" onClick={() => setAlertOpen(true)}>
              BROADCAST ALERT
            </Button>
          </Card>
        </div>

        {/* ── History chart ─────────────────────────────────────────────── */}
        <Card className="p-5">
          <SectionHeader kicker="Last 20 rounds" title="History" />
          {loading ? (
            <div className="text-white-60 text-sm">Loading…</div>
          ) : (
            <div className="w-full h-[280px]">
              <ResponsiveContainer>
                <BarChart
                  data={crashHistory.slice(-20).map(norm)}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <XAxis dataKey="round_number" tick={{ fill: '#888', fontSize: 10 }} axisLine={{ stroke: '#333' }} tickLine={false} />
                  <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={{ stroke: '#333' }} tickLine={false} tickFormatter={(v) => `${v}x`} />
                  <Tooltip contentStyle={{ background: '#15151E', border: '1px solid #2A2A35', color: '#fff' }} />
                  <Bar dataKey="crash_at" radius={[2, 2, 0, 0]}>
                    {crashHistory.slice(-20).map((r, i) => (
                      <Cell key={i} fill={tierColor(r.tier).text} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* ── Stats panel ───────────────────────────────────────────────── */}
        <Card className="p-5">
          <SectionHeader kicker="Aggregate" title="Stats Panel" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="AVG MULTIPLIER"  value={`${stats.avg}x`} />
            <Stat label="HIGHEST EVER"    value={`${stats.max.toFixed(2)}x`} color="#FFB300" />
            <Stat label="HIGH CRASHES"    value={stats.high}    color="#E8003D" />
            <Stat label="EXTREMES"        value={stats.extreme} color="#B388FF" />
            <Stat label="TOTAL ROUNDS"    value={stats.totalRounds} />
          </div>
        </Card>
      </div>

      {/* ── Override modal ────────────────────────────────────────────────── */}
      <Modal open={overrideOpen} onClose={() => setOverrideOpen(false)} title="OVERRIDE NEXT CRASH">
        <div className="space-y-3">
          <div className="bg-amber-400/10 border border-amber-400 p-3 text-amber-400 text-xs">
            <ShieldIcon size={12} color="#FFB300" className="inline mr-1" />
            Use sparingly. All overrides are logged for super-admin audit.
          </div>

          {/* Game reminder */}
          <div className="bg-black-800 border border-black-700 p-3 flex items-center gap-2 text-xs text-white-60">
            <span>{activeGameMeta?.emoji}</span>
            Targeting: <span className="text-white-100 font-semibold ml-1">{activeGameMeta?.label}</span>
          </div>

          <div>
            <div className="text-[10px] caps text-white-60 mb-1">ROUND NUMBER</div>
            <select
              className="w-full bg-black-800 border-2 border-black-700 text-white-100 text-sm px-3 py-2 focus:border-electric-400 outline-none"
              value={overrideRound}
              onChange={(e) => setOverrideRound(e.target.value)}
            >
              <option value="">Select a round…</option>
              {crashUpcoming.map((r) => (
                <option key={r.id} value={r.roundNumber ?? r.round_number}>
                  #{r.roundNumber ?? r.round_number} — {Number(r.crashAt ?? r.crash_at).toFixed(2)}x ({r.tier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-[10px] caps text-white-60 mb-1">NEW CRASH MULTIPLIER</div>
            <input
              type="number"
              step="0.01"
              min="1.00"
              value={overrideValue}
              onChange={(e) => setOverrideValue(+e.target.value)}
              className="w-full bg-black-800 border-2 border-black-700 text-white-100 text-sm px-3 py-2 focus:border-electric-400 outline-none"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleOverride}
            disabled={submitting || !overrideRound}
          >
            {submitting ? 'APPLYING…' : 'APPLY OVERRIDE'}
          </Button>
        </div>
      </Modal>

      {/* ── Schedule generator modal ──────────────────────────────────────── */}
      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="GENERATE SCHEDULE">
        <div className="space-y-3">
          <div className="bg-black-800 border border-black-700 p-3 flex items-center gap-2 text-xs text-white-60">
            <span>{activeGameMeta?.emoji}</span>
            Generating for: <span className="text-white-100 font-semibold ml-1">{activeGameMeta?.label}</span>
          </div>
          <p className="text-white-80 text-sm">
            Generate the next batch of rounds using the AI scheduler. House-edge controlled.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={submitting}
          >
            {submitting ? 'GENERATING…' : 'GENERATE ROUNDS'}
          </Button>
        </div>
      </Modal>

      {/* ── Alert modal ───────────────────────────────────────────────────── */}
      <Modal open={alertOpen} onClose={() => setAlertOpen(false)} title="BROADCAST ALERT CARD">
        <div className="space-y-3">
          <p className="text-white-80 text-sm">
            Push an alert card to all players currently in the{' '}
            <strong>{activeGameMeta?.label}</strong> lobby.
          </p>
          <div>
            <div className="text-[10px] caps text-white-60 mb-1">MESSAGE</div>
            <textarea
              value={alertText}
              onChange={(e) => setAlertText(e.target.value)}
              rows={3}
              className="w-full bg-black-800 border-2 border-black-700 text-white-100 text-sm px-3 py-2 focus:border-electric-400 outline-none"
            />
          </div>
          <div className="bg-black-800 border-l-4 border-crimson-400 p-3">
            <div className="text-[10px] caps text-crimson-400">PREVIEW</div>
            <div className="text-white-100 font-semibold mt-1">{alertText || 'Empty…'}</div>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              // Wire to your WebSocket broadcast service when ready
              pushToast({ variant: 'win', title: 'Alert sent', message: `Broadcast to ${activeGameMeta?.label} lobby` });
              setAlertOpen(false);
            }}
          >
            BROADCAST
          </Button>
        </div>
      </Modal>
    </AdminShell>
  );
}

function Stat({ label, value, color = '#fff' }) {
  return (
    <div className="bg-black-800 border border-black-700 p-3">
      <div className="text-[10px] caps text-white-60">{label}</div>
      <div className="font-mono text-2xl tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}