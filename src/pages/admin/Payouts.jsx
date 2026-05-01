import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { admin } from '../../api';
import { Card, Badge, Button, SectionHeader, Modal, Input } from '../../components/ui/UIKit';
import { WalletIcon, ClockIcon, CheckIcon, ShieldIcon, CalendarIcon } from '../../components/icons';
import { useStore } from '../../store';
import { fmtMoney, fmtTimeAgo } from '../../utils';
import AdminShell from './AdminShell';

export default function Payouts() {
  const [requests, setRequests]     = useState([]);
  const [open, setOpen]             = useState(false);
  const [requested, setRequested]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false); // from /api/admin/payout-window

  // ── KPI state (was `adminKpis` – now properly declared) ──────────────────
  const [kpis, setKpis] = useState({
    commission_7d:  0,
    pending_payout: 0,
    paid_this_month: 0,
  });

  const pushToast = useStore((s) => s.pushToast);

  // ── Date helpers ─────────────────────────────────────────────────────────
  const today       = new Date();
  const dayName     = today.toLocaleDateString('en-US', { weekday: 'long' });
  const daysToFriday = (5 - today.getDay() + 7) % 7 || 0;

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [payoutWindowRes, analyticsRes, historyRes] = await Promise.all([
          admin.payoutWindow(),       // { open: boolean }  (or { friday: boolean } – adjust key below)
          admin.analytics('7d'),      // { commission_7d, pending_payout, ... }
          admin.payoutHistory(0, 20), // PageResponse<PayoutRequest>
        ]);

        if (cancelled) return;

        // Payout window — API returns { open: true/false }
        // If your backend uses a different key (e.g. "friday"), change it here.
        setIsPayoutOpen(payoutWindowRes?.open ?? false);

        // KPIs
        setKpis({
          commission_7d:   analyticsRes?.commission_7d   ?? 0,
          pending_payout:  analyticsRes?.pending_payout  ?? 0,
          paid_this_month: analyticsRes?.paid_this_month ?? 0,
        });

        // History — handle both PageResponse<T> and plain array
        const rows = historyRes?.content ?? historyRes ?? [];
        setRequests(rows);

        // If the most recent request is still REQUESTED/APPROVED, lock the button
        if (rows.length > 0 && ['REQUESTED', 'APPROVED'].includes(rows[0].status)) {
          setRequested(true);
        }
      } catch (err) {
        console.error('Payouts: failed to load', err);
        pushToast({ variant: 'error', title: 'Load failed', message: err.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit payout request ─────────────────────────────────────────────────
  // The backend endpoint POST /api/admin/payout-request takes no body —
  // it calculates the amount server-side from the admin's earned commission.
  const submit = async () => {
    if (!isPayoutOpen) {
      pushToast({ variant: 'error', title: 'Window closed', message: 'Payout requests open Fridays only.' });
      return;
    }
    if (kpis.commission_7d <= 0) {
      pushToast({ variant: 'error', title: 'Nothing to request', message: 'You have no earned commission this week.' });
      return;
    }

    setSubmitting(true);
    try {
      const newRequest = await admin.requestPayout(); // POST /api/admin/payout-request

      // Optimistically prepend to history list
      setRequests((prev) => [newRequest, ...prev]);
      setRequested(true);
      setOpen(false);

      pushToast({
        variant: 'win',
        title: 'Payout requested',
        message: `${fmtMoney(newRequest.amount)} sent for super-admin approval`,
      });
    } catch (err) {
      pushToast({ variant: 'error', title: 'Request failed', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const windowOpen = isPayoutOpen; // use API result, not client-side day check
  const canRequest = windowOpen && !requested && kpis.commission_7d > 0;

  return (
    <AdminShell title="Request Payout" kicker="Admin · Commission">
      <div className="space-y-6">

        {/* ── Status hero ─────────────────────────────────────────────── */}
        <Card className={`p-6 border-2 ${windowOpen ? 'border-emerald-500' : 'border-amber-400'}`}>
          <div className="flex flex-wrap items-center gap-4">
            <div className={`w-14 h-14 flex items-center justify-center border ${
              windowOpen
                ? 'bg-emerald-500/20 border-emerald-500'
                : 'bg-amber-400/20  border-amber-400'
            }`}>
              <CalendarIcon size={28} color={windowOpen ? '#00E676' : '#FFB300'} />
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className={`text-[10px] caps ${windowOpen ? 'text-emerald-500' : 'text-amber-400'}`}>
                {windowOpen ? 'PAYOUT WINDOW OPEN' : 'PAYOUT WINDOW CLOSED'}
              </div>
              <h3 className="font-display text-3xl text-white-100" style={{ fontFamily: 'Outfit' }}>
                {windowOpen ? 'YOU CAN REQUEST PAYOUT TODAY' : 'BACK ON FRIDAY'}
              </h3>
              <p className="text-white-80 text-sm">
                {windowOpen
                  ? 'Submit before midnight for processing within 24 hours.'
                  : `Today is ${dayName}. Window opens in ${daysToFriday} day${daysToFriday !== 1 ? 's' : ''}.`}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setOpen(true)}
              disabled={!canRequest || loading}
            >
              {requested ? 'REQUESTED ✓' : 'REQUEST PAYOUT'}
            </Button>
          </div>
        </Card>

        {/* ── KPI cards ───────────────────────────────────────────────── */}
        <Card className="p-5">
          <SectionHeader kicker="Available now" title="Pending Commission" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-black-800 border border-black-700 p-4">
              <div className="text-[10px] caps text-white-60">EARNED THIS WEEK</div>
              <div className="font-mono text-3xl text-emerald-500 tabular-nums">
                {loading ? '—' : fmtMoney(kpis.commission_7d)}
              </div>
            </div>
            <div className="bg-black-800 border border-black-700 p-4">
              <div className="text-[10px] caps text-white-60">PENDING WITH SUPER-ADMIN</div>
              <div className="font-mono text-3xl text-amber-400 tabular-nums">
                {loading ? '—' : fmtMoney(kpis.pending_payout)}
              </div>
            </div>
            <div className="bg-black-800 border border-black-700 p-4">
              <div className="text-[10px] caps text-white-60">PAID THIS MONTH</div>
              <div className="font-mono text-3xl text-white-100 tabular-nums">
                {loading ? '—' : fmtMoney(kpis.paid_this_month)}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Payout history ──────────────────────────────────────────── */}
        <Card className="p-5">
          <SectionHeader kicker={`${requests.length} entries`} title="Payout History" />

          {loading ? (
            <p className="text-white-60 text-sm py-4 text-center">Loading…</p>
          ) : requests.length === 0 ? (
            <p className="text-white-60 text-sm py-4 text-center">No payout requests yet.</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-black-800 border border-black-700"
                >
                  {/* Status icon */}
                  <div className={`w-9 h-9 flex items-center justify-center border ${
                    r.status === 'PAID'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : r.status === 'APPROVED'
                      ? 'border-electric-400 bg-electric-400/10'
                      : r.status === 'REJECTED'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-amber-400 bg-amber-400/10'
                  }`}>
                    {r.status === 'PAID'
                      ? <CheckIcon size={14} color="#00E676" />
                      : <ClockIcon size={14} color={
                          r.status === 'APPROVED' ? '#00D4FF'
                          : r.status === 'REJECTED' ? '#FF5252'
                          : '#FFB300'
                        } />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white-100 text-sm font-semibold">
                      {/* Use period dates if present, otherwise fall back to creation date range */}
                      {r.periodStart
                        ? `${new Date(r.periodStart).toLocaleDateString()} – ${new Date(r.periodEnd).toLocaleDateString()}`
                        : 'This week'}
                    </div>
                    <div className="text-white-60 text-xs">
                      Requested {fmtTimeAgo(r.createdAt)}
                      {r.paidAt ? ` · Paid ${fmtTimeAgo(r.paidAt)}` : ''}
                      {r.rejectReason ? ` · Rejected: ${r.rejectReason}` : ''}
                    </div>
                  </div>

                  {/* Amount + badge */}
                  <div className="text-right">
                    <div className="font-mono text-lg text-white-100 tabular-nums">
                      {fmtMoney(r.amount)}
                    </div>
                    <Badge variant={
                      r.status === 'PAID'     ? 'win'     :
                      r.status === 'APPROVED' ? 'live'    :
                      r.status === 'REJECTED' ? 'error'   : 'default'
                    }>
                      {r.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Security note ───────────────────────────────────────────── */}
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <ShieldIcon size={20} color="#00D4FF" />
            <div>
              <div className="text-[10px] caps text-electric-400">SECURE PROCESSING</div>
              <div className="text-white-100 text-sm">
                All payouts reviewed by super-admin within 24h. Mobile money transfer to your registered number.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Confirm modal ─────────────────────────────────────────────── */}
      <Modal open={open} onClose={() => setOpen(false)} title="REQUEST PAYOUT">
        <div className="space-y-3">
          <div className="bg-black-800 border border-black-700 p-4 rounded">
            <div className="text-[10px] caps text-white-60 mb-1">AMOUNT TO REQUEST</div>
            <div className="font-mono text-3xl text-emerald-500 tabular-nums">
              {fmtMoney(kpis.commission_7d)}
            </div>
            <p className="text-white-60 text-xs mt-2">
              This is your full earned commission for the week. The backend calculates the final amount automatically.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? 'SUBMITTING…' : 'CONFIRM & SUBMIT'}
          </Button>
        </div>
      </Modal>
    </AdminShell>
  );
}