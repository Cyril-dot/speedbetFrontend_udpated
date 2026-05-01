import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Splash from './components/Splash';
import VipPopup from './components/VipPopup';
import WinPopup from './components/WinPopup';
import { useStore } from './store';

import Home from './pages/Home';
import Sports from './pages/Sports';
import Live from './pages/Live';
import Virtual from './pages/Virtual';
import GameDetail from './pages/GameDetail';
import Predictions from './pages/Predictions';
import Wallet from './pages/Wallet';
import Bets from './pages/Bets';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import VipHub from './pages/vip/VipHub';

import GamesHub from './pages/games/GamesHub';
import GameRunner from './pages/games/GameRunner';
import CrashHistory from './pages/history/CrashHistory';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import ReferralLinks from './pages/admin/ReferralLinks';
import ReferredUsers from './pages/admin/ReferredUsers';
import BookingCodes from './pages/admin/BookingCodes';
import AdminPredictions from './pages/admin/AdminPredictions';
import CrashControl from './pages/admin/CrashControl';
import CustomGames from './pages/admin/CustomGames';
import AdminPayouts from './pages/admin/Payouts';

import SuperAdminControl from './pages/super-admin/Control';
import SuperAdminAdmins from './pages/super-admin/Admins';
import SuperAdminPayouts from './pages/super-admin/Payouts';
import SuperAdminPredictions from './pages/super-admin/Predictions';
import SuperAdminAudit from './pages/super-admin/Audit';
import SuperAdminVip from './pages/super-admin/Vip';
import SuperAdminConfig from './pages/super-admin/Config';

function RequireRole({ allow, children }) {
  const user = useStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to={`/auth/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (!allow.includes(user.role)) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Splash />
      <VipPopup />
      <WinPopup />
      <Layout>
      <Routes>
        {/* Public marketing root */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Public app */}
        <Route path="/app" element={<Home />} />
        <Route path="/app/sports" element={<Sports />} />
        <Route path="/app/live" element={<Live />} />
        <Route path="/app/virtual" element={<Virtual />} />
        <Route path="/app/predictions" element={<Predictions />} />
        <Route path="/app/wallet" element={<Wallet />} />
        <Route path="/app/bets" element={<Bets />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/booking" element={<Booking />} />
        <Route path="/app/vip" element={<VipHub />} />
        <Route path="/app/match/:id" element={<GameDetail />} />

        {/* Games */}
        <Route path="/app/games" element={<GamesHub />} />
        <Route path="/app/games/aviator/history" element={<CrashHistory />} />
        <Route path="/app/games/:slug" element={<GameRunner />} />

        {/* Admin (ADMIN or SUPER_ADMIN) */}
        <Route
          path="/admin"
          element={
            <RequireRole allow={['ADMIN', 'SUPER_ADMIN']}>
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/admin/links"
          element={<RequireRole allow={['ADMIN', 'SUPER_ADMIN']}><ReferralLinks /></RequireRole>}
        />
        <Route
          path="/admin/users"
          element={<RequireRole allow={['ADMIN', 'SUPER_ADMIN']}><ReferredUsers /></RequireRole>}
        />
        <Route
          path="/admin/booking-codes"
          element={<RequireRole allow={['ADMIN', 'SUPER_ADMIN']}><BookingCodes /></RequireRole>}
        />
        <Route
          path="/admin/predictions"
          element={<RequireRole allow={['ADMIN', 'SUPER_ADMIN']}><AdminPredictions /></RequireRole>}
        />
        <Route
          path="/admin/crash-control"
          element={<RequireRole allow={['ADMIN', 'SUPER_ADMIN']}><CrashControl /></RequireRole>}
        />
        <Route
          path="/admin/games"
          element={<RequireRole allow={['ADMIN', 'SUPER_ADMIN']}><CustomGames /></RequireRole>}
        />
        <Route
          path="/admin/payouts"
          element={<RequireRole allow={['ADMIN', 'SUPER_ADMIN']}><AdminPayouts /></RequireRole>}
        />

        {/* Super-admin (SUPER_ADMIN only) */}
        <Route
          path="/x-control-9f3a2b"
          element={<RequireRole allow={['SUPER_ADMIN']}><SuperAdminControl /></RequireRole>}
        />
        <Route
          path="/x-control-9f3a2b/admins"
          element={<RequireRole allow={['SUPER_ADMIN']}><SuperAdminAdmins /></RequireRole>}
        />
        <Route
          path="/x-control-9f3a2b/payouts"
          element={<RequireRole allow={['SUPER_ADMIN']}><SuperAdminPayouts /></RequireRole>}
        />
        <Route
          path="/x-control-9f3a2b/predictions"
          element={<RequireRole allow={['SUPER_ADMIN']}><SuperAdminPredictions /></RequireRole>}
        />
        <Route
          path="/x-control-9f3a2b/audit"
          element={<RequireRole allow={['SUPER_ADMIN']}><SuperAdminAudit /></RequireRole>}
        />
        <Route
          path="/x-control-9f3a2b/vip"
          element={<RequireRole allow={['SUPER_ADMIN']}><SuperAdminVip /></RequireRole>}
        />
        <Route
          path="/x-control-9f3a2b/config"
          element={<RequireRole allow={['SUPER_ADMIN']}><SuperAdminConfig /></RequireRole>}
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
    </>
  );
}
