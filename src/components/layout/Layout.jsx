import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TopBar, BottomNav, MobileDrawer } from '../Navigation';
import { BetSlipSidebar, BetSlipDrawer, BetSlipFloatingBtn } from '../BetSlip';
import { ToastHost } from '../Shared';

// Pages where the bet slip is relevant
const BETTING_PATHS = [
  '/app/sports',
  '/app/live',
  '/app/virtual',
  '/app/predictions',
  '/app/match',
  '/app/booking',
];

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  // Pages that get NO chrome at all
  const hideChrome =
    path.startsWith('/auth') ||
    path.startsWith('/x-control-9f3a2b');

  // Admin uses its own shell — no bet slip
  const hideBetSlip =
    path.startsWith('/admin') ||
    hideChrome;

  if (hideChrome) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: 'var(--surface-1)', overflowX: 'hidden' }}
      >
        {children}
        <ToastHost />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--surface-1)', overflowX: 'hidden' }}
    >
      <TopBar onOpenMenu={() => setMenuOpen(true)} />

      {/*
        ── PADDING FIX ───────────────────────────────────────────────────────
        Right padding must EXACTLY match BetSlipSidebar widths:
          lg  (≥1024px) → 268px
          xl  (≥1280px) → 288px
          2xl (≥1536px) → 308px
        Old values (340px / 380px) were ~70px wider → caused the gap.
        On mobile there is zero right padding; the slip is a drawer.
        ─────────────────────────────────────────────────────────────────────
      */}
      <div
        className={`flex-1 flex min-w-0 ${
          !hideBetSlip ? 'lg:pr-[268px] xl:pr-[288px] 2xl:pr-[308px]' : ''
        }`}
      >
        <main
          className="flex-1 w-full min-w-0 pb-24 lg:pb-8"
          style={{ overflowX: 'hidden' }}
        >
          {children}
        </main>
      </div>

      {!hideBetSlip && (
        <>
          {/* Desktop: fixed sidebar, always visible lg+ */}
          <BetSlipSidebar />
          {/* Mobile: slide-in drawer from right */}
          <BetSlipDrawer />
          {/*
            Floating button — mobile only (hidden at lg+).
            Always rendered so users can open slip on any page.
            Positioned above BottomNav with safe clearance.
          */}
          <BetSlipFloatingBtn />
        </>
      )}

      <BottomNav />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <ToastHost />
    </div>
  );
}