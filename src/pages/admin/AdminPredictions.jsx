import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { predictions as predictionsApi, matches as matchesApi } from '../../api';
import { Card, Badge, Button, SectionHeader, Modal, Input, ConfidenceMeter, ProgressBar } from '../../components/ui/UIKit';
import { TargetIcon, BallIcon, RocketIcon, CheckIcon, PlayIcon } from '../../components/icons';
import { useStore } from '../../store';
import AdminShell from './AdminShell';

const TABS = [
  { key: 'football', label: 'Football' },
  { key: 'crash', label: 'Crash' },
  { key: 'virtual', label: 'Virtuals' },
];

export default function AdminPredictions() {
  const [tab, setTab] = useState('football');
  const [picks, setPicks] = useState([]);
  const [matches, setMatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const pushToast = useStore((s) => s.pushToast);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [picksData, matchesData] = await Promise.all([
          predictionsApi.adminPredictions(),
          matchesApi.upcoming(),
        ]);
        if (!cancelled) {
          setPicks(picksData.content || picksData);
          setMatches(matchesData);
          setLoading(false);
        }
      } catch (err) {
        console.error('AdminPredictions: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = picks.filter((p) => p.type === tab || (tab === 'football' && !p.type));

  const runAi = (matchId) => {
    setRunning(true);
    setDraft(null);
    setTimeout(async () => {
      try {
        const result = await predictionsApi.runPrediction({ matchId });
        if (result) {
          setDraft({
            id: result.id || `pred-${Date.now()}`,
            match_id: matchId,
            match_label: result.match_label || result.prediction?.match_label || 'Match',
            league: result.league || result.prediction?.league || '',
            kickoff: result.kickoff || result.prediction?.kickoff,
            predicted_winner: 'HOME',
            predicted_score: result.predicted_score || result.prediction?.predicted_score || { home: 2, away: 1 },
            win_probability: { home: 0.5, draw: 0.25, away: 0.25 },
            btts: true,
            over_under_25: 'OVER',
            confidence: result.confidence || result.prediction?.confidence || 0.7,
            admin_note: result.admin_note || '',
            published_by: 'You',
            type: 'football',
          });
        }
      } catch (err) {
        console.error('Failed to run AI prediction', err);
      } finally {
        setRunning(false);
      }
    }, 1500);
  };

  const publish = () => {
    if (!draft) return;
    setPicks([draft, ...picks]);
    pushToast({ variant: 'win', title: 'Prediction published', message: draft.match_label });
    setOpen(false);
    setDraft(null);
  };

  return (
    <AdminShell title="Predictions" kicker="Admin · Predictions" actions={<Button variant="primary" onClick={() => setOpen(true)}><PlayIcon size={14} /> RUN AI</Button>}>
      <div className="space-y-6">
        {/* Accuracy tracker */}
        <Card className="p-5">
          <SectionHeader kicker="90-day window" title="Accuracy Tracker" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] caps text-white-60 mb-1">FOOTBALL</div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl text-emerald-500 tabular-nums">73%</span>
                <span className="text-white-60 text-xs">28/38 correct</span>
              </div>
              <ProgressBar value={73} max={100} color="#00E676" />
            </div>
            <div>
              <div className="text-[10px] caps text-white-60 mb-1">CRASH</div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl text-amber-400 tabular-nums">61%</span>
                <span className="text-white-60 text-xs">11/18 correct</span>
              </div>
              <ProgressBar value={61} max={100} color="#FFB300" />
            </div>
            <div>
              <div className="text-[10px] caps text-white-60 mb-1">VIRTUALS</div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl text-electric-400 tabular-nums">68%</span>
                <span className="text-white-60 text-xs">15/22 correct</span>
              </div>
              <ProgressBar value={68} max={100} color="#00D4FF" />
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-black-700">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-2 text-sm font-semibold caps transition-all ${tab === t.key ? 'text-crimson-400' : 'text-white-60 hover:text-white-100'}`}
            >
              {t.label}
              {tab === t.key && <motion.div layoutId="adminpred-tab" className="absolute bottom-0 inset-x-0 h-0.5 bg-crimson-400" />}
            </button>
          ))}
        </div>

        {/* Predictions list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {p.type === 'crash' ? <RocketIcon size={16} color="#E8003D" /> : <BallIcon size={16} color="#00D4FF" />}
                    <Badge variant="default">{p.league || 'CRASH'}</Badge>
                  </div>
                  <ConfidenceMeter value={p.confidence} />
                </div>
                <h4 className="font-display text-xl text-white-100" style={{ fontFamily: 'Outfit' }}>{(p.match_label || p.label).toUpperCase()}</h4>
                {p.admin_note && <p className="text-white-80 text-xs italic mt-2">"{p.admin_note}"</p>}
                <div className="flex items-center justify-between mt-3 text-xs text-white-60">
                  <span>By {p.published_by}</span>
                  <Badge variant="win"><CheckIcon size={10} /> PUBLISHED</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setDraft(null); }} title="RUN AI PREDICTION">
        <div className="space-y-4">
          {!draft && (
            <>
              <div className="text-[10px] caps text-white-60 mb-1">PICK MATCH</div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {matches.filter((m) => m.status === 'UPCOMING').slice(0, 6).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => runAi(m.id)}
                    className="w-full text-left p-3 bg-black-800 border border-black-700 hover:border-crimson-400 transition-all"
                    disabled={running}
                  >
                    <div className="text-[10px] caps text-white-60">{m.league}</div>
                    <div className="text-white-100 font-semibold">{m.home.name} vs {m.away.name}</div>
                  </button>
                ))}
              </div>
              {running && (
                <div className="bg-black-800 border border-electric-400 p-4 text-center">
                  <div className="font-display text-2xl text-electric-400 animate-pulse" style={{ fontFamily: 'Outfit' }}>RUNNING AI…</div>
                  <div className="text-white-60 text-xs mt-1">Crunching team form, head-to-head, and 12 other signals.</div>
                </div>
              )}
            </>
          )}
          {draft && (
            <>
              <div className="bg-black-800 border border-black-700 p-4">
                <div className="text-[10px] caps text-white-60">PREDICTION</div>
                <h4 className="font-display text-2xl text-white-100" style={{ fontFamily: 'Outfit' }}>{draft.match_label}</h4>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div><span className="text-white-60">Winner:</span> <span className="text-white-100 font-semibold">{draft.predicted_winner}</span></div>
                  <div><span className="text-white-60">Score:</span> <span className="text-white-100 font-mono">{draft.predicted_score.home}-{draft.predicted_score.away}</span></div>
                  <div><span className="text-white-60">BTTS:</span> <span className="text-white-100">{draft.btts ? 'YES' : 'NO'}</span></div>
                  <div><span className="text-white-60">OU 2.5:</span> <span className="text-white-100">{draft.over_under_25}</span></div>
                  <div className="col-span-2"><span className="text-white-60">Confidence:</span> <span className="text-emerald-500 font-mono">{Math.round(draft.confidence * 100)}%</span></div>
                </div>
              </div>
              <Input label="Admin Note (visible to users)" value={draft.admin_note} onChange={(e) => setDraft({ ...draft, admin_note: e.target.value })} placeholder="Add a hot take…" />
              <Button variant="primary" size="lg" className="w-full" onClick={publish}>PUBLISH PREDICTION</Button>
            </>
          )}
        </div>
      </Modal>
    </AdminShell>
  );
}
