import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card, Badge, Button, SectionHeader, Input, Modal,
} from '../components/ui/UIKit';
import {
  UserIcon, CrownIcon, BellIcon, ShieldIcon, SettingsIcon,
  ReceiptIcon, WalletIcon, CalendarIcon, CloseIcon,
} from '../components/icons';
import { useStore } from '../store';
import { bets as betsApi, user as userApi } from '../api';
import { fmtMoney } from '../utils';

/* ─── animation presets ───────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const child = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── count-up hook ───────────────────────────────────────────────────── */
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

/* ─── bet tabs ────────────────────────────────────────────────────────── */
const BET_TABS = ['All', 'Won', 'Lost', 'Pending'];

/* ══════════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const user      = useStore((s) => s.user);
  const wallet    = useStore((s) => s.wallet);
  const vipStatus = useStore((s) => s.vipStatus);
  const bets      = useStore((s) => s.bets);
  const logout    = useStore((s) => s.logout);
  const pushToast = useStore((s) => s.pushToast);
  const fetchWallet    = useStore((s) => s.fetchWallet);
  const fetchVipStatus = useStore((s) => s.fetchVipStatus);

  const [activeTab, setActiveTab] = useState('All');

  // FIX: API returns firstName/lastName — not name
  const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';

  const [displayName, setDisplayName] = useState(fullName);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notifResults, setNotifResults] = useState(true);
  const [notifBets,    setNotifBets]    = useState(true);
  const [notifPromo,   setNotifPromo]   = useState(false);

  const [allBets, setAllBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(true);

  // Fetch wallet + vip if not yet loaded
  useEffect(() => {
    if (!wallet) fetchWallet();
    if (!vipStatus) fetchVipStatus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadBets() {
      try {
        const data = await betsApi.myBets();
        if (!cancelled) {
          setAllBets(data.content || data);
          setLoadingBets(false);
        }
      } catch (err) {
        console.error('Profile: failed to load bets', err);
        if (!cancelled) setLoadingBets(false);
      }
    }
    loadBets();
    return () => { cancelled = true; };
  }, []);

  const won     = allBets.filter((b) => b.status === 'WON').length;
  const lost    = allBets.filter((b) => b.status === 'LOST').length;
  const placed  = allBets.length;
  const winRate = placed > 0 ? Math.round((won / placed) * 100) : 0;
  const profit  = allBets.reduce((s, b) => s + (b.potentialReturn || 0) - (b.stake || 0), 0);

  const filteredBets = allBets.filter((b) =>
    activeTab === 'All' ? true : b.status === activeTab.toUpperCase()
  );

  // FIX: API returns isActive not active, expiresAt not expires_at
  const vipActive = vipStatus?.isActive ?? false;
  const vipExpiry = vipStatus?.expiresAt
    ? new Date(vipStatus.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const handleSaveProfile = async () => {
    try {
      const [firstName, ...rest] = displayName.trim().split(' ');
      await userApi.update({ firstName, lastName: rest.join(' ') || '', phone });
      pushToast({ variant: 'win', title: 'Profile updated!' });
    } catch (err) {
      pushToast({ variant: 'error', title: 'Update failed', message: err.message });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--surface-1)' }}>
        <div className="p-10 text-center max-w-sm rounded-2xl border"
          style={{ background: 'var(--surface-0)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--brand-bg)' }}>
            <UserIcon size={28} color="var(--brand)" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2 tracking-widest"
            style={{ fontFamily: 'Outfit', color: 'var(--text-100)' }}>NOT SIGNED IN</h2>
          <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>Sign in to access your profile and bets.</p>
          <Link to="/auth/login">
            <button className="w-full py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)' }}>
              SIGN IN
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // FIX: was user.name.split(...) — user has firstName/lastName, not name
  const initials = fullName
    ? fullName.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : (user.email?.[0] ?? '?').toUpperCase();

  // FIX: user.isVip not user.vip
  const isVip = user.isVip ?? false;

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-1)' }}>

      {/* ══ 1. HERO HEADER ════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-b"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 55% 90% at 75% -20%, rgba(220,38,38,0.07) 0%, transparent 65%), radial-gradient(ellipse 30% 50% at 0% 110%, rgba(220,38,38,0.04) 0%, transparent 60%)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(220,38,38,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
          <motion.div className="flex flex-wrap items-end gap-8" initial="initial" animate="animate" variants={stagger}>

            {/* avatar */}
            <motion.div variants={child} className="relative flex-shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center font-extrabold text-4xl text-white"
                style={{
                  fontFamily: 'Outfit',
                  background: 'var(--grad-primary)',
                  border: '3px solid var(--brand)',
                  boxShadow: '0 0 0 1px var(--brand-bg), 0 8px 40px var(--brand-glow)',
                }}>
                {initials}
              </div>
              {isVip && (
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 text-white font-bold"
                  style={{ background: 'var(--brand)', borderColor: '#FFFFFF' }}>★</div>
              )}
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
                style={{ background: '#22C55E', borderColor: '#FFFFFF' }} />
            </motion.div>

            {/* name */}
            <motion.div variants={child} className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold tracking-widest px-3 py-1 rounded-md"
                  style={{ background: 'var(--brand-bg)', border: '1px solid var(--brand)', color: 'var(--brand)', letterSpacing: '0.12em' }}>
                  {(user.role || 'USER').replace('_', ' ').toUpperCase()}
                </span>
                {isVip && (
                  <span className="text-xs font-bold tracking-widest px-3 py-1 rounded-md flex items-center gap-1"
                    style={{ background: 'var(--brand-bg)', border: '1px solid var(--brand)', color: 'var(--brand)', letterSpacing: '0.12em' }}>
                    <CrownIcon size={10} /> VIP MEMBER
                  </span>
                )}
              </div>
              {/* FIX: use fullName derived from firstName + lastName */}
              <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl leading-none mb-2"
                style={{ fontFamily: 'Outfit', letterSpacing: '-0.02em', color: 'var(--text-100)' }}>
                {fullName.toUpperCase() || user.email.toUpperCase()}
              </h1>
              <p className="text-xs tracking-widest" style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>
                ID: #{String(user.id || '').padStart(8, '0')} &nbsp;·&nbsp; {user.email}
              </p>
            </motion.div>

            {/* balance — FIX: wallet may still be loading */}
            <motion.div variants={child} className="flex flex-col items-end gap-1 pb-1 ml-auto">
              <span className="text-xs font-bold tracking-widest" style={{ color: '#9CA3AF', letterSpacing: '0.16em' }}>MAIN BALANCE</span>
              <div className="text-4xl md:text-5xl font-extrabold leading-none"
                style={{ fontFamily: 'Outfit', color: 'var(--brand)', letterSpacing: '-0.02em', textShadow: '0 0 40px var(--brand-glow)' }}>
                {wallet ? fmtMoney(wallet.balance ?? 0) : '—'}
              </div>
              <div className="text-xs" style={{ fontFamily: 'monospace', color: 'var(--brand-dark)' }}>
                + {fmtMoney(wallet?.bonus ?? 0)} bonus
              </div>
              <div className="flex gap-2 mt-3">
                <Link to="/app/wallet">
                  <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                    style={{ background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)' }}>
                    DEPOSIT
                  </button>
                </Link>
                <Link to="/app/wallet">
                  <button className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110 active:scale-95"
                    style={{ background: 'transparent', border: '1px solid var(--brand)', color: 'var(--brand)' }}>
                    WITHDRAW
                  </button>
                </Link>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* ══ PAGE BODY ═════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-10">

        {/* ── 2. STATS ──────────────────────────────────────────────────── */}
        <motion.section {...fadeUp(0.1)}>
          <SectionKicker kicker="OVERVIEW" title="Performance Stats" />
          <motion.div className="grid grid-cols-2 md:grid-cols-5 gap-3" initial="initial" animate="animate" variants={stagger}>
            {[
              { label: 'TOTAL BETS',  value: placed,  suffix: '',  color: 'var(--brand)',      bg: 'var(--brand-bg)',              icon: '◈', sub: 'all time' },
              { label: 'BETS WON',   value: won,     suffix: '',  color: '#16A34A',            bg: 'rgba(22,163,74,0.08)',         icon: '✓', sub: 'victories' },
              { label: 'BETS LOST',  value: lost,    suffix: '',  color: '#DC2626',            bg: 'rgba(220,38,38,0.08)',         icon: '✗', sub: 'losses' },
              { label: 'WIN RATE',   value: winRate, suffix: '%', color: 'var(--brand-dark)', bg: 'var(--brand-bg)',              icon: '◎', sub: 'accuracy' },
              { label: 'NET PROFIT', value: profit,  suffix: '',  color: profit >= 0 ? '#16A34A' : '#DC2626',
                bg: profit >= 0 ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                icon: profit >= 0 ? '↑' : '↓', sub: 'GHS', isMoney: true },
            ].map((s) => (
              <motion.div key={s.label} variants={child}>
                <StatCard {...s} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ── 3. ACTIVE BETS + VIP ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.section className="lg:col-span-2" {...fadeUp(0.18)}>
            <SectionKicker kicker="LIVE" title="Active Bets" />
            <div className="space-y-3">
              {allBets.filter((b) => b.status === 'PENDING').map((bet) => (
                <ActiveBetCard key={bet.id} bet={bet}
                  onCashout={() => pushToast({ variant: 'win', title: `Cashed out ${fmtMoney(bet.potentialReturn || 0)}` })}
                />
              ))}
              {allBets.filter((b) => b.status === 'PENDING').length === 0 && (
                <div className="text-center py-8 text-sm" style={{ color: '#9CA3AF' }}>No active bets.</div>
              )}
            </div>
          </motion.section>

          <motion.section {...fadeUp(0.22)}>
            <SectionKicker kicker="MEMBERSHIP" title="VIP Status" />
            {/* FIX: pass corrected vipActive flag */}
            <VipCard vipActive={vipActive} vipExpiry={vipExpiry} />
          </motion.section>
        </div>

        {/* ── 4. BET HISTORY ────────────────────────────────────────────── */}
        <motion.section {...fadeUp(0.24)}>
          <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
            <SectionKicker kicker="HISTORY" title="Bet History" noMargin />
            <Link to="/app/bets">
              <button className="text-xs font-bold tracking-widest" style={{ color: 'var(--brand)' }}>VIEW ALL →</button>
            </Link>
          </div>

          <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit"
            style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            {BET_TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200"
                style={activeTab === tab
                  ? { background: 'var(--brand)', color: '#fff', boxShadow: 'var(--shadow-glow)' }
                  : { background: 'transparent', color: 'var(--text-60)' }}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
                    {['Match', 'Market', 'Odds', 'Stake', 'Result', 'Profit'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold whitespace-nowrap"
                        style={{ color: '#9CA3AF', letterSpacing: '0.12em' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="wait">
                    {filteredBets.map((bet, i) => (
                      <motion.tr key={bet.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.04 } }} exit={{ opacity: 0 }}
                        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-0)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-0)'}>
                        <td className="px-5 py-4 text-sm font-bold" style={{ color: 'var(--text-100)', fontFamily: 'Outfit' }}>
                          {bet.selections?.[0]?.selection || 'Bet'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-2 py-1 rounded-md"
                            style={{ background: 'var(--brand-bg)', color: 'var(--brand)' }}>
                            {bet.selections?.[0]?.market || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--brand-dark)' }}>
                          {bet.totalOdds?.toFixed(2) || '—'}
                        </td>
                        <td className="px-5 py-4 text-sm font-mono" style={{ color: '#6B7280' }}>
                          {bet.currency} {bet.stake}
                        </td>
                        <td className="px-5 py-4"><ResultBadge result={bet.status} /></td>
                        <td className="px-5 py-4 text-sm font-mono font-bold"
                          style={{ color: bet.status === 'WON' ? '#16A34A' : bet.status === 'LOST' ? '#DC2626' : '#9CA3AF' }}>
                          {bet.status === 'WON'  ? `+ ${bet.currency} ${(bet.potentialReturn || 0).toFixed(2)}` :
                           bet.status === 'LOST' ? `- ${bet.currency} ${bet.stake}` : '—'}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {loadingBets ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: '#9CA3AF' }}>Loading bets...</td></tr>
                  ) : filteredBets.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: '#9CA3AF' }}>No bets found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* ── 5. ACCOUNT SETTINGS ───────────────────────────────────────── */}
        <motion.section {...fadeUp(0.28)}>
          <SectionKicker kicker="SETTINGS" title="Account Settings" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl p-6 space-y-4"
              style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-xs font-bold tracking-widest" style={{ color: '#9CA3AF', letterSpacing: '0.12em' }}>PERSONAL INFO</h3>
              <SettingsField label="Display Name"  value={displayName} onChange={setDisplayName} placeholder="Your name" />
              <SettingsField label="Email Address" value={email}       onChange={setEmail}       placeholder="you@example.com" type="email" />
              <SettingsField label="Phone Number"  value={phone}       onChange={setPhone}       placeholder="+233 ..." type="tel" />
              <button onClick={handleSaveProfile}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
                style={{ background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)' }}>
                SAVE CHANGES
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl p-6"
                style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-xs font-bold tracking-widest mb-4" style={{ color: '#9CA3AF', letterSpacing: '0.12em' }}>SECURITY</h3>
                <button onClick={() => pushToast({ variant: 'info', title: 'Password reset email sent' })}
                  className="w-full py-3 rounded-xl text-sm font-bold mb-3 transition-all duration-200 hover:brightness-110"
                  style={{ background: 'var(--brand-bg)', border: '1px solid var(--brand)', color: 'var(--brand-dark)' }}>
                  CHANGE PASSWORD
                </button>
                <button className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110"
                  style={{ background: 'var(--brand-bg)', border: '1px solid var(--brand)', color: 'var(--brand)' }}>
                  ENABLE 2FA
                </button>
              </div>

              <div className="rounded-xl p-6"
                style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-xs font-bold tracking-widest mb-4" style={{ color: '#9CA3AF', letterSpacing: '0.12em' }}>NOTIFICATIONS</h3>
                <div className="space-y-4">
                  <Toggle label="Bet results"     sub="Get notified when bets settle"  value={notifResults} onChange={setNotifResults} />
                  <Toggle label="Live bet alerts" sub="Updates on your active bets"     value={notifBets}    onChange={setNotifBets} />
                  <Toggle label="Promotions"      sub="Offers, bonuses & VIP deals"     value={notifPromo}   onChange={setNotifPromo} />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── 6. QUICK LINKS ────────────────────────────────────────────── */}
        <motion.section {...fadeUp(0.32)}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { to: '/app/wallet',  icon: WalletIcon,   label: 'Wallet',   sub: 'Deposits & withdrawals' },
              { to: '/app/bets',    icon: ReceiptIcon,  label: 'My Bets',  sub: 'Full history' },
              { to: '/app/booking', icon: CalendarIcon, label: 'Booking',  sub: 'Redeem codes' },
              { to: '#',            icon: BellIcon,     label: 'Alerts',   sub: 'Notifications' },
              { to: '#',            icon: ShieldIcon,   label: 'Security', sub: 'Password & 2FA' },
              { to: '/app/vip',     icon: CrownIcon,    label: 'VIP',      sub: 'Membership perks' },
            ].map((link) => (
              <Link key={link.label} to={link.to}
                className="block p-4 rounded-xl transition-all duration-200"
                style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-0)'; e.currentTarget.style.boxShadow = ''; }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'var(--brand-bg)' }}>
                  <link.icon size={16} color="var(--brand)" />
                </div>
                <div className="text-sm font-bold mb-0.5" style={{ fontFamily: 'Outfit', color: 'var(--text-100)', letterSpacing: '0.04em' }}>
                  {link.label.toUpperCase()}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-60)' }}>{link.sub}</div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* logout */}
        <motion.div className="flex justify-end" {...fadeUp(0.36)}>
          <button
            onClick={() => { logout(); pushToast({ variant: 'info', title: 'Signed out' }); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110"
            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626' }}>
            <CloseIcon size={13} /> LOG OUT
          </button>
        </motion.div>

      </div>
    </div>
  );
}

/* ── SUB-COMPONENTS ───────────────────────────────────────────────────── */

function SectionKicker({ kicker, title, noMargin }) {
  return (
    <div className={noMargin ? '' : 'mb-5'}>
      <p className="text-xs font-bold tracking-widest mb-1" style={{ color: '#9CA3AF', letterSpacing: '0.14em' }}>{kicker}</p>
      <h2 className="text-xl font-extrabold" style={{ fontFamily: 'Outfit', color: 'var(--text-100)' }}>{title}</h2>
    </div>
  );
}

function StatCard({ label, value, suffix, color, bg, icon, sub, isMoney }) {
  const count = useCountUp(Math.abs(value));
  const display = isMoney
    ? `${value >= 0 ? '+' : '-'} GHS ${count}`
    : `${count}${suffix}`;

  return (
    <div className="rounded-xl p-5 transition-all duration-200 cursor-default relative overflow-hidden"
      style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--brand)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: color }} />
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold mb-3" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#9CA3AF', letterSpacing: '0.12em' }}>{label}</div>
      <div className="text-2xl font-extrabold leading-none mb-1" style={{ fontFamily: 'Outfit', color }}>{display}</div>
      <div className="text-xs" style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>{sub}</div>
    </div>
  );
}

function ActiveBetCard({ bet, onCashout }) {
  return (
    <div className="rounded-xl p-5 relative overflow-hidden"
      style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, var(--brand), transparent)' }} />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
            <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--brand)', letterSpacing: '0.1em' }}>PENDING</span>
          </div>
          <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-100)', fontFamily: 'Outfit' }}>
            {bet.selections?.[0]?.selection || 'Bet'}
          </div>
          <div className="text-xs" style={{ color: '#9CA3AF' }}>
            {bet.selections?.[0]?.market || '—'}
          </div>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          {[
            ['ODDS',  bet.totalOdds?.toFixed(2) || '—', 'var(--brand-dark)'],
            ['STAKE', `${bet.currency} ${bet.stake}`,    'var(--text-60)'],
            ['TO WIN', `${bet.currency} ${(bet.potentialReturn || 0).toFixed(2)}`, 'var(--brand)'],
          ].map(([lbl, val, col]) => (
            <div key={lbl} className="text-center">
              <div className="text-xs font-bold tracking-widest mb-1" style={{ color: '#9CA3AF', letterSpacing: '0.1em' }}>{lbl}</div>
              <div className="font-bold text-sm" style={{ fontFamily: 'monospace', color: col }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// FIX: renamed vipStatus prop to vipActive (boolean) to match corrected field name
function VipCard({ vipActive, vipExpiry }) {
  return (
    <div className="rounded-xl p-6 flex flex-col relative overflow-hidden"
      style={{
        background: vipActive ? 'var(--surface-1)' : 'var(--surface-0)',
        border: `1px solid ${vipActive ? 'var(--brand)' : 'var(--border)'}`,
        boxShadow: vipActive ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
        minHeight: 240,
      }}>
      {vipActive && <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, var(--brand-glow) 0%, transparent 65%)' }} />}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{ background: vipActive ? 'linear-gradient(90deg, var(--brand), transparent)' : 'transparent' }} />

      <div className="flex items-center gap-2 mb-5 relative">
        <CrownIcon size={18} color={vipActive ? 'var(--brand)' : 'var(--text-60)'} />
        <span className="text-xs font-bold tracking-widest"
          style={{ color: vipActive ? 'var(--brand)' : 'var(--text-60)', letterSpacing: '0.14em' }}>
          VIP MEMBERSHIP
        </span>
      </div>

      <div className="font-extrabold text-3xl mb-1 relative"
        style={{ fontFamily: 'Outfit', color: vipActive ? 'var(--brand-dark)' : 'var(--text-100)' }}>
        {vipActive ? 'ACTIVE' : 'UPGRADE'}
      </div>
      {vipActive
        ? <div className="text-xs mb-1 relative" style={{ fontFamily: 'monospace', color: 'var(--text-60)' }}>Expires {vipExpiry}</div>
        : <div className="text-sm font-bold mb-1 relative" style={{ color: 'var(--text-60)' }}>GHS 250 / 30 days</div>}
      <div className="text-xs mb-6 relative" style={{ color: 'var(--text-60)' }}>Crash schedule · Cashback · Exclusive games</div>
      <Link to="/app/vip" className="mt-auto relative">
        <button className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:brightness-110"
          style={vipActive
            ? { background: 'var(--brand-bg)', border: '1px solid var(--brand)', color: 'var(--brand)' }
            : { background: 'var(--grad-primary)', color: '#fff', boxShadow: 'var(--shadow-glow)' }}>
          {vipActive ? 'MANAGE VIP' : 'JOIN VIP →'}
        </button>
      </Link>
    </div>
  );
}

function ResultBadge({ result }) {
  const map = {
    WON:       { bg: 'rgba(22,163,74,0.08)',  color: '#16A34A', border: 'rgba(22,163,74,0.25)' },
    LOST:      { bg: 'rgba(220,38,38,0.08)',  color: '#DC2626', border: 'rgba(220,38,38,0.25)' },
    PENDING:   { bg: 'var(--brand-bg)',       color: 'var(--brand)', border: 'var(--brand)' },
    VOID:      { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.3)' },
    CASHED_OUT:{ bg: 'rgba(234,179,8,0.08)',  color: '#ca8a04', border: 'rgba(234,179,8,0.25)' },
  };
  const s = map[result] || map.PENDING;
  return (
    <span className="inline-block px-3 py-1 rounded-md text-xs font-bold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: '0.08em' }}>
      {result}
    </span>
  );
}

function SettingsField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest mb-2"
        style={{ color: '#9CA3AF', letterSpacing: '0.1em' }}>
        {label.toUpperCase()}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-100)' }}
        onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; }} />
    </div>
  );
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium" style={{ color: 'var(--text-100)' }}>{label}</div>
        <div className="text-xs" style={{ color: '#9CA3AF' }}>{sub}</div>
      </div>
      <button onClick={() => onChange(!value)}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200"
        style={{ background: value ? 'var(--brand)' : 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
          style={{ left: value ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}