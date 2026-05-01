import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { predictions as predictionsApi } from '../api';
import { Card, Badge, Button, SectionHeader, ConfidenceMeter, EmptyState } from '../components/ui/UIKit';
import { TargetIcon, FlameIcon, RocketIcon, BallIcon } from '../components/icons';
import { fmtCountdown } from '../utils';
import { useStore } from '../store';
import { CardSkeleton } from '../components/ui/Skeleton';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'football', label: 'Football' },
  { key: 'crash', label: 'Crash' },
  { key: 'virtual', label: 'Virtuals' },
  { key: 'HIGH_CONF', label: 'High Confidence (≥70%)' },
];

export default function Predictions() {
  const [filter, setFilter] = useState('ALL');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const pushToast = useStore((s) => s.pushToast);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await predictionsApi.public();
        if (!cancelled) {
          setPredictions(data.content || data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Predictions: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return predictions;
    if (filter === 'HIGH_CONF') return predictions.filter((p) => p.confidence >= 0.7);
    return predictions.filter((p) => p.type === filter);
  }, [filter, predictions]);

  const accuracy = null; // Will be fetched from API
  const totalPosted = predictions.length;

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-electric-400/15 to-black-950 border-b border-black-700 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-[10px] caps text-electric-400 mb-2 flex items-center gap-2">
            <TargetIcon size={14} color="#00D4FF" /> AI + ADMIN PICKS
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-white-100 leading-none" style={{ fontFamily: 'Outfit', letterSpacing: '0.01em' }}>
            PREDICTIONS
          </h1>
          <p className="text-white-80 text-sm md:text-base mt-2 max-w-2xl">
            Sharpest reads on the board. Hand-picked by our admin team. AI-confidence backed.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <div className="px-4 py-2 bg-black-900 border border-black-700">
              <div className="text-[10px] caps text-white-60">90-DAY ACCURACY</div>
              <div className="font-mono text-2xl text-emerald-500 tabular-nums">{accuracy}%</div>
            </div>
            <div className="px-4 py-2 bg-black-900 border border-black-700">
              <div className="text-[10px] caps text-white-60">PICKS POSTED</div>
              <div className="font-mono text-2xl text-white-100 tabular-nums">{totalPosted}</div>
            </div>
            <div className="px-4 py-2 bg-black-900 border border-black-700">
              <div className="text-[10px] caps text-white-60">LIVE PICKS</div>
              <div className="font-mono text-2xl text-crimson-400 tabular-nums">{loading ? '...' : predictions.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-20 bg-black-950/95 backdrop-blur border-b border-black-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 text-[11px] caps font-semibold whitespace-nowrap transition-all border-2 ${
                filter === f.key ? 'bg-crimson-400 text-white-100 border-crimson-400' : 'bg-black-800 text-white-80 border-black-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No predictions match" subtitle="Try a different filter." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PredictionCard prediction={p} onView={() => pushToast({ variant: 'info', title: 'Details', message: p.admin_note || 'Pick details' })} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PredictionCard({ prediction, onView }) {
  const isCrash = prediction.type === 'crash';
  const Icon = isCrash ? RocketIcon : BallIcon;

  return (
    <Card className="p-5 hover:border-crimson-400 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={20} color={isCrash ? '#E8003D' : '#00D4FF'} />
          <Badge variant={isCrash ? 'live' : 'default'}>{isCrash ? 'CRASH' : prediction.league?.toUpperCase()}</Badge>
        </div>
        <ConfidenceMeter value={prediction.confidence} />
      </div>

      <h3 className="font-display text-2xl text-white-100 leading-tight mb-2" style={{ fontFamily: 'Outfit' }}>
        {(prediction.match_label || prediction.label).toUpperCase()}
      </h3>

      {!isCrash && (
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-black-800 border border-black-700 text-[10px] caps text-white-80">
            Pick: {prediction.predicted_winner}
          </span>
          <span className="px-2 py-1 bg-black-800 border border-black-700 text-[10px] caps text-white-80">
            Score: {prediction.predicted_score.home}-{prediction.predicted_score.away}
          </span>
          <span className="px-2 py-1 bg-black-800 border border-black-700 text-[10px] caps text-white-80">
            BTTS: {prediction.btts ? 'YES' : 'NO'}
          </span>
          <span className="px-2 py-1 bg-black-800 border border-black-700 text-[10px] caps text-white-80">
            {prediction.over_under_25} 2.5
          </span>
        </div>
      )}

      {isCrash && (
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-black-800 border border-black-700 text-[10px] caps text-white-80">
            Cashout: {prediction.suggested_cashout_min}x – {prediction.suggested_cashout_max}x
          </span>
        </div>
      )}

      {prediction.admin_note && (
        <div className="bg-black-800 border-l-2 border-crimson-400 p-3 text-sm text-white-80 italic mb-3">
          "{prediction.admin_note}"
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-white-60">By <span className="text-white-100">{prediction.published_by}</span></span>
        {prediction.kickoff && <span className="text-electric-400 font-mono">⏱ {fmtCountdown(prediction.kickoff)}</span>}
      </div>

      <Button variant="ghost" size="sm" className="w-full mt-3" onClick={onView}>
        VIEW MATCH →
      </Button>
    </Card>
  );
}
