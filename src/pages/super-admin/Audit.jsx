import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, SectionHeader, Input } from '../../components/ui/UIKit';
import { ReceiptIcon, ShieldIcon, RocketIcon, WalletIcon, UserIcon, SearchIcon } from '../../components/icons';
import { fmtTimeAgo } from '../../utils';
import SuperAdminShell from './SuperAdminShell';

const auditLog = [
  { id: 'log-1', kind: 'CRASH_OVERRIDE', admin: 'Kwame Asante', detail: 'Round #10052 → 3.50x (was 1.20x)', at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'log-2', kind: 'PAYOUT_REQUEST', admin: 'Aba Mensah', detail: 'GHS 920 · Apr 14–20', at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'log-3', kind: 'PREDICTION_PUBLISH', admin: 'Kofi Addo', detail: 'Liverpool vs Man Utd · HOME · 78% conf', at: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 'log-4', kind: 'BOOKING_CODE', admin: 'Kwame Asante', detail: 'Created code SPD7K3XQ (MIXED · 12.4x)', at: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 'log-5', kind: 'CRASH_SCHEDULE', admin: 'System', detail: 'Generated 20 new rounds', at: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: 'log-6', kind: 'ADMIN_CREATED', admin: 'Super-admin', detail: 'Akosua Boateng (akosua@sb)', at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'log-7', kind: 'PAYOUT_APPROVED', admin: 'Super-admin', detail: 'Kofi Addo · GHS 780 · Apr 7–13', at: new Date(Date.now() - 1.2 * 86400000).toISOString() },
  { id: 'log-8', kind: 'CRASH_OVERRIDE', admin: 'Aba Mensah', detail: 'Round #10048 → 8.20x (was 12.5x)', at: new Date(Date.now() - 1.5 * 86400000).toISOString() },
  { id: 'log-9', kind: 'CONFIG_CHANGE', admin: 'Super-admin', detail: 'min_deposit changed: 200 → 300', at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'log-10', kind: 'VIP_GIFT', admin: 'System', detail: 'Issued 64 weekly gifts', at: new Date(Date.now() - 3 * 86400000).toISOString() },
];

const KIND_META = {
  CRASH_OVERRIDE: { label: 'Crash Override', color: '#E8003D', icon: RocketIcon },
  CRASH_SCHEDULE: { label: 'Schedule Generated', color: '#FFB300', icon: RocketIcon },
  PAYOUT_REQUEST: { label: 'Payout Requested', color: '#FFB300', icon: WalletIcon },
  PAYOUT_APPROVED: { label: 'Payout Approved', color: '#00E676', icon: WalletIcon },
  PREDICTION_PUBLISH: { label: 'Prediction Published', color: '#00D4FF', icon: ReceiptIcon },
  BOOKING_CODE: { label: 'Booking Code', color: '#B388FF', icon: ReceiptIcon },
  ADMIN_CREATED: { label: 'Admin Created', color: '#00D4FF', icon: UserIcon },
  CONFIG_CHANGE: { label: 'Config Changed', color: '#FF1744', icon: ShieldIcon },
  VIP_GIFT: { label: 'VIP Gift Issued', color: '#FFB300', icon: ReceiptIcon },
};

export default function SuperAdminAudit() {
  const [filter, setFilter] = useState('ALL');
  const [q, setQ] = useState('');

  const kinds = Array.from(new Set(auditLog.map((l) => l.kind)));
  const filtered = auditLog.filter((l) => {
    if (filter !== 'ALL' && l.kind !== filter) return false;
    if (q && !`${l.admin} ${l.detail}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <SuperAdminShell title="AUDIT LOG">
      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-black-800 border border-black-700 px-3 py-2">
              <SearchIcon size={14} color="#888" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search log…"
                className="flex-1 bg-transparent text-white-100 text-sm outline-none placeholder-white-60"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-black-800 border border-black-700 text-white-100 text-sm px-3 py-2"
            >
              <option value="ALL">All Kinds</option>
              {kinds.map((k) => <option key={k} value={k}>{KIND_META[k]?.label || k}</option>)}
            </select>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <SectionHeader kicker={`${filtered.length} entries`} title="Recent Activity" />
          <div className="divide-y divide-black-700">
            {filtered.map((l, i) => {
              const meta = KIND_META[l.kind] || { label: l.kind, color: '#888', icon: ReceiptIcon };
              const Icon = meta.icon;
              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 p-4 hover:bg-black-800/40"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-black-800 border" style={{ borderColor: meta.color + '55' }}>
                    <Icon size={14} color={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default">{meta.label}</Badge>
                      <span className="text-white-60 text-xs">by <span className="text-white-100">{l.admin}</span></span>
                      <span className="text-white-60 text-xs">· {fmtTimeAgo(l.at)}</span>
                    </div>
                    <div className="text-white-100 text-sm mt-1">{l.detail}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>
    </SuperAdminShell>
  );
}
