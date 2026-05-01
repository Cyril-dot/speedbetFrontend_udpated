import { useState, useEffect } from 'react';
import { admin } from '../../api';
import { Card, Badge, SectionHeader, EmptyState, Input } from '../../components/ui/UIKit';
import { UserIcon, SearchIcon } from '../../components/icons';
import { fmtMoney, fmtTimeAgo } from '../../utils';
import AdminShell from './AdminShell';

export default function ReferredUsers() {
  const [q, setQ] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await admin.referredUsers();
        if (!cancelled) {
          setReferrals(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('ReferredUsers: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = referrals.filter((r) => r.name?.toLowerCase().includes(q.toLowerCase()));
  const totalStake = referrals.reduce((s, r) => s + (r.lifetimeStake || r.lifetime_stake || 0), 0);
  const totalCommission = referrals.reduce((s, r) => s + (r.lifetimeCommission || r.commission || 0), 0);

  return (
    <AdminShell title="Referred Users" kicker="Admin · Users">
      <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4">
              <div className="text-[10px] caps text-white-60">TOTAL USERS</div>
              <div className="font-mono text-3xl text-white-100 tabular-nums">{loading ? '...' : referrals.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-[10px] caps text-white-60">LIFETIME STAKE</div>
              <div className="font-mono text-3xl text-white-100 tabular-nums">{fmtMoney(totalStake)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-[10px] caps text-white-60">TOTAL COMMISSION</div>
              <div className="font-mono text-3xl text-emerald-500 tabular-nums">{fmtMoney(totalCommission)}</div>
            </Card>
          </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-black-700 flex items-center gap-3">
            <SearchIcon size={14} color="#888" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users…"
              className="flex-1 bg-transparent text-white-100 text-sm outline-none placeholder-white-60"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No users found" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black-800 text-[10px] caps text-white-60">
                  <th className="text-left py-2 px-4">User</th>
                  <th className="text-left py-2 px-4">Joined</th>
                  <th className="text-right py-2 px-4">Lifetime Stake</th>
                  <th className="text-right py-2 px-4">Your Commission</th>
                  <th className="text-center py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-black-700 hover:bg-black-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-crimson-400 flex items-center justify-center font-display text-sm text-white-100" style={{ fontFamily: 'Outfit' }}>
                          {r.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-white-100">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white-60 text-xs">{fmtTimeAgo(r.joined)}</td>
                    <td className="py-3 px-4 text-right font-mono text-white-100 tabular-nums">{fmtMoney(r.lifetime_stake)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-500 tabular-nums">{fmtMoney(r.commission)}</td>
                    <td className="py-3 px-4 text-center"><Badge variant="win">ACTIVE</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
