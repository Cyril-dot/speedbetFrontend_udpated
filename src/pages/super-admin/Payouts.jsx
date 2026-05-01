import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { superAdmin } from '../../api';
import { Card, Badge, Button, SectionHeader, EmptyState } from '../../components/ui/UIKit';
import { CheckIcon, CloseIcon, WalletIcon } from '../../components/icons';
import { useStore } from '../../store';
import { fmtMoney } from '../../utils';
import SuperAdminShell from './SuperAdminShell';

export default function SuperAdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await superAdmin.pendingPayouts();
        if (!cancelled) {
          setPayouts(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('SuperAdminPayouts: failed to load', err);
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  const pushToast = useStore((s) => s.pushToast);

  const approve = (id) => {
    setPayouts(payouts.map((p) => p.id === id ? { ...p, status: 'APPROVED' } : p));
    pushToast({ variant: 'win', title: 'Payout approved', message: 'Funds will release within 24h.' });
  };
  const reject = (id) => {
    setPayouts(payouts.filter((p) => p.id !== id));
    pushToast({ variant: 'info', title: 'Payout rejected' });
  };
  const markPaid = (id) => {
    setPayouts(payouts.map((p) => p.id === id ? { ...p, status: 'PAID' } : p));
    pushToast({ variant: 'win', title: 'Marked as paid' });
  };

  const requested = payouts.filter((p) => p.status === 'REQUESTED');
  const approved = payouts.filter((p) => p.status === 'APPROVED');
  const paid = payouts.filter((p) => p.status === 'PAID');

  const totalPending = requested.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <SuperAdminShell title="PAYOUT APPROVALS">
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">PENDING APPROVAL</div>
            <div className="font-mono text-3xl text-amber-400 tabular-nums">{loading ? '...' : requested.length}</div>
            <div className="text-white-60 text-xs">{loading ? '...' : fmtMoney(totalPending)} total</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">APPROVED · UNPAID</div>
            <div className="font-mono text-3xl text-electric-400 tabular-nums">{loading ? '...' : approved.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60">PAID THIS WEEK</div>
            <div className="font-mono text-3xl text-emerald-500 tabular-nums">{loading ? '...' : paid.length}</div>
          </Card>
        </div>

        <section>
          <SectionHeader kicker={loading ? '...' : `${requested.length} requests`} title="Pending Approval" />
          {loading ? (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-60)' }}>Loading payouts...</div>
          ) : requested.length === 0 ? (
            <EmptyState title="No pending requests" subtitle="All caught up." />
          ) : (
            <div className="space-y-2">
              {requested.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="p-4 border-amber-400">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-12 h-12 bg-amber-400/20 border border-amber-400 flex items-center justify-center font-display text-lg text-amber-400" style={{ fontFamily: 'Outfit' }}>
                        {(p.admin_name || 'A').split(' ').map((x) => x[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <div className="text-white-100 font-semibold">{p.admin_name || 'Admin'}</div>
                        <div className="text-white-60 text-xs">{(p.period || '') + ' · ready to send'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-2xl text-white-100 tabular-nums">{fmtMoney(p.amount || 0)}</div>
                        <Badge variant="live">APPROVED</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={() => approve(p.id)}><CheckIcon size={12} /> APPROVE</Button>
                        <Button variant="outline" size="sm" onClick={() => reject(p.id)}><CloseIcon size={12} /> REJECT</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {approved.length > 0 && (
          <section>
            <SectionHeader kicker={`${approved.length} approved`} title="Awaiting Disbursement" />
            <div className="space-y-2">
              {approved.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="live">APPROVED</Badge>
                    <div className="flex-1 min-w-[180px]">
                      <div className="text-white-100 font-semibold">{p.admin_name}</div>
                      <div className="text-white-60 text-xs">{p.period} · ready to send</div>
                    </div>
                    <div className="font-mono text-xl text-electric-400 tabular-nums">{fmtMoney(p.amount)}</div>
                    <Button variant="primary" size="sm" onClick={() => markPaid(p.id)}><WalletIcon size={12} /> MARK PAID</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {paid.length > 0 && (
          <section>
            <SectionHeader kicker={`${paid.length} this week`} title="Paid" />
            <div className="space-y-2">
              {paid.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-black-800 border border-black-700">
                  <Badge variant="win"><CheckIcon size={10} /> PAID</Badge>
                  <div className="flex-1 text-white-80 text-sm">{p.admin_name} · {p.period}</div>
                  <div className="font-mono text-emerald-500 tabular-nums">{fmtMoney(p.amount)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </SuperAdminShell>
  );
}
