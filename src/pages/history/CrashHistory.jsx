import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { games as gamesApi } from '../../api';
import { Card, Badge, Button, SectionHeader, ProgressBar } from '../../components/ui/UIKit';
import { ChartBarIcon, FlameIcon, BellIcon, CrownIcon, TrendUpIcon, ClockIcon } from '../../components/icons';
import { tierColor, fmtTimeAgo } from '../../utils';
import { useStore } from '../../store';

export default function CrashHistory() {
  const user = useStore((s) => s.user);
  const [notifyHigh, setNotifyHigh] = useState(true);
  const [notifyExtreme, setNotifyExtreme] = useState(true);
  const [crashHistory, setCrashHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await gamesApi.history(50);
        if (!cancelled) {
          setCrashHistory(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('CrashHistory: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const last20 = crashHistory.slice(-20);
  const avg = crashHistory.length > 0 ? +(crashHistory.reduce((s, r) => s + r.crash_at,0) / crashHistory.length).toFixed(2) : 0;
  const max = crashHistory.length > 0 ? Math.max(...crashHistory.map((r) => r.crash_at)) : 0;
  const highCount = crashHistory.filter((r) => r.crash_at >= 10).length;
  const extremeCount = crashHistory.filter((r) => r.crash_at >= 20).length;
  const highRate = crashHistory.length > 0 ? ((highCount / crashHistory.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen">
      <div className="bg-black-900 border-b border-black-700 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link to="/app/games/aviator" className="text-white-60 text-xs hover:text-white-100">← AVIATOR</Link>
          <span className="text-white-60">·</span>
          <ChartBarIcon size={20} color="#00D4FF" />
          <h1 className="font-display text-2xl text-white-100" style={{ fontFamily: 'Outfit' }}>CRASH HISTORY</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">AVG MULTIPLIER (50)</div>
            <div className="font-mono text-3xl text-white-100 tabular-nums mt-1">{avg}x</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">HIGHEST</div>
            <div className="font-mono text-3xl text-amber-400 tabular-nums mt-1">{max.toFixed(2)}x</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">HIGH CRASH RATE</div>
            <div className="font-mono text-3xl text-crimson-400 tabular-nums mt-1">{highRate}%</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">EXTREMES (50)</div>
            <div className="font-mono text-3xl text-brand-400 tabular-nums mt-1">{extremeCount}</div>
          </Card>
        </div>

        {/* Last 20 chart */}
        <Card className="p-5">
          <SectionHeader kicker="Recent" title="Last 20 Rounds" action={<Badge variant="default">BAR CHART</Badge>} />
          <div className="w-full h-[300px]">
            <ResponsiveContainer>
              <BarChart data={last20} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis
                  dataKey="round_number"
                  tick={{ fill: '#888', fontSize: 10, fontFamily: 'Outfit' }}
                  axisLine={{ stroke: '#333' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#888', fontSize: 10, fontFamily: 'Outfit' }}
                  axisLine={{ stroke: '#333' }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}x`}
                />
                <Tooltip
                  contentStyle={{ background: '#15151E', border: '1px solid #2A2A35', color: '#fff' }}
                  formatter={(v) => [`${v}x`, 'Crashed at']}
                  labelFormatter={(l) => `Round #${l}`}
                />
                <Bar dataKey="crash_at" radius={[2, 2, 0, 0]}>
                  {last20.map((r, i) => (
                    <Cell key={i} fill={tierColor(r.tier).text} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insight */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <FlameIcon size={18} color="#E8003D" />
              <span className="text-[10px] caps text-crimson-400">AI INSIGHT</span>
            </div>
            <h3 className="font-display text-2xl text-white-100 mb-3" style={{ fontFamily: 'Outfit' }}>
              PATTERN READ
            </h3>
            <p className="text-white-80 text-sm mb-4 leading-relaxed">
              The last 20 rounds show {highCount >= 3 ? 'elevated volatility' : 'a steady tempo'} with average exit at <span className="font-mono text-white-100">{avg}x</span>.
              A high crash typically lands within {Math.round(50 / Math.max(highCount, 1))} rounds of the previous one.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white-80">Low (1.0–1.99x)</span>
                  <span className="text-white-100 font-mono">{crashHistory.filter((r) => r.crash_at < 2).length}</span>
                </div>
                <ProgressBar value={crashHistory.filter((r) => r.crash_at < 2).length} max={50} color="#888" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white-80">Medium (2–4.99x)</span>
                  <span className="text-white-100 font-mono">{crashHistory.filter((r) => r.crash_at >= 2 && r.crash_at < 5).length}</span>
                </div>
                <ProgressBar value={crashHistory.filter((r) => r.crash_at >= 2 && r.crash_at < 5).length} max={50} color="#00D4FF" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white-80">High (5–9.99x)</span>
                  <span className="text-white-100 font-mono">{crashHistory.filter((r) => r.crash_at >= 5 && r.crash_at < 10).length}</span>
                </div>
                <ProgressBar value={crashHistory.filter((r) => r.crash_at >= 5 && r.crash_at < 10).length} max={50} color="#FFB300" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white-80">Crash (10–19.99x)</span>
                  <span className="text-crimson-400 font-mono">{crashHistory.filter((r) => r.crash_at >= 10 && r.crash_at < 20).length}</span>
                </div>
                <ProgressBar value={crashHistory.filter((r) => r.crash_at >= 10 && r.crash_at < 20).length} max={50} color="#E8003D" />
              </div>
              <div>
               <div className="flex justify-between text-xs mb-1">
                   <span className="text-white-80">Extreme (20x+)</span>
                   <span className="text-brand-400 font-mono">{extremeCount}</span>
                 </div>
                 <ProgressBar value={extremeCount} max={50} color="#CCFF00" />
               </div>
             </div>
           </Card>

           {/* Notifications & VIP teaser */}
           <Card className="p-5 space-y-4">
             <div className="flex items-center gap-2 mb-1">
               <BellIcon size={18} color="#00D4FF" />
               <span className="text-[10px] caps text-electric-400">ALERTS</span>
             </div>
             <h3 className="font-display text-2xl text-white-100" style={{ fontFamily: 'Outfit' }}>NEVER MISS A BIG ONE</h3>

             <div className="space-y-2">
               <label className="flex items-center justify-between p-3 bg-black-800 border border-black-700 cursor-pointer">
                 <div>
                   <div className="text-white-100 text-sm font-semibold">High-crash alert</div>
                   <div className="text-white-60 text-xs">Notify when next 10x+ is queued</div>
                 </div>
                 <input
                   type="checkbox"
                   checked={notifyHigh}
                   onChange={(e) => setNotifyHigh(e.target.checked)}
                   className="w-5 h-5 accent-crimson-400"
                 />
               </label>
               <label className="flex items-center justify-between p-3 bg-black-800 border border-black-700 cursor-pointer">
                 <div>
                   <div className="text-white-100 text-sm font-semibold">Extreme crash alert</div>
                   <div className="text-white-60 text-xs">Notify when next 20x+ is queued</div>
                 </div>
                 <input
                   type="checkbox"
                   checked={notifyExtreme}
                   onChange={(e) => setNotifyExtreme(e.target.checked)}
                   className="w-5 h-5 accent-brand-600"
                 />
               </label>
             </div>

             <div className="pt-3 border-t border-black-700">
               <div className="flex items-center gap-2 mb-2">
                 <CrownIcon size={16} color="#FFB300" />
                 <span className="text-[10px] caps text-amber-400">VIP TIER PREVIEW</span>
               </div>
               <p className="text-xs text-white-60 mb-3">VIP members can view upcoming crash schedule.</p>
               {!user?.vip && (
                 <Link to="/app/vip">
                   <Button variant="primary" size="sm" className="w-full">
                     UNLOCK FULL SCHEDULE WITH VIP →
                   </Button>
                 </Link>
               )}
             </div>
           </Card>

          {/* Notifications & VIP teaser */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <BellIcon size={18} color="#00D4FF" />
              <span className="text-[10px] caps text-electric-400">ALERTS</span>
            </div>
            <h3 className="font-display text-2xl text-white-100" style={{ fontFamily: 'Outfit' }}>NEVER MISS A BIG ONE</h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 bg-black-800 border border-black-700 cursor-pointer">
                <div>
                  <div className="text-white-100 text-sm font-semibold">High-crash alert</div>
                  <div className="text-white-60 text-xs">Notify when next 10x+ is queued</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyHigh}
                  onChange={(e) => setNotifyHigh(e.target.checked)}
                  className="w-5 h-5 accent-crimson-400"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-black-800 border border-black-700 cursor-pointer">
                <div>
                  <div className="text-white-100 text-sm font-semibold">Extreme crash alert</div>
                  <div className="text-white-60 text-xs">Notify when next 20x+ is queued</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyExtreme}
                  onChange={(e) => setNotifyExtreme(e.target.checked)}
                  className="w-5 h-5 accent-brand-600"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-black-700">
              <div className="flex items-center gap-2 mb-2">
                <CrownIcon size={16} color="#FFB300" />
                <span className="text-[10px] caps text-amber-400">VIP TIER PREVIEW</span>
              </div>
              <div className="space-y-1 mb-3">
                {crashUpcoming.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-2 py-1.5 bg-black-800 border border-black-700 text-xs">
                    <span className="font-mono text-white-60">#{r.round_number}</span>
                    <Badge variant={r.tier.toLowerCase()} className="mx-2">{r.tier}</Badge>
                    <span className="text-white-100 font-mono tabular-nums">
                      {user?.vip ? `${r.crash_at.toFixed(2)}x` : '— — — x'}
                    </span>
                    <span className="text-white-60 font-mono text-[10px] ml-2">{r.eta_seconds}s</span>
                  </div>
                ))}
              </div>
              {!user?.vip && (
                <Link to="/app/vip">
                  <Button variant="primary" size="sm" className="w-full">
                    UNLOCK FULL SCHEDULE WITH VIP →
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>

        {/* Full history table */}
        <Card className="p-5">
          <SectionHeader kicker="Full log" title="All 50 rounds" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] caps text-white-60 border-b border-black-700">
                  <th className="text-left py-2 px-3">Round</th>
                  <th className="text-left py-2 px-3">Crash</th>
                  <th className="text-left py-2 px-3">Tier</th>
                  <th className="text-right py-2 px-3">Played</th>
                </tr>
              </thead>
              <tbody>
                {crashHistory.slice().reverse().map((r) => (
                  <tr key={r.round_number} className="border-b border-black-800 hover:bg-black-800/40">
                    <td className="py-2 px-3 font-mono text-white-60">#{r.round_number}</td>
                    <td className="py-2 px-3 font-mono tabular-nums text-white-100">{r.crash_at.toFixed(2)}x</td>
                    <td className="py-2 px-3">
                      <Badge variant={r.tier.toLowerCase()}>{r.tier}</Badge>
                    </td>
                    <td className="py-2 px-3 text-right text-white-60 text-xs"><ClockIcon size={10} className="inline mr-1" /> {fmtTimeAgo(r.played_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
