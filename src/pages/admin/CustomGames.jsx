import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { admin as adminApi } from '../../api';
import { Card, Badge, Button, SectionHeader, Modal, Input } from '../../components/ui/UIKit';
import { useStore } from '../../store';
import AdminShell from './AdminShell';

// ── Status helpers ─────────────────────────────────────────────────────────

const STATUS_COLORS = {
  SCHEDULED:   'bg-sky-500/15 text-sky-300 border border-sky-500/30',
  LIVE:        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40',
  HALF_TIME:   'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  SECOND_HALF: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
  FINISHED:    'bg-white/5 text-white/40 border border-white/10',
};

const STATUS_DOT = {
  SCHEDULED:   'bg-sky-400',
  LIVE:        'bg-emerald-400 animate-pulse',
  HALF_TIME:   'bg-amber-400',
  SECOND_HALF: 'bg-orange-400 animate-pulse',
  FINISHED:    'bg-white/30',
};

// Legal transitions mirroring the backend state machine
const NEXT_STATUSES = {
  SCHEDULED:   ['LIVE'],
  LIVE:        ['HALF_TIME', 'FINISHED'],
  HALF_TIME:   ['SECOND_HALF'],
  SECOND_HALF: ['FINISHED'],
  FINISHED:    [],
};

const STATUS_LABELS = {
  SCHEDULED:   'SCHEDULED',
  LIVE:        'LIVE',
  HALF_TIME:   'HALF TIME',
  SECOND_HALF: '2ND HALF',
  FINISHED:    'FINISHED',
};

function formatKickoff(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── Score Modal ────────────────────────────────────────────────────────────

function ScoreModal({ match, onClose, onSaved }) {
  const [home, setHome] = useState(String(match.scoreHome ?? 0));
  const [away, setAway] = useState(String(match.scoreAway ?? 0));
  const [minute, setMinute] = useState(String(match.minutePlayed ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pushToast = useStore((s) => s.pushToast);

  const save = async () => {
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError('Scores must be non-negative integers.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { scoreHome: h, scoreAway: a };
      if (minute.trim()) payload.minutePlayed = parseInt(minute, 10);
      const updated = await adminApi.updateMatchScore(match.id, payload);
      pushToast({ variant: 'win', title: 'Score updated', message: `${updated.scoreHome}–${updated.scoreAway}` });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update score');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="UPDATE SCORE">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">{match.homeTeam}</div>
            <input
              type="number"
              min={0}
              value={home}
              onChange={(e) => setHome(e.target.value)}
              className="w-full bg-black-800 border-2 border-black-700 text-white text-2xl font-mono text-center px-3 py-3 focus:border-crimson-400 outline-none"
            />
          </div>
          <div className="text-white/30 text-2xl font-mono mt-5">–</div>
          <div className="flex-1">
            <div className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">{match.awayTeam}</div>
            <input
              type="number"
              min={0}
              value={away}
              onChange={(e) => setAway(e.target.value)}
              className="w-full bg-black-800 border-2 border-black-700 text-white text-2xl font-mono text-center px-3 py-3 focus:border-crimson-400 outline-none"
            />
          </div>
        </div>
        <Input
          label="Minute Played (optional)"
          type="number"
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          placeholder="e.g. 67"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <Button variant="primary" size="lg" className="w-full" onClick={save} disabled={saving}>
          {saving ? 'SAVING…' : 'SAVE SCORE'}
        </Button>
      </div>
    </Modal>
  );
}

// ── Status Modal ───────────────────────────────────────────────────────────

function StatusModal({ match, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pushToast = useStore((s) => s.pushToast);
  const next = NEXT_STATUSES[match.status] ?? [];

  const transition = async (target) => {
    setSaving(true);
    setError('');
    try {
      const updated = await adminApi.updateMatchStatus(match.id, { status: target });
      pushToast({
        variant: target === 'FINISHED' ? 'default' : 'win',
        title: 'Status updated',
        message: `${match.status} → ${target}`,
      });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transition failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="TRANSITION STATUS">
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono uppercase rounded-sm ${STATUS_COLORS[match.status] ?? ''}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[match.status] ?? 'bg-white/20'}`} />
            {STATUS_LABELS[match.status] ?? match.status}
          </span>
          <span className="text-white/30 text-xs">→</span>
        </div>

        {next.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">
            FINISHED is terminal — no further transitions allowed.
          </p>
        ) : (
          next.map((s) => (
            <button
              key={s}
              onClick={() => transition(s)}
              disabled={saving}
              className={`w-full flex items-center justify-between px-4 py-3 border-2 transition-all ${
                s === 'FINISHED'
                  ? 'border-white/10 bg-white/5 hover:border-white/20 text-white/60'
                  : 'border-crimson-500/40 bg-crimson-500/10 hover:border-crimson-400 hover:bg-crimson-500/20 text-white'
              } disabled:opacity-50`}
            >
              <span className="font-mono text-sm tracking-widest">{STATUS_LABELS[s]}</span>
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s] ?? 'bg-white/20'}`} />
            </button>
          ))
        )}

        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    </Modal>
  );
}

// ── Create Modal ───────────────────────────────────────────────────────────

const BLANK_FORM = {
  homeTeam: '',
  awayTeam: '',
  league: '',
  sport: 'football',
  homeLogo: '',
  awayLogo: '',
  leagueLogo: '',
  kickoffDate: '',
  kickoffTime: '',
  status: 'SCHEDULED',
  featured: false,
};

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pushToast = useStore((s) => s.pushToast);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const create = async () => {
    if (!form.homeTeam.trim() || !form.awayTeam.trim()) {
      setError('Home team and away team are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        homeTeam: form.homeTeam.trim(),
        awayTeam: form.awayTeam.trim(),
        league: form.league?.trim() || undefined,
        sport: form.sport || 'football',
        homeLogo: form.homeLogo?.trim() || undefined,
        awayLogo: form.awayLogo?.trim() || undefined,
        leagueLogo: form.leagueLogo?.trim() || undefined,
        status: form.status || 'SCHEDULED',
        featured: form.featured,
      };

      if (form.kickoffDate && form.kickoffTime) {
        payload.kickoffAt = new Date(`${form.kickoffDate}T${form.kickoffTime}:00`).toISOString();
      } else if (form.kickoffDate) {
        payload.kickoffAt = new Date(`${form.kickoffDate}T00:00:00`).toISOString();
      }

      const match = await adminApi.createMatch(payload);
      pushToast({ variant: 'win', title: 'Match created', message: `${match.homeTeam} vs ${match.awayTeam}` });
      onCreated(match);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create match');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="CREATE ADMIN MATCH">
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Home Team *" value={form.homeTeam} onChange={(e) => set('homeTeam', e.target.value)} placeholder="Manchester City" />
          <Input label="Away Team *" value={form.awayTeam} onChange={(e) => set('awayTeam', e.target.value)} placeholder="Arsenal" />
        </div>

        <Input label="League" value={form.league} onChange={(e) => set('league', e.target.value)} placeholder="Premier League" />
        <Input label="Sport" value={form.sport} onChange={(e) => set('sport', e.target.value)} placeholder="football" />

        <Input label="Home Logo URL" value={form.homeLogo} onChange={(e) => set('homeLogo', e.target.value)} placeholder="https://… (optional)" />
        <Input label="Away Logo URL" value={form.awayLogo} onChange={(e) => set('awayLogo', e.target.value)} placeholder="https://… (optional)" />
        <Input label="League Logo URL" value={form.leagueLogo} onChange={(e) => set('leagueLogo', e.target.value)} placeholder="https://… (optional)" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">Kickoff Date</div>
            <input
              type="date"
              value={form.kickoffDate}
              onChange={(e) => set('kickoffDate', e.target.value)}
              className="w-full bg-black-800 border-2 border-black-700 text-white text-sm px-3 py-2 focus:border-crimson-400 outline-none"
            />
          </div>
          <div>
            <div className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">Kickoff Time</div>
            <input
              type="time"
              value={form.kickoffTime}
              onChange={(e) => set('kickoffTime', e.target.value)}
              className="w-full bg-black-800 border-2 border-black-700 text-white text-sm px-3 py-2 focus:border-crimson-400 outline-none"
            />
          </div>
        </div>

        <div>
          <div className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">Initial Status</div>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="w-full bg-black-800 border-2 border-black-700 text-white text-sm px-3 py-2 focus:border-crimson-400 outline-none"
          >
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="LIVE">LIVE</option>
            <option value="HALF_TIME">HALF_TIME</option>
            <option value="SECOND_HALF">SECOND_HALF</option>
          </select>
        </div>

        <button
          onClick={() => set('featured', !form.featured)}
          className={`w-full flex items-center justify-between px-4 py-3 border-2 transition-all ${
            form.featured
              ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
              : 'border-black-700 bg-black-800 text-white/50 hover:border-white/20'
          }`}
        >
          <span className="text-xs font-mono uppercase tracking-widest">Featured in lobby carousel</span>
          <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all ${form.featured ? 'border-amber-400 bg-amber-400' : 'border-white/20'}`}>
            {form.featured && <span className="text-black text-[10px] font-bold">✓</span>}
          </span>
        </button>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <Button variant="primary" size="lg" className="w-full" onClick={create} disabled={saving}>
          {saving ? 'CREATING…' : 'CREATE MATCH'}
        </Button>
      </div>
    </Modal>
  );
}

// ── Match Card ─────────────────────────────────────────────────────────────

function MatchCard({ match, index, onScoreClick, onStatusClick }) {
  const isLive = ['LIVE', 'HALF_TIME', 'SECOND_HALF'].includes(match.status);
  const isFinished = match.status === 'FINISHED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="p-4 flex flex-col gap-3">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono uppercase rounded-sm ${STATUS_COLORS[match.status] ?? 'bg-white/5 text-white/30'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[match.status] ?? 'bg-white/20'}`} />
            {STATUS_LABELS[match.status] ?? match.status}
          </span>
          {match.minutePlayed != null && isLive && (
            <span className="text-[10px] font-mono text-white/40">{match.minutePlayed}'</span>
          )}
        </div>

        {/* Teams + score */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {match.homeLogo && (
              <img
                src={match.homeLogo}
                alt=""
                className="w-5 h-5 object-contain opacity-80"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <span className="font-display text-sm text-white truncate flex-1" style={{ fontFamily: 'Outfit' }}>
              {match.homeTeam}
            </span>
            {match.scoreHome != null && (
              <span className="font-mono text-white text-sm tabular-nums">{match.scoreHome}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {match.awayLogo && (
              <img
                src={match.awayLogo}
                alt=""
                className="w-5 h-5 object-contain opacity-80"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <span className="font-display text-sm text-white truncate flex-1" style={{ fontFamily: 'Outfit' }}>
              {match.awayTeam}
            </span>
            {match.scoreAway != null && (
              <span className="font-mono text-white text-sm tabular-nums">{match.scoreAway}</span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-0.5">
          {match.league && (
            <span className="text-[10px] text-white/30 truncate">{match.league}</span>
          )}
          <span className="text-[10px] text-white/20 font-mono">{formatKickoff(match.kickoffAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-[10px]"
            onClick={() => onScoreClick(match)}
            disabled={!isLive}
          >
            SCORE
          </Button>
          <Button
            variant={!isFinished ? 'outline' : 'ghost'}
            size="sm"
            className="flex-1 text-[10px]"
            onClick={() => onStatusClick(match)}
            disabled={isFinished}
          >
            STATUS
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const TABS = ['ALL', 'SCHEDULED', 'LIVE', 'FINISHED'];

export default function CustomGames() {
  const [matchList, setMatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [scoreTarget, setScoreTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const pushToast = useStore((s) => s.pushToast);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await adminApi.listMyMatches();
      setMatchList(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load matches';
      setLoadError(msg);
      pushToast({ variant: 'error', title: 'Load failed', message: msg });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => { load(); }, [load]);

  const upsert = (updated) =>
    setMatchList((prev) =>
      prev.some((m) => m.id === updated.id)
        ? prev.map((m) => (m.id === updated.id ? updated : m))
        : [updated, ...prev]
    );

  const filtered = matchList.filter((m) => {
    if (filter === 'ALL') return true;
    if (filter === 'LIVE') return ['LIVE', 'HALF_TIME', 'SECOND_HALF'].includes(m.status);
    return m.status === filter;
  });

  const liveCount = matchList.filter((m) =>
    ['LIVE', 'HALF_TIME', 'SECOND_HALF'].includes(m.status)
  ).length;

  const tabLabel = (t) => {
    if (t === 'ALL') return `ALL (${matchList.length})`;
    if (t === 'LIVE') return liveCount > 0 ? `LIVE (${liveCount})` : 'LIVE';
    return t;
  };

  return (
    <AdminShell
      title="Match Manager"
      kicker="Admin · Matches"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            {loading ? '…' : '↻ REFRESH'}
          </Button>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            + NEW MATCH
          </Button>
        </div>
      }
    >
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-white/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all rounded-sm ${
              filter === t
                ? 'bg-crimson-500/20 text-crimson-400 border border-crimson-500/40'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tabLabel(t)}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && loadError && (
        <div className="text-center py-16">
          <p className="text-red-400 text-sm mb-3">{loadError}</p>
          <Button variant="outline" onClick={load}>RETRY</Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadError && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/20 text-sm font-mono uppercase tracking-widest mb-4">
            No {filter !== 'ALL' ? filter.toLowerCase() + ' ' : ''}matches yet
          </p>
          {filter === 'ALL' && (
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              CREATE YOUR FIRST MATCH
            </Button>
          )}
        </div>
      )}

      {/* Match grid */}
      {!loading && !loadError && filtered.length > 0 && (
        <>
          <SectionHeader
            kicker={`${filtered.length} match${filtered.length !== 1 ? 'es' : ''}`}
            title={filter === 'ALL' ? 'All Matches' : tabLabel(filter)}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence>
              {filtered.map((m, i) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  index={i}
                  onScoreClick={setScoreTarget}
                  onStatusClick={setStatusTarget}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(m) => { upsert(m); setFilter('ALL'); }}
        />
      )}
      {scoreTarget && (
        <ScoreModal
          match={scoreTarget}
          onClose={() => setScoreTarget(null)}
          onSaved={upsert}
        />
      )}
      {statusTarget && (
        <StatusModal
          match={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSaved={upsert}
        />
      )}
    </AdminShell>
  );
}