import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, SectionHeader, Modal, ProgressBar } from '../../components/ui/UIKit';
import { CrownIcon, TrophyIcon, RocketIcon, GiftIcon, FlameIcon, ChartBarIcon, BellIcon, PlayIcon, ShieldIcon } from '../../components/icons';
import { useStore } from '../../store';
import { vip, config as configApi } from '../../api';
import { fmtMoney, fmtTimeAgo } from '../../utils';

export default function VipHub() {
  const user = useStore((s) => s.user);
  const wallet = useStore((s) => s.wallet);
  const vipStatus = useStore((s) => s.vipStatus);
  const subscribeVip = useStore((s) => s.subscribeVip);
  const pushToast = useStore((s) => s.pushToast);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [vipGifts, setVipGifts] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // FIX: only call vip.gifts() if user is logged in — it's an auth endpoint
        // configApi.get() is public, always safe to call
        if (user) {
          const [giftsData, configData] = await Promise.all([vip.gifts(), configApi.get()]);
          if (!cancelled) { setVipGifts(giftsData); setConfig(configData); }
        } else {
          const configData = await configApi.get();
          if (!cancelled) setConfig(configData);
        }
      } catch (err) {
        console.error('VipHub: failed to load', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]); // re-run if user logs in

  const isVip = user?.isVip || vipStatus?.isActive;
  const daysLeft = vipStatus?.expiresAt
    ? Math.max(0, Math.ceil((new Date(vipStatus.expiresAt) - Date.now()) / 86400000))
    : 0;
  const totalDays = config?.vipDays || config?.vip_days || 30;
  const dayElapsed = totalDays - daysLeft;

  const subscribe = () => {
    if (!user) {
      pushToast({ variant: 'error', title: 'Sign in to subscribe' });
      return;
    }
    const vipPrice = config?.vipPrice || config?.vip_price || 250;
    if ((wallet?.balance ?? 0) < vipPrice) {
      pushToast({ variant: 'error', title: 'Insufficient balance', message: `Top up to GHS ${vipPrice} first.` });
      return;
    }
    subscribeVip();
    setConfirmOpen(false);
    pushToast({ variant: 'win', title: 'Welcome to VIP', message: 'All features unlocked for 30 days.' });
  };

  if (isVip) {
    return (
      <VipMember
        vipStatus={vipStatus}
        daysLeft={daysLeft}
        totalDays={totalDays}
        dayElapsed={dayElapsed}
        vipGifts={vipGifts}
        loading={loading}
      />
    );
  }

  return (
    <VipLanding
      onSubscribe={() => setConfirmOpen(true)}
      confirmOpen={confirmOpen}
      setConfirmOpen={setConfirmOpen}
      subscribe={subscribe}
      wallet={wallet}
      loading={loading}
      config={config}
    />
  );
}

function VipLanding({ onSubscribe, confirmOpen, setConfirmOpen, subscribe, wallet, loading, config }) {
  const vipPrice = config?.vipPrice || config?.vip_price || 250;

  return (
    <div className="min-h-screen">
      {/* Hero removed as requested */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-10">

        <section>
          <SectionHeader kicker="What you unlock" title="VIP Benefits" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Benefit icon={RocketIcon} accent="#E8003D" title="CRASH SCHEDULE" desc="See the next 5 crash multipliers before they happen. AI-generated, server-locked." />
            <Benefit icon={GiftIcon} accent="#FFB300" title="WEEKLY CASHBACK" desc="5% back on every losing slip, deposited every Monday." />
            <Benefit icon={PlayIcon} accent="#00D4FF" title="LIVE STREAMS" desc="HD streams of every premier match. No pop-ups, no buffering." />
            <Benefit icon={TrophyIcon} accent="#FFB300" title="MONTHLY GIVEAWAY" desc="Spin the VIP wheel — guaranteed prize from GHS 100 to GHS 5,000." />
            <Benefit icon={FlameIcon} accent="#E8003D" title="FREE BETS & BOOSTS" desc="Two free bets and boosted-odds offers each cycle." />
            <Benefit icon={ShieldIcon} accent="#00D4FF" title="PRIORITY SUPPORT" desc="Direct WhatsApp line. Withdrawals processed first." />
          </div>
        </section>

        <Card className="p-8 border-2 border-amber-400 bg-gradient-to-br from-amber-400/10 to-black-900">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] caps text-amber-400 mb-1">PRICING</div>
              <div className="font-display text-5xl text-white-100 leading-none" style={{ fontFamily: 'Outfit' }}>
                GHS {loading ? '...' : vipPrice}
              </div>
              <div className="text-white-80 text-sm">for 30 days · auto-renews · cancel anytime</div>
            </div>
            <Button variant="primary" size="lg" className="w-full md:w-auto" onClick={onSubscribe}>
              SUBSCRIBE NOW
            </Button>
          </div>
        </Card>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="CONFIRM VIP SUBSCRIPTION">
        <div className="space-y-4">
          <div className="bg-black-800 border border-black-700 p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white-60">VIP membership (30 days)</span>
              <span className="font-mono text-white-100">{loading ? '...' : fmtMoney(vipPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-black-700 pt-2">
              <span className="text-white-60">From wallet (balance: {fmtMoney(wallet?.balance ?? 0)})</span>
              <span className="font-mono text-crimson-400 font-bold">{loading ? '...' : fmtMoney(vipPrice)}</span>
            </div>
          </div>
          <Button variant="primary" size="lg" className="w-full" onClick={subscribe}>
            CONFIRM PAYMENT
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Benefit({ icon: Icon, accent, title, desc }) {
  return (
    <Card className="p-5 hover:border-crimson-400 transition-all">
      <Icon size={24} color={accent} />
      <h4 className="font-display text-2xl text-white-100 mt-3 mb-1" style={{ fontFamily: 'Outfit' }}>{title}</h4>
      <p className="text-white-80 text-sm">{desc}</p>
    </Card>
  );
}

function VipMember({ vipStatus, daysLeft, totalDays, dayElapsed, vipGifts, loading }) {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-amber-400/15 to-black-950 border-b border-black-700 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <CrownIcon size={48} color="#FFB300" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] caps text-amber-400 mb-1">VIP MEMBER · ACTIVE</div>
            <h1 className="font-display text-3xl md:text-5xl text-white-100 leading-none" style={{ fontFamily: 'Outfit' }}>
              VIP DASHBOARD
            </h1>
          </div>
          <div className="text-right">
            <div className="text-[10px] caps text-white-60">DAYS LEFT</div>
            <div className="font-mono text-3xl text-amber-400 tabular-nums">{daysLeft}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        <Card className="p-5">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white-80">Membership cycle</span>
            <span className="text-white-100 font-mono">Day {dayElapsed} / {totalDays}</span>
          </div>
          <ProgressBar value={dayElapsed} max={totalDays} color="#FFB300" />
          <div className="text-white-60 text-xs mt-2">
            {vipStatus?.expiresAt
              ? `Renews on ${new Date(vipStatus.expiresAt).toLocaleDateString()} · Auto-renew ${vipStatus.autoRenew ? 'ON' : 'OFF'}`
              : '...'}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <SectionHeader kicker="Available now" title="Active Gifts" />
            {loading ? (
              <p className="text-white-60 text-sm">Loading gifts...</p>
            ) : vipGifts.length === 0 ? (
              <p className="text-white-60 text-sm">No active gifts. Check back next week.</p>
            ) : (
              <div className="space-y-2">
                {vipGifts.map((g) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 bg-black-800 border border-black-700"
                  >
                    <GiftIcon size={20} color="#FFB300" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white-100 text-sm font-semibold">
                        {g.kind === 'FREE_BET'
                          ? `Free Bet · ${fmtMoney(g.payload?.amount)}`
                          : `${g.payload?.boost_pct || g.payload?.boostPct}% Boosted Odds`}
                      </div>
                      <div className="text-white-60 text-xs">
                        Expires {fmtTimeAgo(g.expiresAt)} · Issued {fmtTimeAgo(g.issuedAt)}
                      </div>
                    </div>
                    <Button size="sm">USE</Button>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <SectionHeader kicker="VIP shortcuts" title="Quick Access" />
            <div className="space-y-2">
              <a href="/app/games/aviator/history" className="block p-3 bg-black-800 border border-black-700 hover:border-crimson-400">
                <div className="flex items-center gap-2">
                  <ChartBarIcon size={14} color="#E8003D" />
                  <span className="text-white-100 text-sm font-semibold">Crash Schedule</span>
                </div>
                <div className="text-white-60 text-xs">See next 5 crash points</div>
              </a>
              <button className="w-full text-left p-3 bg-black-800 border border-black-700 hover:border-crimson-400">
                <div className="flex items-center gap-2">
                  <BellIcon size={14} color="#00D4FF" />
                  <span className="text-white-100 text-sm font-semibold">Live Streams</span>
                </div>
                <div className="text-white-60 text-xs">12 matches streaming now</div>
              </button>
              <button className="w-full text-left p-3 bg-black-800 border border-black-700 hover:border-crimson-400">
                <div className="flex items-center gap-2">
                  <TrophyIcon size={14} color="#FFB300" />
                  <span className="text-white-100 text-sm font-semibold">Monthly Spin</span>
                </div>
                <div className="text-white-60 text-xs">Available in 6 days</div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}