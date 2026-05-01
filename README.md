# SpeedBet — Frontend

> **Hit Different. Cash Out Smart.**

A complete production-grade React frontend for SpeedBet, a Ghana-first sports & casino betting platform with crash games, AI predictions, and a three-tier role system (User → Admin → Super-Admin).

Built to v2.1 spec — black / crimson / electric blue industrial aesthetic, custom SVG icon set, mobile-first.

---

## Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

---

## Demo logins

The app runs in **demo mode** with no backend. On the login page (`/auth/login`), you'll see three "Continue as…" buttons after the regular email/password form:

| Role          | Lands on           | Sees                                                                |
| ------------- | ------------------ | ------------------------------------------------------------------- |
| `USER`        | `/app`             | Full punter experience: sports, live, virtuals, crash, wallet, VIP. |
| `ADMIN`       | `/admin`           | Admin portal: referrals, booking codes, predictions, crash control. |
| `SUPER_ADMIN` | `/x-control-9f3a2b` | Hidden control tower: payouts approval, audit log, config, VIPs.    |

The super-admin path is intentionally obscured and **never appears in any visible navigation**, per spec §4.6.

---

## What's inside

### Routes (public)

- `/` — Marketing home (also the post-login user landing)
- `/auth/login`, `/auth/register` — Auth screens (chrome-free)
- `/app` — App home
- `/app/sports`, `/app/live`, `/app/virtual` — Sports surfaces
- `/app/match/:id` — Match detail (7 tabs: Summary, Odds, Stats, Events, Commentary, Lineups, H2H)
- `/app/games` — Arcade hub (8 games)
- `/app/games/aviator` — Crash game (canvas-rendered)
- `/app/games/aviator/history` — Crash history with chart, distribution insight, alerts
- `/app/games/:slug` — Flip / Coin / Dice / Spin / Magic Ball
- `/app/predictions` — AI + admin tips, filterable
- `/app/wallet` — Balance, deposit/withdraw modals (Paystack/Stripe), tx history
- `/app/bets` — All / Open / Won / Lost
- `/app/booking` — Redeem booking codes; load directly to slip
- `/app/profile` — Edit, stats, VIP card, quick links
- `/app/vip` — VIP landing (non-VIP) or member dashboard

### Admin routes (`ADMIN` or `SUPER_ADMIN`)

- `/admin` — KPI dashboard
- `/admin/links` — Referral link generator with copy-to-clipboard
- `/admin/users` — Referred users + commission
- `/admin/booking-codes` — Create codes across all 9 kinds (1X2, HOME_WIN, AWAY_WIN, CS, HCP, HTFT, BTTS, OU, MIXED)
- `/admin/predictions` — Tabs (Football, Crash, Virtuals), accuracy tracker, "Run AI" modal with publish flow
- `/admin/crash-control` — Live monitor, upcoming schedule, high-crash alerts, history, override modal, schedule generator, alert broadcast
- `/admin/games` — Custom game builder
- `/admin/payouts` — Friday-only commission request

### Super-admin routes (`SUPER_ADMIN` only — hidden)

- `/x-control-9f3a2b` — Control tower (today's KPIs, pending payouts, top admins, system health)
- `/x-control-9f3a2b/admins` — Admin management (CRUD, suspend)
- `/x-control-9f3a2b/payouts` — Approve / reject / mark paid
- `/x-control-9f3a2b/predictions` — Read-only audit view (admin > super-admin priority)
- `/x-control-9f3a2b/audit` — Full activity log with filters
- `/x-control-9f3a2b/vip` — VIP roster, broadcast gifts
- `/x-control-9f3a2b/config` — Edit min_deposit, vip_price, vip_days, admin_commission

---

## Architecture

### Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** for styling (with custom CSS variables for tokens)
- **Framer Motion 11** for spring-based motion (modals, drawers, list reveals)
- **Zustand 4** for state (slip / user / wallet persisted to localStorage)
- **Recharts** for crash history bar charts
- **react-router-dom 6** for routing

### Folder structure

```
src/
├── App.jsx                 # Router with role gates
├── main.jsx                # ReactDOM root
├── components/
│   ├── icons/              # 40 custom SVG icons (no lucide-react)
│   ├── ui/UIKit.jsx        # Button, Card, Badge, Input, Modal, ProgressBar, ConfidenceMeter, etc.
│   ├── layout/Layout.jsx   # Hides public chrome on auth + super-admin paths
│   ├── Navigation.jsx      # TopBar, BottomNav, MobileDrawer
│   ├── BetSlip.jsx         # Right drawer w/ booking-code redeem
│   ├── Shared.jsx          # DemoBanner, ToastHost, MatchCard, TipCard
│   └── Logo.jsx            # BoltMark and lockup
├── demo/demoData.js        # All demo data (matches, crash, wallet, admin, super-admin)
├── pages/
│   ├── Home, Sports, Live, Virtual, Predictions, Wallet, Bets, Profile, Booking, GameDetail
│   ├── auth/               # Login, Register
│   ├── games/              # GamesHub, Aviator, SimpleGames
│   ├── history/            # CrashHistory
│   ├── vip/                # VipHub
│   ├── admin/              # 8 admin pages
│   └── super-admin/        # 7 super-admin pages + SuperAdminShell
├── store/index.js          # Zustand store
├── utils/index.js          # fmtMoney, fmtOdds, fmtTimeAgo, fmtCountdown, tierColor, etc.
└── styles/index.css        # CSS vars, bg-grid/spotlight, animations
```

### Design tokens

- **Crimson** `#E8003D` — primary brand
- **Electric Blue** `#00D4FF` — secondary brand
- **Black** `#0A0A0F` (950), `#15151E` (900), `#1F1F2A` (800), `#2A2A35` (700) — surfaces
- **Emerald** `#00E676` — wins, success
- **Amber** `#FFB300` — high-crash, VIP, warning
- **Violet** `#B388FF` — extreme crash, super-admin

### Typography

- **Bebas Neue** — display, headings, big numbers (loaded from Google Fonts)
- **DM Sans** — body, UI text
- **JetBrains Mono** — odds, scores, balances (everything tabular-nums)

### Brand tone

- **HIT DIFFERENT. CASH OUT SMART.**
- "Bag secured." / "Wrong call." / "Eyes locked." — short, sharp, modern Ghanaian English.

---

## Notable implementation details

- **Demo mode is on by default** — every page reads from `src/demo/demoData.js`. Yellow banner sits above the app to signal this.
- **Crash math is server-authoritative.** Even in the client, crash points are pre-defined in demoData (`crashUpcoming`) and the client reveals them only when the round runs. VIP users see them in the schedule; non-VIP users see masked dashes.
- **Persistence.** Bet slip, user session, wallet balance, and VIP status survive a page refresh via `zustand/persist`.
- **No fake browser storage in artifacts.** Just standard React + Zustand.
- **Touch targets** are minimum 44×44 px throughout.
- **Mobile-first.** Layouts are tested down to 375 px. The bottom nav is mobile-only; desktop uses the top bar.

---

## Spec compliance check

This build implements every requirement from the v2.0 build spec and the v2.1 addendum (which wins on conflicts):

- ✅ Three role tiers, role-gated routes, hidden super-admin path
- ✅ All 9 booking-code kinds
- ✅ Crash control panel with override + schedule generator + alert broadcast
- ✅ Admin > Super-admin priority on predictions (read-only super view)
- ✅ Friday-only payout request
- ✅ Custom SVG icon set (zero lucide-react in UI)
- ✅ Black / crimson / electric blue theme (replacing v2.0 navy/gold)
- ✅ Crash history with VIP teaser
- ✅ AI predictions with confidence meters and admin notes
- ✅ Booking code redeem on bet slip and on dedicated `/app/booking` page
- ✅ All 8 arcade games (3 crash variants + flip + coin + dice + spin + magic-ball)
- ✅ 4 virtual categories (Football, Horse, Greyhound, Penalties)

---

## Built with

- Designed and engineered for the SpeedBet team.
- Ready to wire to a real backend by replacing imports from `src/demo/demoData.js` with API calls.
- All numeric formatting respects the configured currency (default: GHS).

