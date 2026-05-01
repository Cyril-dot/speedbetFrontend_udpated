import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdmin } from '../../api';
import { Card, Badge, Button, SectionHeader } from '../../components/ui/UIKit';
import {
  ShieldIcon,
  UserIcon,
  WalletIcon,
  CrownIcon,
  TrendUpIcon,
  CoinStackIcon,
  ReceiptIcon,
} from '../../components/icons';
import { fmtMoney } from '../../utils';
import SuperAdminShell from './SuperAdminShell';

export default function SuperAdminControl() {
  const [kpis, setKpis] = useState(null);
  const [allAdmins, setAllAdmins] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [kpisData, adminsData, payoutsData] = await Promise.all([
          superAdmin.metrics(),
          superAdmin.admins(),
          superAdmin.pendingPayouts(),
        ]);
        if (!cancelled) {
          setKpis(kpisData);
          setAllAdmins(adminsData);
          setPendingPayouts(payoutsData);
          setLoading(false);
        }
      } catch (err) {
        console.error('SuperAdminControl: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <SuperAdminShell title="CONTROL TOWER" kicker="SECURE · SUPER-ADMIN ZONE">
      <div className="space-y-8">
        <section>
          <SectionHeader kicker="Today" title="Live Snapshot" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="SIGNUPS TODAY" value={loading ? '...' : kpis?.total_signups_today || 0} icon={UserIcon} accent="#E8003D" />
            <Kpi label="DAU" value={loading ? '...' : kpis?.dau || 0} icon={UserIcon} accent="#00D4FF" />
            <Kpi label="STAKE TODAY" value={loading ? '...' : fmtMoney(kpis?.total_stake_today || 0)} icon={CoinStackIcon} accent="#FFB300" />
            <Kpi label="GROSS REVENUE" value={loading ? '...' : fmtMoney(kpis?.gross_revenue_today || 0)} icon={TrendUpIcon} accent="#00E676" />
            <Kpi label="COMMISSION (WEEK)" value={loading ? '...' : fmtMoney(kpis?.total_commission_paid_week || 0)} icon={WalletIcon} accent="#FFB300" />
            <Kpi label="ACTIVE ADMINS" value={loading ? '...' : kpis?.active_admins || allAdmins.length} icon={ShieldIcon} accent="#B388FF" />
            <Kpi label="ACTIVE VIPs" value={loading ? '...' : kpis?.active_vips || 0} icon={CrownIcon} accent="#FFB300" />
            <Kpi label="PENDING PAYOUTS" value={loading ? '...' : pendingPayouts.filter((p) => p.status === 'REQUESTED').length} icon={ReceiptIcon} accent="#E8003D" />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <Card className="p-5">
              <div className="text-center py-4 text-sm" style={{ color: 'var(--text-60)' }}>Loading...</div>
            </Card>
          ) : (
            <Card className="p-5">
              <SectionHeader
                kicker="Action needed"
                title="Pending Payouts"
                action={<Link to="/x-control-9f3a2b/payouts"><Button variant="ghost" size="sm">REVIEW →</Button></Link>}
              />
              <div className="space-y-2">
                {pendingPayouts.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-black-800 border border-black-700">
                    <div className="w-8 h-8 bg-amber-400/20 border border-amber-400 flex items-center justify-center font-display text-xs text-amber-400" style={{ fontFamily: 'Outfit' }}>
                      {(p.admin_name || 'A').split(' ').map((x) => x[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white-100 text-sm font-semibold">{p.admin_name || 'Admin'}</div>
                      <div className="text-white-60 text-xs">{p.period || 'This week'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-white-100 tabular-nums">{fmtMoney(p.amount || 0)}</div>
                      <Badge variant={p.status === 'REQUESTED' ? 'default' : 'win'}>{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {loading ? (
            <Card className="p-5">
              <div className="text-center py-4 text-sm" style={{ color: 'var(--text-60)' }}>Loading...</div>
            </Card>
          ) : (
            <Card className="p-5">
              <SectionHeader
                kicker="Performance"
                title="Top Admins"
                action={<Link to="/x-control-9f3a2b/admins"><Button variant="ghost" size="sm">ALL →</Button></Link>}
              />
              <div className="space-y-2">
                {allAdmins.slice(0, 4).map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-black-800 border border-black-700">
                    <span className="font-display text-2xl text-brand-400 w-8 text-center" style={{ fontFamily: 'Outfit' }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white-100 text-sm font-semibold">{a.name || 'Admin'}</div>
                      <div className="text-white-60 text-xs">{(a.referrals || 0)} referrals</div>
                    </div>
                    <div className="font-mono text-emerald-500 tabular-nums">{fmtMoney(a.commission_month || 0)}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card className="p-5">
          <SectionHeader kicker="System" title="Health" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Health label="API Latency" value="142ms" status="ok" />
            <Health label="Crash Engine" value="LIVE" status="ok" />
            <Health label="Payments Gateway" value="OK" status="ok" />
            <Health label="DB Replication" value="Lag 0.4s" status="ok" />
          </div>
        </Card>
      </div>
    </SuperAdminShell>
  );
}

function Kpi({ label, value, icon: Icon, accent }) {
  return (
    <Card className="p-4">
      <Icon size={16} color={accent} />
      <div className="text-[10px] caps text-white-60 mt-1">{label}</div>
      <div className="font-mono text-2xl text-white-100 tabular-nums">{value}</div>
    </Card>
  );
}

function Health({ label, value, status }) {
  const color = status === 'ok' ? '#00E676' : status === 'warn' ? '#FFB300' : '#FF1744';
  return (
    <div className="flex items-center gap-2 p-3 bg-black-800 border border-black-700">
      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] caps text-white-60">{label}</div>
        <div className="font-mono text-white-100 text-sm tabular-nums">{value}</div>
      </div>
    </div>
  );
}