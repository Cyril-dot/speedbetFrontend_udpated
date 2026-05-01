import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Badge, Button } from '../../components/ui/UIKit';
import {
  ShieldIcon,
  WalletIcon,
  ChartBarIcon,
  ReceiptIcon,
  TargetIcon,
  CalendarIcon,
  RocketIcon,
  PlayIcon,
  UserIcon,
  CloseIcon,
  MenuIcon,
} from '../../components/icons';
import { useStore } from '../../store';
import { BoltMark } from '../../components/Logo';

const NAV = [
  { to: '/admin', label: 'Overview', icon: ChartBarIcon, end: true },
  { to: '/admin/links', label: 'Referral Links', icon: ShieldIcon },
  { to: '/admin/users', label: 'Referred Users', icon: UserIcon },
  { to: '/admin/booking-codes', label: 'Booking Codes', icon: CalendarIcon },
  { to: '/admin/predictions', label: 'Predictions', icon: TargetIcon },
  { to: '/admin/crash-control', label: 'Crash Control', icon: RocketIcon },
  { to: '/admin/games', label: 'Custom Games', icon: PlayIcon },
  { to: '/admin/payouts', label: 'Payouts', icon: WalletIcon },
];

export default function AdminShell({ title, kicker, actions, children }) {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => {
    if (item.end) return pathname === item.to;
    return pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-0)' }}>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen border-r"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link to="/" className="flex items-center gap-2">
            <BoltMark size={28} />
            <div>
              <div className="font-display text-lg leading-none" style={{ color: 'var(--text-100)', fontFamily: 'Outfit' }}>SpeedBet</div>
              <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--accent)' }}>Admin Portal</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: active ? 'var(--grad-primary)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-80)',
                  boxShadow: active ? '0 4px 16px rgba(232,0,61,0.25)' : 'none',
                }}
              >
                <Icon size={16} color={active ? '#fff' : 'var(--text-60)'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2" style={{ background: 'var(--surface-2)' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
              style={{ background: 'var(--grad-primary)', color: '#fff' }}
            >
              {user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate" style={{ color: 'var(--text-100)' }}>{user?.name || 'Admin'}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-60)' }}>
                {user?.role || 'admin'}
              </div>
            </div>
          </div>
          <Link to="/" onClick={logout}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              ← Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* ── Mobile sidebar drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside
            className="relative w-72 max-w-[85vw] flex flex-col h-full border-r"
            style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
          >
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <BoltMark size={24} />
                <span className="font-display text-base" style={{ color: 'var(--text-100)' }}>Admin</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded hover:bg-white/5">
                <CloseIcon size={16} color="var(--text-60)" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium"
                    style={{
                      background: active ? 'var(--grad-primary)' : 'transparent',
                      color: active ? '#fff' : 'var(--text-80)',
                    }}
                  >
                    <Icon size={16} color={active ? '#fff' : 'var(--text-60)'} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 border-b px-4 md:px-8 py-4 flex items-center gap-3 flex-wrap"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
        >
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ background: 'var(--surface-2)' }}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon size={18} color="var(--text-80)" />
          </button>
          <div className="flex-1 min-w-0">
            {kicker && (
              <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--accent)' }}>
                {kicker}
              </div>
            )}
            <h1
              className="font-display text-xl md:text-2xl truncate"
              style={{ color: 'var(--text-100)', fontFamily: 'Outfit', fontWeight: 600 }}
            >
              {title}
            </h1>
          </div>
          {actions}
        </header>

        <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8">{children}</div>
      </div>
    </div>
  );
}
