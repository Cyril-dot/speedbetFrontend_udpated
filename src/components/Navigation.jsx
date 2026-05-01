import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  BellIcon,
  SearchIcon,
} from './icons';
import { useStore } from '../store';
import { fmtMoneyWithCode } from '../utils';
import CurrencySelector from './CurrencySelector';
import { hoverLift } from '../utils/animations';

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

const ThemeToggle = () => {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: 36, height: 36, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isDark ? '#1e293b' : '#f1f5f9',
        border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
        cursor: 'pointer', flexShrink: 0,
        transition: 'transform 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {isDark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ color: '#FBBF24' }}>
            <circle cx="12" cy="12" r="4" fill="#FBBF24" stroke="none" />
            <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.5" y1="4.5" x2="6.5" y2="6.5" /><line x1="17.5" y1="17.5" x2="19.5" y2="19.5" />
            <line x1="4.5" y1="19.5" x2="6.5" y2="17.5" /><line x1="17.5" y1="6.5" x2="19.5" y2="4.5" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#DC2626' }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#DC2626" />
          </svg>
        )}
      </motion.div>
    </button>
  );
};

// ─── Logo ─────────────────────────────────────────────────────────────────────

const SpeedBetLogo = ({ isDark }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
    {/* Icon */}
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <svg width="36" height="36" viewBox="0 0 38 38" fill="none">
        <rect width="38" height="38" rx="10" fill={isDark ? '#DC2626' : '#B91C1C'} />
        <path d="M22 6L12 21h8l-4 11 14-17h-9l3-9z" fill="white" opacity="0.95" />
      </svg>
      <span
        style={{
          position: 'absolute', top: -3, right: -3,
          width: 10, height: 10, borderRadius: '50%', background: '#E8003D',
          boxShadow: `0 0 0 2px ${isDark ? '#0a0a0f' : '#fff'}`,
        }}
      />
    </div>
    {/* Wordmark — hidden on very small screens, shown from sm */}
    <div className="hidden sm:flex flex-col leading-none">
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span style={{ fontFamily: "'Rajdhani','Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: '-0.01em', color: isDark ? '#fff' : '#0f172a' }}>SPEED</span>
        <span style={{ fontFamily: "'Rajdhani','Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: '-0.01em', color: '#E8003D' }}>BET</span>
      </div>
      <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: isDark ? '#DC2626' : '#B91C1C', opacity: 0.9 }}>HIT DIFFERENT</span>
    </div>
  </div>
);

// ─── Desktop nav link ─────────────────────────────────────────────────────────

const TopNavLink = ({ to, label, icon, isDark }) => (
  <NavLink
    to={to}
    end={to === '/'}
    style={({ isActive }) => ({
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px',
      fontSize: 13, fontWeight: 600, borderRadius: 6,
      textDecoration: 'none',
      color: isActive ? (isDark ? '#fff' : '#0f172a') : (isDark ? 'rgba(255,255,255,0.55)' : '#64748b'),
      background: isActive ? (isDark ? '#1e293b' : '#f1f5f9') : 'transparent',
      transition: 'color 0.15s, background 0.15s',
      whiteSpace: 'nowrap',
    })}
  >
    {({ isActive }) => (
      <>
        {icon}
        {label}
        {isActive && (
          <motion.div
            layoutId="topnav-active"
            style={{ position: 'absolute', bottom: 0, left: 8, right: 8, height: 2, background: '#DC2626', borderRadius: 2 }}
          />
        )}
      </>
    )}
  </NavLink>
);

// ─── TopBar ───────────────────────────────────────────────────────────────────

export const TopBar = ({ onOpenMenu }) => {
  const navigate   = useNavigate();
  const user       = useStore((s) => s.user);
  const slip       = useStore((s) => s.slip);
  const toggleSlip = useStore((s) => s.toggleSlip);
  const wallet     = useStore((s) => s.wallet);
  const vipStatus  = useStore((s) => s.vipStatus);
  const theme      = useStore((s) => s.theme);
  const isDark     = theme === 'dark';

  const storeCurrency = useStore((s) => s.currency);
  const currency = wallet?.currency ?? storeCurrency ?? 'GHS';

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/sports?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(''); setSearchOpen(false);
    }
  };

  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  const bgColor     = isDark ? 'rgba(10,10,15,0.97)' : 'rgba(255,255,255,0.97)';
  const btnBg       = isDark ? '#1e293b' : '#f1f5f9';
  const btnBorder   = isDark ? '1px solid #334155' : '1px solid #e2e8f0';
  const textColor   = isDark ? '#fff' : '#0f172a';

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur border-b"
      style={{ background: bgColor, borderColor }}
    >
      {/*
        ── RESPONSIVE TOPBAR ──────────────────────────────────────────────────
        Layout strategy:
          • Logo always visible (full wordmark from sm+)
          • Desktop nav links (lg+) in the middle
          • Right side: compact on mobile — only show slip button + hamburger
            Extra controls (search, theme, currency, wallet, profile) shown at sm/md+
        ─────────────────────────────────────────────────────────────────────
      */}
      <div
        style={{
          maxWidth: '1536px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 60, gap: 8,
          /* Prevent any child from overflowing */
          minWidth: 0, overflow: 'hidden',
        }}
      >
        {/* ── LEFT: Logo + Desktop Nav ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, minWidth: 0, flexShrink: 0 }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <SpeedBetLogo isDark={isDark} />
          </button>

          {/* Desktop nav — only lg+ */}
          <nav className="hidden lg:flex items-center gap-1">
            <TopNavLink to="/"           label="Home"   isDark={isDark} />
            <TopNavLink to="/app/sports" label="Sports" isDark={isDark} />
            <TopNavLink to="/app/live"   label="Live"   isDark={isDark} />
            <TopNavLink to="/app/games"  label="Games"  isDark={isDark} />
            <TopNavLink
              to="/app/vip"
              label="VIP"
              isDark={isDark}
              icon={<CrownIcon size={13} color="#FFB300" />}
            />
          </nav>
        </div>

        {/* ── RIGHT: Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          {/* Search icon — hidden on mobile to save space */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="hidden sm:flex"
            style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: btnBg, border: btnBorder, cursor: 'pointer', flexShrink: 0 }}
            aria-label="Search"
          >
            <SearchIcon size={16} color={textColor} />
          </button>

          {/* Theme toggle — hidden on mobile */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Currency selector — hidden on mobile */}
          <div className="hidden md:block">
            <CurrencySelector />
          </div>

          {user ? (
            <>
              {/* Wallet balance — hidden on mobile */}
              <button
                onClick={() => navigate('/app/wallet')}
                className="hidden md:flex items-center gap-2"
                style={{ padding: '6px 10px', borderRadius: 8, background: btnBg, border: btnBorder, cursor: 'pointer', flexShrink: 0 }}
              >
                <WalletIcon size={15} color="#00D4FF" />
                <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: textColor, whiteSpace: 'nowrap' }}>
                  {fmtMoneyWithCode(wallet?.balance ?? 0, currency)}
                </span>
              </button>

              {/* Bet Slip button — ALWAYS visible, even on mobile */}
              <button
                onClick={toggleSlip}
                className="lg:hidden"
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px', borderRadius: 8,
                  background: '#DC2626', border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <ReceiptIcon size={16} color="#fff" />
                {slip.length > 0 && (
                  <span style={{ background: '#fff', color: '#DC2626', borderRadius: 999, fontSize: 10, width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {slip.length}
                  </span>
                )}
              </button>

              {/* Slip button on desktop */}
              <button
                onClick={toggleSlip}
                className="hidden lg:flex items-center gap-2"
                style={{ padding: '7px 14px', borderRadius: 8, background: '#DC2626', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
              >
                <ReceiptIcon size={16} color="#fff" />
                <span>SLIP</span>
                {slip.length > 0 && (
                  <span style={{ background: '#fff', color: '#DC2626', borderRadius: 999, fontSize: 10, width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {slip.length}
                  </span>
                )}
              </button>

              {/* Profile — md+ */}
              <button
                onClick={() => navigate('/app/profile')}
                className="hidden md:flex items-center gap-2"
                style={{ padding: '6px 10px', borderRadius: 8, background: btnBg, border: btnBorder, cursor: 'pointer', flexShrink: 0 }}
              >
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color={textColor} />
                  {vipStatus?.active && (
                    <span style={{ position: 'absolute', top: -6, right: -6 }}>
                      <CrownIcon size={11} color="#FFB300" filled />
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline" style={{ fontSize: 13, fontWeight: 600, color: textColor, whiteSpace: 'nowrap' }}>
                  {user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()}
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Login — hidden on very small screens */}
              <button
                onClick={() => navigate('/auth/login')}
                className="hidden sm:block"
                style={{ fontSize: 13, fontWeight: 600, padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', color: isDark ? 'rgba(255,255,255,0.7)' : '#475569', flexShrink: 0 }}
              >
                Login
              </button>
              {/* Sign up — always visible */}
              <button
                onClick={() => navigate('/auth/register')}
                style={{ padding: '7px 14px', borderRadius: 8, background: '#DC2626', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                Sign up
              </button>
            </>
          )}

          {/* Hamburger — mobile only (hidden lg+) */}
          <button
            onClick={onOpenMenu}
            className="lg:hidden"
            style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: btnBg, border: btnBorder, cursor: 'pointer', flexShrink: 0 }}
            aria-label="Open menu"
          >
            <MenuIcon size={20} color={textColor} />
          </button>
        </div>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{ background: isDark ? '#0a0a0f' : '#fff', borderTop: `1px solid ${borderColor}` }}
          >
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 16px' }}>
              <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <SearchIcon size={16} color={isDark ? '#64748b' : '#94a3b8'} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search matches, teams, leagues…"
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 40px 10px 38px',
                    borderRadius: 8, fontSize: 13, fontWeight: 500,
                    background: isDark ? '#1e293b' : '#f1f5f9',
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    color: textColor, outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ESC
                </button>
              </form>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8', alignSelf: 'center' }}>Quick:</span>
                {['Live Matches', 'Premier League', 'Champions League', 'La Liga'].map((term) => (
                  <button
                    key={term}
                    onClick={() => { setSearchQuery(term); handleSearch(); }}
                    style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, background: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b', border: 'none', cursor: 'pointer' }}
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

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

export const BottomNav = () => {
  const slip   = useStore((s) => s.slip);
  const theme  = useStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <nav
      className="lg:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        backdropFilter: 'blur(12px)',
        background: isDark ? 'rgba(10,10,15,0.97)' : 'rgba(255,255,255,0.97)',
        borderTop: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
        /* Safe area for notched phones */
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 8px' }}>
        <BottomItem to="/"            label="Home"   icon={HomeIcon}    isDark={isDark} />
        <BottomItem to="/app/live"    label="Live"   icon={PulseIcon}   isDark={isDark} />
        <BottomItem to="/app/sports"  label="Sports" icon={BallIcon}    isDark={isDark} />
        <BottomItem to="/app/games"   label="Games"  icon={RocketIcon}  isDark={isDark} />
        <BottomItem to="/app/bets"    label="Bets"   icon={ReceiptIcon} badge={slip.length} isDark={isDark} />
        <BottomItem to="/app/profile" label="Me"     icon={UserIcon}    isDark={isDark} />
      </div>
    </nav>
  );
};

const BottomItem = ({ to, label, icon: Icon, badge, isDark }) => (
  <NavLink
    to={to}
    end={to === '/'}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 8px', minWidth: 44, minHeight: 44, position: 'relative', textDecoration: 'none' }}
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div
            layoutId="bottomnav-active"
            style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 2, background: '#E8003D', borderRadius: '0 0 2px 2px' }}
          />
        )}
        <div style={{ position: 'relative' }}>
          <Icon size={20} color={isActive ? '#E8003D' : isDark ? '#888' : '#94a3b8'} />
          {badge > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: '#DC2626', color: '#fff', fontSize: 8, fontWeight: 700, borderRadius: 999, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: isActive ? '#E8003D' : isDark ? '#888' : '#94a3b8' }}>
          {label}
        </span>
      </>
    )}
  </NavLink>
);

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

const SpeedBetLogoDrawer = ({ isDark }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width="32" height="32" viewBox="0 0 38 38" fill="none">
      <rect width="38" height="38" rx="10" fill={isDark ? '#DC2626' : '#B91C1C'} />
      <path d="M22 6L12 21h8l-4 11 14-17h-9l3-9z" fill="white" opacity="0.95" />
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      <div>
        <span style={{ fontFamily: "'Rajdhani','Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18, color: isDark ? '#fff' : '#0f172a' }}>SPEED</span>
        <span style={{ fontFamily: "'Rajdhani','Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18, color: '#E8003D' }}>BET</span>
      </div>
      <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#DC2626' }}>HIT DIFFERENT</span>
    </div>
  </div>
);

export const MobileDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const user   = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const theme  = useStore((s) => s.theme);
  const isDark = theme === 'dark';

  if (!open) return null;
  const go = (path) => { onClose(); navigate(path); };

  const bg          = isDark ? '#0a0a0f' : '#ffffff';
  const border      = isDark ? '#1e293b' : '#e2e8f0';
  const textColor   = isDark ? '#fff' : '#0f172a';
  const hoverBg     = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: 'min(85vw, 320px)',
              background: bg, borderLeft: `1px solid ${border}`,
              overflowY: 'auto', display: 'flex', flexDirection: 'column',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${border}` }}>
              <SpeedBetLogoDrawer isDark={isDark} />
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <CloseIcon size={20} color={textColor} />
              </button>
            </div>

            {/* Links */}
            <div style={{ flex: 1, padding: '12px 12px' }}>
              <DrawerLink onClick={() => go('/')}             label="Home"         icon={<HomeIcon    size={18} color={textColor} />} hoverBg={hoverBg} textColor={textColor} />
              <DrawerLink onClick={() => go('/app/sports')}   label="Sports"       icon={<BallIcon    size={18} color={textColor} />} hoverBg={hoverBg} textColor={textColor} />
              <DrawerLink onClick={() => go('/app/live')}     label="Live"         icon={<PulseIcon   size={18} color="#00E676"  />}  hoverBg={hoverBg} textColor={textColor} />
              <DrawerLink onClick={() => go('/app/games')}    label="Games"        icon={<RocketIcon  size={18} color="#E8003D"  />}  hoverBg={hoverBg} textColor={textColor} />
              <DrawerLink onClick={() => go('/app/vip')}      label="VIP"          icon={<CrownIcon   size={18} color="#FFB300" filled />} hoverBg={hoverBg} textColor={textColor} />
              <DrawerLink onClick={() => go('/app/bets')}     label="My Bets"      icon={<ReceiptIcon size={18} color={textColor} />} hoverBg={hoverBg} textColor={textColor} />
              <DrawerLink onClick={() => go('/app/wallet')}   label="Wallet"       icon={<WalletIcon  size={18} color={textColor} />} hoverBg={hoverBg} textColor={textColor} />
              <DrawerLink onClick={() => go('/app/booking')}  label="Booking Code" icon={<BellIcon    size={18} color={textColor} />} hoverBg={hoverBg} textColor={textColor} />

              {/* Quick controls — theme + currency on mobile */}
              <div style={{ marginTop: 16, padding: '12px 0', borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ThemeToggle />
                <CurrencySelector />
              </div>

              {user?.role === 'ADMIN' && (
                <>
                  <div style={{ padding: '12px 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00D4FF' }}>Admin</div>
                  <DrawerLink onClick={() => go('/admin')}               label="Dashboard"     hoverBg={hoverBg} textColor={textColor} />
                  <DrawerLink onClick={() => go('/admin/predictions')}   label="Predictions"   hoverBg={hoverBg} textColor={textColor} />
                  <DrawerLink onClick={() => go('/admin/crash-control')} label="Crash Control" hoverBg={hoverBg} textColor={textColor} />
                  <DrawerLink onClick={() => go('/admin/booking-codes')} label="Booking Codes" hoverBg={hoverBg} textColor={textColor} />
                  <DrawerLink onClick={() => go('/admin/games')}         label="Custom Games"  hoverBg={hoverBg} textColor={textColor} />
                  <DrawerLink onClick={() => go('/admin/payouts')}       label="Payouts"       hoverBg={hoverBg} textColor={textColor} />
                </>
              )}

              {user?.role === 'SUPER_ADMIN' && (
                <>
                  <div style={{ padding: '12px 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8003D' }}>Super Admin</div>
                  <DrawerLink onClick={() => go('/x-control-9f3a2b')} label="Control Panel" hoverBg={hoverBg} textColor={textColor} />
                </>
              )}

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${border}` }}>
                {user ? (
                  <>
                    <DrawerLink onClick={() => go('/app/profile')}     label="Profile" icon={<UserIcon size={18} color={textColor} />} hoverBg={hoverBg} textColor={textColor} />
                    <DrawerLink onClick={() => { logout(); go('/'); }} label="Logout"  hoverBg={hoverBg} textColor="#DC2626" />
                  </>
                ) : (
                  <>
                    <DrawerLink onClick={() => go('/auth/login')}    label="Login"   hoverBg={hoverBg} textColor={textColor} />
                    <DrawerLink onClick={() => go('/auth/register')} label="Sign up" hoverBg={hoverBg} textColor="#DC2626" />
                  </>
                )}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DrawerLink = ({ label, onClick, icon, hoverBg, textColor }) => (
  <button
    onClick={onClick}
    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: textColor, textAlign: 'left', fontSize: 14, fontWeight: 600, transition: 'background 0.12s' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
    {label}
  </button>
);