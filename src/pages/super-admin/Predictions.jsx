import { useState, useEffect } from 'react';
import { superAdmin as superAdminApi } from '../../api';
import { Card, Badge, SectionHeader, ConfidenceMeter } from '../../components/ui/UIKit';
import { BallIcon, RocketIcon, ShieldIcon } from '../../components/icons';
import SuperAdminShell from './SuperAdminShell';

export default function SuperAdminPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await superAdminApi.predictions();
        if (!cancelled) {
          setPredictions(data.content || data);
          setLoading(false);
        }
      } catch (err) {
        console.error('SuperAdminPredictions: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const accuracy = 73;

  return (
    <SuperAdminShell title="PREDICTIONS LOG">
      <div className="space-y-6">
        <Card className="p-5 border-amber-400 bg-amber-400/5">
          <div className="flex items-center gap-3">
            <ShieldIcon size={20} color="#FFB300" />
            <div>
              <div className="text-[10px] caps text-amber-400">READ-ONLY</div>
              <p className="text-white-80 text-sm">
                Per system policy, Admin predictions take priority. Super-admin can monitor but does not edit or override published picks.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">90-DAY ACCURACY</div>
            <div className="font-mono text-3xl text-emerald-500 tabular-nums">
              {loading ? '...' : accuracy + '%'}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">LIVE PICKS</div>
            <div className="font-mono text-3xl text-white-100 tabular-nums">
              {loading ? '...' : predictions.length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">UNIQUE ADMINS</div>
            <div className="font-mono text-3xl text-brand-400 tabular-nums">
              {loading ? '...' : new Set(predictions.map((p) => p.published_by || p.sharedByAdminId)).size}
            </div>
          </Card>
        </div>

        <SectionHeader kicker="Audit view" title="All Predictions" />

        {loading ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text-60)' }}>
            Loading predictions...
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text-60)' }}>
            No predictions yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predictions.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {p.type === 'crash'
                      ? <RocketIcon size={16} color="#E8003D" />
                      : <BallIcon size={16} color="#00D4FF" />}
                    <Badge variant="default">{p.league || 'CRASH'}</Badge>
                  </div>
                  <ConfidenceMeter value={p.confidence} />
                </div>
                <h4
                  className="font-display text-xl text-white-100"
                  style={{ fontFamily: 'Outfit' }}
                >
                  {(p.match_label || p.label || 'Prediction').toUpperCase()}
                </h4>
                {p.admin_note && (
                  <div className="bg-black-800 border-l-2 border-brand-400 p-3 text-sm text-white-80 italic mt-2">
                    "{p.admin_note}"
                  </div>
                )}
                <div className="mt-3 text-xs text-white-60">
                  By <span className="text-white-100">{p.published_by || p.sharedByAdminId || 'Admin'}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SuperAdminShell>
  );
}