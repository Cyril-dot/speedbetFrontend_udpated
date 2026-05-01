import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/UIKit';
import {
  ShieldIcon,
  WalletIcon,
  CrownIcon,
  ChartBarIcon,
  ReceiptIcon,
  TargetIcon,
  SettingsIcon,
  MenuIcon,
  CloseIcon,
} from '../../components/icons';
import { useStore } from '../../store';

export default function SuperAdminShell({ children, actions }) {
  const logout = useStore((s) => s.logout);
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/x-control-9f3a2b', label: 'OVERVIEW', icon: ChartBarIcon },
    { to: '/x-control-9f3a2b/admins', label: 'ADMINS', icon: ShieldIcon },
    { to: '/x-control-9f3a2b/payouts', label: 'PAYOUTS', icon: WalletIcon },
    { to: '/x-control-9f3a2b/predictions', label: 'PREDICTIONS', icon: TargetIcon },
    { to: '/x-control-9f3a2b/audit', label: 'AUDIT LOG', icon: ReceiptIcon },
    { to: '/x-control-9f3a2b/vip', label: 'VIP', icon: CrownIcon },
    { to: '/x-control-9f3a2b/config', label: 'CONFIG', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <div className="border-b-2 border-red-600 px-4 md:px-8 py-3" style={{ backgroundColor: '#0a0f1e' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-2">

          {/* Desktop nav */}
          <div className="hidden md:flex flex-1 gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-2 text-[11px] caps font-semibold whitespace-nowrap flex items-center gap-1 border ${
                    active
                      ? 'bg-red-600/20 border-red-500 text-white'
                      : 'border-transparent text-white hover:text-white hover:bg-red-600/10 hover:border-red-600'
                  }`}
                >
                  <n.icon size={12} color="#E8003D" /> {n.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile: current page label */}
          <div className="flex md:hidden flex-1 text-white text-sm font-semibold caps">
            {navItems.find((n) => n.pathname === pathname)?.label || 'MENU'}
          </div>

          {/* Actions + Sign out (always visible) */}
          <div className="flex items-center gap-2 shrink-0">
            {actions && <div>{actions}</div>}
            <Link to="/auth/login">
              <Button variant="ghost" size="sm" onClick={logout}>SIGN OUT</Button>
            </Link>
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 flex flex-col gap-1 max-w-7xl mx-auto">
            {navItems.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-3 text-[11px] caps font-semibold flex items-center gap-2 border ${
                    active
                      ? 'bg-red-600/20 border-red-500 text-white'
                      : 'border-transparent text-white hover:bg-red-600/10 hover:border-red-600'
                  }`}
                >
                  <n.icon size={14} color="#E8003D" /> {n.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {children}
      </div>
    </div>
  );
}