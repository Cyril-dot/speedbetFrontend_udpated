import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TopBar, BottomNav, MobileDrawer } from '../Navigation';
import { BetSlipSidebar, BetSlipDrawer, BetSlipFloatingBtn } from '../BetSlip';
import { ToastHost } from '../Shared';

// Pages where the bet slip is "in-flow" (i.e. mobile shows the floating button by default).
// On all other public pages, mobile users get the bubble icon to peek the slip.
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

  // Pages that get NO chrome at all (bare layouts)
  const hideChrome =
    path.startsWith('/auth') ||
    path.startsWith('/x-control-9f3a2b');

  // Pages where bet slip should NOT appear at all (admin uses its own shell, no slip)
  const hideBetSlip =
    path.startsWith('/admin') ||
    hideChrome;

  if (hideChrome) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-1)' }}>
        {children}
        <ToastHost />
      </div>
    );
  }

  // Bet slip rendering rules:
  //   • Desktop sidebar    → ALWAYS visible (on every public page)
  //   • Mobile drawer      → present everywhere (toggleable)
  //   • Floating bubble    → ONLY on non-betting pages (mobile)
  //                          On betting pages, slip lives in the natural flow
  const showFloatingBubble = !BETTING_PATHS.some((p) => path.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-1)' }}>
      <TopBar onOpenMenu={() => setMenuOpen(true)} />

      <div className={`flex-1 flex ${!hideBetSlip ? 'lg:pr-[340px] xl:pr-[380px]' : ''}`}>
        <main className="flex-1 pb-20 lg:pb-8 min-w-0">{children}</main>
      </div>

      {!hideBetSlip && (
        <>
          {/* Desktop sidebar — always visible at lg+ */}
          <BetSlipSidebar />
          {/* Mobile drawer — backed by toggleSlip state */}
          <BetSlipDrawer />
          {/* Floating bubble — mobile only, non-betting pages only */}
          {showFloatingBubble && <BetSlipFloatingBtn />}
        </>
      )}
      <BottomNav />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <ToastHost />
    </div>
  );
}