import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo, BoltMark } from './Logo';
import {
  HomeIcon,
  PulseIcon,
  BallIcon,
  RocketIcon,
  UserIcon,
  WalletIcon,
  CrownIcon,
  ReceiptIcon,
  TargetIcon,
  MenuIcon,
  CloseIcon,
  CrashWaveIcon,
  BellIcon,
  SearchIcon,
} from './icons';
import { useStore } from '../store';
import { fmtMoneyWithCode } from '../utils';
import { Badge } from './ui/UIKit';
import CurrencySelector from './CurrencySelector';
import { hoverLift, hoverGlow } from '../utils/animations';

// ----------------------- Theme Toggle -----------------------
const ThemeToggle = () => {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
      style={{
        background: isDark ? '#1e293b' : '#f1f5f9',
        border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
      }}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {isDark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ color: '#FBBF24' }}>
            <circle cx="12" cy="12" r="4" fill="#FBBF24" stroke="none" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.5" y1="4.5" x2="6.5" y2="6.5" />
            <line x1="17.5" y1="17.5" x2="19.5" y2="19.5" />
            <line x1="4.5" y1="19.5" x2="6.5" y2="17.5" />
            <line x1="17.5" y1="6.5" x2="19.5" y2="4.5" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#DC2626' }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#DC2626" />
          </svg>
        )}
      </motion.div>
    </button>
  );
};

// ----------------------- SpeedBet Logo -----------------------
const SpeedBetLogo = ({ isDark }) => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex-shrink-0">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="38" height="38" rx="10" fill={isDark ? '#DC2626' : '#B91C1C'} />
        <path
          d="M22 6L12 21h8l-4 11 14-17h-9l3-9z"
          fill="white"
          opacity="0.95"
        />
      </svg>
      <span
        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500"
        style={{ boxShadow: '0 0 0 2px ' + (isDark ? '#0a0a0f' : '#fff') }}
      />
    </div>

    <div className="hidden sm:flex flex-col leading-none">
      <div className="flex items-baseline gap-0">
        <span
          className="font-black text-[19px] tracking-tight"
          style={{
            color: isDark ? '#fff' : '#0f172a',
            fontFamily: "'Rajdhani', 'Barlow Condensed', sans-serif",
            letterSpacing: '-0.01em',
          }}
        >
          SPEED
        </span>
        <span
          className="font-black text-[19px] tracking-tight"
          style={{
            color: '#E8003D',
            fontFamily: "'Rajdhani', 'Barlow Condensed', sans-serif",
            letterSpacing: '-0.01em',
          }}
        >
          BET
        </span>
      </div>
      <span
        className="text-[7px] font-bold tracking-[0.22em] uppercase mt-0.5"
        style={{ color: isDark ? '#DC2626' : '#B91C1C', opacity: 0.9 }}
      >
        HIT DIFFERENT
      </span>
    </div>
  </div>
);

// ----------------------- Thin vertical divider -----------------------
const NavDivider = ({ isDark }) => (
  <div
    className="w-px h-5 shrink-0 mx-0.5"
    style={{ background: isDark ? '#1e293b' : '#e2e8f0' }}
  />
);

// ----------------------- Desktop TopBar -----------------------
export const TopBar = ({ onOpenMenu }) => {
  const navigate   = useNavigate();
  const user       = useStore((s) => s.user);
  const slip       = useStore((s) => s.slip);
  const toggleSlip = useStore((s) => s.toggleSlip);
  const wallet     = useStore((s) => s.wallet);
  const vipStatus  = useStore((s) => s.vipStatus);
  const theme      = useStore((s) => s.theme);
  const isDark     = theme === 'dark';

  // ✅ Auto-detect currency: wallet.currency (backend) → store.currency (set at registration) → fallback
  const storeCurrency = useStore((s) => s.currency);
  const currency = wallet?.currency ?? storeCurrency ?? 'GHS';

  const walletButtonRef = useRef(null);
  const slipButtonRef   = useRef(null);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (walletButtonRef.current) hoverLift(walletButtonRef.current);
    if (slipButtonRef.current)   hoverLift(slipButtonRef.current);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/sports?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur border-b transition-colors duration-300"
      style={{
        background: isDark ? 'rgba(10, 10, 15, 0.97)' : 'rgba(255, 255, 255, 0.97)',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
      }}
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 gap-4">

        {/* Left — logo + nav */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <SpeedBetLogo isDark={isDark} />
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            <TopNavLink to="/"           label="Home"   isDark={isDark} />
            <TopNavLink to="/app/sports" label="Sports" isDark={isDark} />
            <TopNavLink to="/app/live"   label="Live"   isDark={isDark} />
            <TopNavLink to="/app/games"  label="Games"  isDark={isDark} />
            <TopNavLink
              to="/app/vip"
              label="VIP"
              isDark={isDark}
              icon={<CrownIcon size={14} color="#FFB300" />}
            />
          </nav>
        </div>

        {/* Right — auth-responsive controls */}
        <div className="flex items-center gap-2">

          {/* Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="hidden sm:flex items-center justify-center p-2 rounded-md transition-colors"
            style={{
              background: isDark ? '#1e293b' : '#f1f5f9',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            }}
            aria-label="Search"
          >
            <SearchIcon size={18} color={isDark ? '#fff' : '#0f172a'} />
          </button>

          <ThemeToggle />

          {/* ✅ Upgraded CurrencySelector — reads & writes store.currency, auto-detected from registration */}
          <CurrencySelector />

          {user ? (
            /* ── Authenticated ── */
            <>
              <NavDivider isDark={isDark} />

              {/* Wallet balance — uses auto-detected currency */}
              <button
                ref={walletButtonRef}
                onClick={() => navigate('/app/wallet')}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                style={{
                  background: isDark ? '#1e293b' : '#f1f5f9',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                }}
              >
                <WalletIcon size={16} color="#00D4FF" />
                <span
                  className="font-mono text-sm font-bold tabular-nums"
                  style={{ color: isDark ? '#fff' : '#0f172a' }}
                >
                  {fmtMoneyWithCode(wallet?.balance ?? 0, currency)}
                </span>
              </button>

              {/* Bet slip */}
              <button
                ref={slipButtonRef}
                onClick={toggleSlip}
                className="relative bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <ReceiptIcon size={16} color="#fff" />
                <span className="hidden sm:inline">SLIP</span>
                {slip.length > 0 && (
                  <span className="ml-1 bg-white text-red-600 rounded-full text-[10px] w-5 h-5 inline-flex items-center justify-center font-bold">
                    {slip.length}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => navigate('/app/profile')}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                style={{
                  background: isDark ? '#1e293b' : '#f1f5f9',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                }}
              >
                <div className="relative">
                  <UserIcon size={16} color={isDark ? '#fff' : '#0f172a'} />
                  {vipStatus?.active && (
                    <CrownIcon
                      size={12}
                      color="#FFB300"
                      filled
                      className="absolute -top-2 -right-2"
                    />
                  )}
                </div>
                <span
                  className="text-sm font-semibold hidden lg:inline"
                  style={{ color: isDark ? '#fff' : '#0f172a' }}
                >
                  {user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()}
                </span>
              </button>
            </>
          ) : (
            /* ── Guest ── */
            <>
              <NavDivider isDark={isDark} />
              <button
                onClick={() => navigate('/auth/login')}
                className="text-sm font-semibold px-3 py-2 transition-colors"
                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = isDark ? '#fff' : '#0f172a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.7)' : '#475569')}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/auth/register')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-bold text-sm transition-colors"
              >
                Sign up
              </button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={onOpenMenu}
            className="lg:hidden p-2 rounded-md transition-colors"
            style={{
              background: isDark ? '#1e293b' : '#f1f5f9',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
            }}
            aria-label="Open menu"
          >
            <MenuIcon size={20} color={isDark ? '#fff' : '#0f172a'} />
          </button>
        </div>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-t"
            style={{
              background: isDark ? '#0a0a0f' : '#fff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
              <form onSubmit={handleSearch} className="relative">
                <SearchIcon
                  size={18}
                  color={isDark ? '#64748b' : '#94a3b8'}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search matches, teams, leagues..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2"
                  style={{
                    background: isDark ? '#1e293b' : '#f1f5f9',
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    color: isDark ? '#fff' : '#0f172a',
                    '--tw-ring-color': 'var(--brand)',
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold transition-colors hover:opacity-80"
                  style={{ color: 'var(--brand)' }}
                >
                  ESC
                </button>
              </form>
              <div className="mt-3 flex gap-2 text-xs">
                <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Quick links:</span>
                {['Live Matches', 'Premier League', 'Champions League', 'La Liga'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      handleSearch({ preventDefault: () => {}, currentTarget: null });
                    }}
                    className="px-2 py-1 rounded transition-colors hover:opacity-80"
                    style={{
                      background: isDark ? '#1e293b' : '#f1f5f9',
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const TopNavLink = ({ to, label, icon, isDark }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) => `relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md transition-colors`}
    style={({ isActive }) => ({
      color: isActive
        ? isDark ? '#fff' : '#0f172a'
        : isDark ? 'rgba(255,255,255,0.55)' : '#64748b',
      background: isActive
        ? isDark ? '#1e293b' : '#f1f5f9'
        : 'transparent',
    })}
  >
    {({ isActive }) => (
      <>
        {icon}
        {label}
        {isActive && (
          <motion.div
            layoutId="topnav-active"
            className="absolute bottom-0 left-3 right-3 h-0.5 bg-red-600 rounded-full"
          />
        )}
      </>
    )}
  </NavLink>
);

// ----------------------- Mobile Bottom Nav -----------------------
export const BottomNav = () => {
  const slip   = useStore((s) => s.slip);
  const theme  = useStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur border-t safe-bottom transition-colors duration-300"
      style={{
        background: isDark ? 'rgba(10,10,15,0.97)' : 'rgba(255,255,255,0.97)',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        <BottomItem to="/"           label="Home"   icon={HomeIcon}    isDark={isDark} />
        <BottomItem to="/app/live"   label="Live"   icon={PulseIcon}   isDark={isDark} />
        <BottomItem to="/app/sports" label="Sports" icon={BallIcon}    isDark={isDark} />
        <BottomItem to="/app/games"  label="Games"  icon={RocketIcon}  center isDark={isDark} />
        <BottomItem to="/app/bets"   label="Bets"   icon={ReceiptIcon} badge={slip.length} isDark={isDark} />
        <BottomItem to="/app/profile" label="Me"    icon={UserIcon}    isDark={isDark} />
      </div>
    </nav>
  );
};

const BottomItem = ({ to, label, icon: Icon, center, badge, isDark }) => (
  <NavLink
    to={to}
    end={to === '/'}
    className="flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[44px] min-h-[44px] relative"
  >
    {({ isActive }) => (
      <>
        <div className="relative">
          <Icon
            size={20}
            color={isActive ? '#E8003D' : isDark ? '#888' : '#94a3b8'}
          />
          {badge > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center">
              {badge}
            </span>
          )}
        </div>
        <span
          className="text-[9px] font-semibold uppercase tracking-wide"
          style={{ color: isActive ? '#E8003D' : isDark ? '#888' : '#94a3b8' }}
        >
          {label}
        </span>
        {isActive && (
          <motion.div
            layoutId="bottomnav-active"
            className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-red-600 rounded-b"
          />
        )}
      </>
    )}
  </NavLink>
);

// ----------------------- Mobile Drawer -----------------------
export const MobileDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const user   = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const theme  = useStore((s) => s.theme);
  const isDark = theme === 'dark';

  if (!open) return null;
  const go = (path) => { onClose(); navigate(path); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] backdrop-blur-sm lg:hidden"
      style={{ background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(15,23,42,0.5)' }}
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm p-5 overflow-y-auto border-l transition-colors duration-300"
        style={{
          background: isDark ? '#0a0a0f' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <SpeedBetLogo isDark={isDark} />
          <button onClick={onClose} className="p-2">
            <CloseIcon size={20} color={isDark ? '#fff' : '#0f172a'} />
          </button>
        </div>

        <div className="space-y-1">
          <DrawerLink onClick={() => go('/')}            label="Home"         icon={<HomeIcon    size={18} color={isDark ? '#fff' : '#0f172a'} />} isDark={isDark} />
          <DrawerLink onClick={() => go('/app/sports')}  label="Sports"       icon={<BallIcon    size={18} color={isDark ? '#fff' : '#0f172a'} />} isDark={isDark} />
          <DrawerLink onClick={() => go('/app/live')}    label="Live"         icon={<PulseIcon   size={18} color="#00E676" />}                     isDark={isDark} />
          <DrawerLink onClick={() => go('/app/games')}   label="Games"        icon={<RocketIcon  size={18} color="#E8003D" />}                     isDark={isDark} />
          <DrawerLink onClick={() => go('/app/vip')}     label="VIP"          icon={<CrownIcon   size={18} color="#FFB300" filled />}              isDark={isDark} />
          <DrawerLink onClick={() => go('/app/bets')}    label="My Bets"      icon={<ReceiptIcon size={18} color={isDark ? '#fff' : '#0f172a'} />} isDark={isDark} />
          <DrawerLink onClick={() => go('/app/wallet')}  label="Wallet"       icon={<WalletIcon  size={18} color={isDark ? '#fff' : '#0f172a'} />} isDark={isDark} />
          <DrawerLink onClick={() => go('/app/booking')} label="Booking Code" icon={<BellIcon    size={18} color={isDark ? '#fff' : '#0f172a'} />} isDark={isDark} />

          {user?.role === 'ADMIN' && (
            <>
              <div className="pt-4 pb-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: '#00D4FF' }}>Admin</div>
              <DrawerLink onClick={() => go('/admin')}               label="Dashboard"    isDark={isDark} />
              <DrawerLink onClick={() => go('/admin/predictions')}   label="Predictions"  isDark={isDark} />
              <DrawerLink onClick={() => go('/admin/crash-control')} label="Crash Control" isDark={isDark} />
              <DrawerLink onClick={() => go('/admin/booking-codes')} label="Booking Codes" isDark={isDark} />
              <DrawerLink onClick={() => go('/admin/games')}         label="Custom Games" isDark={isDark} />
              <DrawerLink onClick={() => go('/admin/payouts')}       label="Payouts"      isDark={isDark} />
            </>
          )}

          {user?.role === 'SUPER_ADMIN' && (
            <>
              <div className="pt-4 pb-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: '#E8003D' }}>Super Admin</div>
              <DrawerLink onClick={() => go('/x-control-9f3a2b')} label="Control Panel" isDark={isDark} />
            </>
          )}

          <div
            className="pt-6 mt-6 border-t space-y-1"
            style={{ borderColor: isDark ? '#1e293b' : '#e2e8f0' }}
          >
            {user ? (
              <>
                <DrawerLink onClick={() => go('/app/profile')}      label="Profile" icon={<UserIcon size={18} color={isDark ? '#fff' : '#0f172a'} />} isDark={isDark} />
                <DrawerLink onClick={() => { logout(); go('/'); }}  label="Logout"  isDark={isDark} />
              </>
            ) : (
              <>
                <DrawerLink onClick={() => go('/auth/login')}    label="Login"   isDark={isDark} />
                <DrawerLink onClick={() => go('/auth/register')} label="Sign up" isDark={isDark} />
              </>
            )}
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
};

const DrawerLink = ({ label, onClick, icon, isDark }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-md transition-colors"
    style={{ color: isDark ? '#fff' : '#0f172a' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#1e293b' : '#f1f5f9')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);