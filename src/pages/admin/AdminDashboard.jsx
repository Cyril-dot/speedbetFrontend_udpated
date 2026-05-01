import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { admin } from '../../api';
import { Card, Badge, Button, SectionHeader } from '../../components/ui/UIKit';
import {
  ChartBarIcon,
  UserIcon,
  CoinStackIcon,
  WalletIcon,
  TargetIcon,
  CalendarIcon,
  RocketIcon,
  TrophyIcon,
  PlayIcon,
  CrownIcon,
  ShieldIcon,
  GiftIcon,
  ReceiptIcon,
  TrendUpIcon,
} from '../../components/icons';
import { useStore } from '../../store';
import { fmtMoney, fmtTimeAgo } from '../../utils';
import AdminShell from './AdminShell';

export default function AdminDashboard() {
  const user = useStore((s) => s.user);
  const [kpis, setKpis] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [referralLinks, setReferralLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [kpisData, referralsData, linksData] = await Promise.all([
          admin.analytics(),
          admin.referredUsers(),
          admin.referralLinks(),
        ]);
        if (!cancelled) {
          setKpis(kpisData);
          setReferrals(referralsData);
          setReferralLinks(linksData);
          setLoading(false);
        }
      } catch (err) {
        console.error('AdminDashboard: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminShell title="Control Center" kicker="Admin Portal">
      <div className="space-y-8">
        {/* KPIs */}
        <section>
          <SectionHeader kicker="Last 7 days" title="Performance" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Kpi label="New Signups" value={loading ? '...' : kpis?.new_signups_7d || 0} icon={UserIcon} color="#00D4FF" />
            <Kpi label="Active Users" value={loading ? '...' : kpis?.active_users_7d || 0} icon={UserIcon} color="#E8003D" />
            <Kpi label="Stake Volume" value={loading ? '...' : fmtMoney(kpis?.stake_volume_7d || 0)} icon={CoinStackIcon} color="#FFB300" />
            <Kpi label="Commission" value={loading ? '...' : fmtMoney(kpis?.commission_7d || 0)} icon={WalletIcon} color="#00E676" />
            <Kpi label="Pending Payout" value={loading ? '...' : fmtMoney(kpis?.pending_payout || 0)} icon={ReceiptIcon} color="#FFB300" />
            <Kpi label="Pred. Accuracy" value={loading ? '...' : `${Math.round((kpis?.prediction_accuracy || 0) * 100)}%`} icon={TargetIcon} color="#B388FF" />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <SectionHeader kicker="Tools" title="Quick Actions" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Tile to="/admin/links" icon={ShareIcon} label="Referral Links" sub="Generate & track" />
            <Tile to="/admin/users" icon={UserIcon} label="Referred Users" sub="Lifetime activity" />
            <Tile to="/admin/booking-codes" icon={CalendarIcon} label="Booking Codes" sub="Create & monitor" />
            <Tile to="/admin/crash-control" icon={RocketIcon} label="Crash Control" sub="Live monitor" highlight />
            <Tile to="/admin/games" icon={PlayIcon} label="Custom Games" sub="Create & disable" />
            <Tile to="/admin/payouts" icon={WalletIcon} label="Request Payout" sub="Friday only" />
            <Tile to="#" icon={CrownIcon} label="VIP Members" sub="Active subscribers" />
          </div>
        </section>

        {/* Recent referrals */}
        <section>
          <SectionHeader
            kicker="Latest"
            title="Recent Referrals"
            action={
              <Link to="/admin/users">
                <Button variant="ghost" size="sm">VIEW ALL →</Button>
              </Link>
            }
          />
          <Card className="p-0 overflow-hidden">
            {loading ? (
              <div className="p-4 text-center text-sm" style={{ color: 'var(--text-60)' }}>Loading referrals...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black-800 text-[10px] caps text-white-60">
                    <th className="text-left py-2 px-4">User</th>
                    <th className="text-left py-2 px-4">Joined</th>
                    <th className="text-right py-2 px-4">Lifetime Stake</th>
                    <th className="text-right py-2 px-4">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.slice(0, 5).map((r) => (
                    <tr key={r.id} className="border-t border-black-700">
                      <td className="py-3 px-4 text-white-100">{r.name}</td>
                      <td className="py-3 px-4 text-white-60 text-xs">{fmtTimeAgo(r.joinedAt || r.joined)}</td>
                      <td className="py-3 px-4 text-right font-mono text-white-100 tabular-nums">{fmtMoney(r.lifetimeStake || r.lifetime_stake || 0)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-500 tabular-nums">{fmtMoney(r.commission || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </section>

        {/* Active referral links */}
        <section>
          <SectionHeader kicker="Acquisition" title="Active Referral Links" />
          {loading ? (
            <div className="text-center text-sm" style={{ color: 'var(--text-60)' }}>Loading links...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {referralLinks.map((l) => (
                <Card key={l.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-white-100 font-bold">{l.code}</span>
                    <Badge variant={l.active ? 'win' : 'default'}>{l.active ? 'ACTIVE' : 'PAUSED'}</Badge>
                  </div>
                  <div className="text-white-60 text-xs">{l.label} · {l.commissionPercent || l.commission_percent}% commission</div>
                  <div className="text-electric-400 text-xs font-mono mt-1">speedbet.app/auth/register?ref={l.code}</div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function Kpi({ label, value, icon: Icon, color }) {
  return (
    <Card className="p-4">
      <Icon size={16} color={color} />
      <div className="text-[10px] caps text-white-60 mt-1">{label}</div>
      <div className="font-mono text-2xl text-white-100 tabular-nums">{value}</div>
    </Card>
  );
}

function Tile({ to, icon: Icon, label, sub, highlight = false }) {
  return (
    <Link to={to} className={`block p-4 border-2 transition-all ${highlight ? 'border-crimson-400 bg-crimson-400/10' : 'border-black-700 bg-black-900 hover:border-crimson-400'}`}>
      <Icon size={20} color="#E8003D" />
      <div className="font-display text-lg text-white-100 mt-2" style={{ fontFamily: 'Outfit' }}>{label.toUpperCase()}</div>
      <div className="text-white-60 text-xs">{sub}</div>
    </Link>
  );
}

// Local share icon since it's used here as well
function ShareIcon({ size = 16, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6z" stroke={color} strokeWidth="2" />
      <path d="M9 13l6 3M15 8l-6 3" stroke={color} strokeWidth="2" />
    </svg>
  );
}
