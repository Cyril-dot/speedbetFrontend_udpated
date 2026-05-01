// ============================================================
// SpeedBet API Service
// Base URL: http://localhost:8080
// All authenticated endpoints send Bearer token from localStorage
// ============================================================

const BASE = "http://localhost:8080";

const getToken = (): string | null => {
  const t = localStorage.getItem("sb_token");
  return t && t !== "undefined" && t !== "null" ? t : null;
};
const setToken = (t: string) => {
  if (!t || t === "undefined") {
    console.error("[api] setToken called with invalid value:", t);
    return;
  }
  localStorage.setItem("sb_token", t);
};
const clearToken = () => localStorage.removeItem("sb_token");

async function req<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn(`[api] auth=true but no valid token in storage for ${path}`);
    }
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err.message ?? err.error ?? message;
    } catch { /* body wasn't JSON */ }
    throw new Error(message);
  }
  const json = await res.json();
  // FIX: some endpoints return { data: T }, others return T directly.
  // Prefer json.data when present, otherwise return the root object.
  return (json?.data !== undefined ? json.data : json) as T;
}

const get = <T>(path: string, auth = false) =>
  req<T>(path, { method: "GET" }, auth);

const post = <T>(path: string, body?: unknown, auth = false) =>
  req<T>(path, { method: "POST", body: JSON.stringify(body) }, auth);

const patch = <T>(path: string, body?: unknown, auth = false) =>
  req<T>(path, { method: "PATCH", body: JSON.stringify(body) }, auth);

// ============================================================
// TYPES
// ============================================================

export interface Match {
  id: string;
  source: string;
  externalId: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  status: string;
  scoreHome: number | null;
  scoreAway: number | null;
  homeLogo: string | null;
  awayLogo: string | null;
  leagueLogo: string | null;
  featured: boolean;
  metadata: Record<string, unknown> | null;
  settledAt: string | null;
  createdAt: string;
}

export interface Odds {
  id: string;
  matchId: string;
  market: string;
  selection: string;
  value: number;
  line: number | null;
  handicap: number | null;
  capturedAt: string;
}

export interface Bet {
  id: string;
  userId: string;
  stake: number;
  currency: string;
  total_odds: number;
  potential_return: number | null;
  status: "PENDING" | "WON" | "LOST" | "VOID" | "CASHED_OUT";
  win_seen: boolean;
  placed_at: string;
  settled_at: string | null;
  booking_code_used_id: string | null;
  selections: BetSelection[];
}

export interface BetSelection {
  id: string;
  betId: string;
  matchId: string;
  market: string;
  selection: string;
  // API field name — always use this; fall back to `odds` only for enriched/legacy data
  odds_locked: number;
  result: "PENDING" | "WON" | "LOST" | "PUSH" | "VOID" | "HALF_WON" | "HALF_LOST";
  match_label?: string;
}

export interface PlaceBetRequest {
  stake: number;
  currency: string;
  selections: {
    matchId: string;
    market: string;
    selection: string;
    submittedOdds: number;
  }[];
  bookingCodeUsedId?: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  role: string;
  themePreference: string;
  isVip: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: UserDto;
}

export interface Transaction {
  id: string;
  walletId: string;
  kind: string;
  amount: number;
  balanceAfter: number;
  providerRef: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface VipMembership {
  id: string;
  userId: string;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  pricePaid: number;
  currency: string;
  status: string;
  activatedVia: string;
}

export interface VipStatusDto {
  isActive: boolean;
  expiresAt: string;
  autoRenew: boolean;
  daysRemaining: number;
}

export interface VipGift {
  id: string;
  userId: string;
  kind: string;
  payload: Record<string, unknown>;
  issuedAt: string;
  consumedAt: string | null;
  expiresAt: string | null;
}

export interface AiPrediction {
  id: string;
  matchId: string;
  model: string;
  generatedAt: string;
  prediction: Record<string, unknown>;
  sharedAt: string | null;
  sharedByAdminId: string | null;
  publishedToUsers: boolean;
  adminNote: string | null;
}

export interface BookingCode {
  id: string;
  code: string;
  creatorAdminId: string;
  label: string;
  kind: string;
  version: number;
  currency: string;
  stake: number;
  selections: Record<string, unknown>[];
  totalOdds: number;
  potentialPayout: number;
  status: string;
  redemptionCount: number;
  maxRedemptions: number | null;
  expiresAt: string;
  createdAt: string;
}

export interface GameRound {
  id: string;
  userId: string;
  game: string;
  stake: number;
  result: Record<string, unknown>;
  payout: number;
  playedAt: string;
}

export interface GameCrashSchedule {
  id: string;
  gameSlug: string;
  roundNumber: number;
  crashAt: number;
  tier: string;
  highCrash: boolean;
  extremeCrash: boolean;
  generatedBy: string;
  generatedAt: string;
  playedAt: string | null;
  adminNotified: boolean;
  overrideReason: string | null;
}

export interface ReferralLink {
  id: string;
  adminId: string;
  code: string;
  label: string;
  commissionPercent: number;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export interface Referral {
  id: string;
  linkId: string;
  userId: string;
  joinedAt: string;
  lifetimeStake: number;
  lifetimeCommission: number;
}

export interface PayoutRequest {
  id: string;
  adminId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  status: string;
  rejectReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type AllOddsBundle = Record<string, Array<{
  bookmaker: string;
  market: string;
  selection: string;
  odd: string | number;
}>>;

/**
 * Bundle returned by /api/public/matches.
 * FIX: previously each property (today, live, upcoming …) made a separate
 * network call to the same endpoint and destructured a single key, wasting
 * 4 identical requests. Now callers fetch once via matches.all() and pick
 * the slice they need, or use the individual helpers which share one call
 * via a module-level cache (30s TTL).
 */
export interface PublicMatchesBundle {
  today: Match[];
  live: Match[];
  upcoming: Match[];
  future: Match[];
  results: Match[];
}

// ── Simple 30-second in-memory cache for the public matches bundle ──────────
let _publicMatchesCache: { data: PublicMatchesBundle; expiresAt: number } | null = null;

async function fetchPublicMatches(): Promise<PublicMatchesBundle> {
  const now = Date.now();
  if (_publicMatchesCache && now < _publicMatchesCache.expiresAt) {
    return _publicMatchesCache.data;
  }
  const data = await get<PublicMatchesBundle>("/api/public/matches");
  _publicMatchesCache = { data, expiresAt: now + 30_000 };
  return data;
}

// ============================================================
// AUTH
// ============================================================
export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const data = await post<AuthResponse>("/api/auth/login", { email, password });
    setToken(data.accessToken);
    return data;
  },

  register: async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
    ref?: string;
  }): Promise<AuthResponse> => {
    const data = await post<AuthResponse>("/api/auth/register", payload);
    setToken(data.accessToken);
    return data;
  },

  demoLogin: async (role: "USER" | "ADMIN" | "SUPER_ADMIN"): Promise<AuthResponse> => {
    const data = await post<AuthResponse>("/api/auth/demo-login", { role });
    setToken(data.accessToken);
    return data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const data = await post<AuthResponse>("/api/auth/refresh", undefined, true);
    setToken(data.accessToken);
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await post("/api/auth/logout", undefined, true);
    } finally {
      clearToken();
    }
  },
};

// ============================================================
// MATCHES — Public (no auth)
// FIX: all slice helpers now share one cached network call instead
// of each hitting /api/public/matches independently.
// ============================================================
export const matches = {
  /** Fetch the full bundle once; result is cached for 30 s. */
  all:      () => fetchPublicMatches(),
  today:    async () => (await fetchPublicMatches()).today,
  live:     async () => (await fetchPublicMatches()).live,
  upcoming: async () => (await fetchPublicMatches()).upcoming,
  future:   async () => (await fetchPublicMatches()).future,
  results:  async () => (await fetchPublicMatches()).results,

  featured: () => get<Match[]>("/api/public/matches/featured"),
  withOdds: () => get<Record<string, unknown>>("/api/public/matches/with-odds"),
  top6Live: () => get<Record<string, unknown>[]>("/api/public/matches/top6/live"),
  byId:     (id: string) => get<Match>(`/api/public/matches/${id}`),
  detail:   (id: string) => get<Record<string, unknown>>(`/api/public/matches/${id}/detail`),
  oddsAll:  (id: string) => get<AllOddsBundle>(`/api/public/matches/${id}/odds/all`),
  odds:     (id: string) => get<Record<string, unknown>[]>(`/api/public/matches/${id}/odds`),
  search: (q: string, type?: string) =>
    get<Record<string, unknown>>(
      `/api/public/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}`
    ),
  standings: (leaguePath: string) =>
    get<Record<string, unknown>[]>(`/api/public/standings/${leaguePath}`),
};

// ============================================================
// MATCHES — Authenticated
// ============================================================
export const matchesAuth = {
  today:    () => get<Match[]>("/api/matches/today", true),
  live:     () => get<Match[]>("/api/matches/live", true),
  upcoming: () => get<Match[]>("/api/matches/upcoming", true),
  future:   () => get<Match[]>("/api/matches/future", true),
  byId:     (id: string) => get<Match>(`/api/matches/${id}`, true),
  detail:   (id: string) => get<Record<string, unknown>>(`/api/matches/${id}/detail`, true),
  stats:    (id: string) => get<Record<string, unknown>>(`/api/matches/${id}/stats`, true),
  events:   (id: string) => get<Record<string, unknown>>(`/api/matches/${id}/events`, true),
  h2h:      (id: string) => get<Record<string, unknown>>(`/api/matches/${id}/h2h`, true),
  lineups:  (id: string) => get<Record<string, unknown>>(`/api/matches/${id}/lineups`, true),
  oddsLive: (id: string) => get<Record<string, unknown>[]>(`/api/matches/${id}/odds/live`, true),
  oddsApi:  (id: string) => get<Record<string, unknown>>(`/api/matches/${id}/odds/api`, true),
  oddsDb:   (id: string) => get<Odds[]>(`/api/matches/${id}/odds`, true),
  oddsAll:  (id: string) => get<AllOddsBundle>(`/api/matches/${id}/odds/all`, true),
  prediction: (id: string) => get<Record<string, unknown>>(`/api/matches/${id}/prediction`, true),
  streams:  (id: string) => get<Record<string, unknown>[]>(`/api/matches/${id}/streams`, true),
  standings: (leaguePath: string) =>
    get<Record<string, unknown>[]>(`/api/matches/standings/${leaguePath}`, true),
};

// ============================================================
// WALLET
// ============================================================
export const wallet = {
  get: () => get<Record<string, unknown>>("/api/wallet", true),
  transactions: (page = 0, size = 20) =>
    get<PageResponse<Transaction>>(`/api/wallet/transactions?page=${page}&size=${size}`, true),
  withdraw: (payload: Record<string, unknown>) =>
    post<Transaction>("/api/wallet/withdraw", payload, true),
  paystackInit: (payload: Record<string, unknown>) =>
    post<Record<string, unknown>>("/api/wallet/deposit/paystack/init", payload, true),
  stripeIntent: (payload: Record<string, unknown>) =>
    post<Record<string, unknown>>("/api/wallet/deposit/stripe/intent", payload, true),
};

// ============================================================
// BETS
// ============================================================
export const bets = {
  place:      (payload: PlaceBetRequest) => post<Bet>("/api/bets", payload, true),
  myBets:     (page = 0, size = 20) =>
    get<PageResponse<Bet>>(`/api/bets?page=${page}&size=${size}`, true),
  getOne:     (id: string) => get<Bet>(`/api/bets/${id}`, true),
  unseenWins: () => get<Bet[]>("/api/bets/unseen-wins", true),
  dismissWin: (id: string) => post<void>(`/api/bets/${id}/dismiss-win`, undefined, true),
};

// ============================================================
// VIP
// ============================================================
export const vip = {
  status:      () => get<VipStatusDto>("/api/vip/status", true),
  gifts:       () => get<VipGift[]>("/api/vip/gifts", true),
  subscribe:   () => post<VipMembership>("/api/vip/subscribe", undefined, true),
  consumeGift: (id: string) => post<VipGift>(`/api/vip/gifts/${id}/consume`, undefined, true),
};

// ============================================================
// PREDICTIONS
// ============================================================
export const predictions = {
  public: (page = 0, size = 20) =>
    get<PageResponse<AiPrediction>>(`/api/predictions/public?page=${page}&size=${size}`),
  tip: (id: string) => get<Record<string, unknown>>(`/api/tip/${id}`),
};

// ============================================================
// BOOKING CODES
// FIX: /api/booking/redeem has no @PreAuthorize — auth flag
// changed to false so we don't unnecessarily attach a Bearer token.
// ============================================================
export const booking = {
  redeem: (code: string) =>
    post<{
      booking: BookingCode;
      enrichedSelections: Record<string, unknown>[];
      currentTotalOdds: number;
    }>("/api/booking/redeem", { code }, false),
};

// ============================================================
// GAMES
// ============================================================
export const games = {
  currentRound: (game: string) =>
    get<Record<string, unknown>>(`/api/games/${game}/current-round`, true),
  history:  (limit = 20) => get<GameRound[]>(`/api/games/history?limit=${limit}`, true),
  play:     (game: string, payload: Record<string, unknown>) =>
    post<GameRound>(`/api/games/${game}/play`, payload, true),
  cashout:  (game: string, payload: Record<string, unknown>) =>
    post<Record<string, unknown>>(`/api/games/${game}/cashout`, payload, true),
};

// ============================================================
// USER PROFILE
// ============================================================
export const user = {
  me:     () => get<Record<string, unknown>>("/api/users/me", true),
  update: (payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    themePreference?: string;
  }) => patch<UserDto>("/api/users/me", payload, true),
};

// ============================================================
// ADMIN
// ============================================================
export const admin = {
  analytics: (range = "7d") =>
    get<Record<string, unknown>>(`/api/admin/analytics?range=${range}`, true),
  auditLog: (page = 0, size = 50) =>
    get<PageResponse<Record<string, unknown>>>(`/api/admin/audit-log?page=${page}&size=${size}`, true),
  referredUsers:      () => get<Referral[]>("/api/admin/referred-users", true),
  referralLinks:      () => get<ReferralLink[]>("/api/admin/referral-links", true),
  createReferralLink: (payload: Record<string, unknown>) =>
    post<ReferralLink>("/api/admin/referral-links", payload, true),
  payoutWindow:  () => get<Record<string, boolean>>("/api/admin/payout-window", true),
  requestPayout: () => post<PayoutRequest>("/api/admin/payout-request", undefined, true),
  payoutHistory: (page = 0, size = 20) =>
    get<PageResponse<PayoutRequest>>(`/api/admin/payout-requests?page=${page}&size=${size}`, true),
  predictions: (page = 0, size = 20) =>
    get<PageResponse<AiPrediction>>(`/api/admin/predictions?page=${page}&size=${size}`, true),
  runPrediction:       (payload: Record<string, string>) =>
    post<AiPrediction>("/api/admin/predictions/run", payload, true),
  sharePrediction:     (id: string) =>
    post<AiPrediction>(`/api/admin/predictions/${id}/share`, undefined, true),
  unpublishPrediction: (id: string) =>
    post<AiPrediction>(`/api/admin/predictions/${id}/unpublish`, undefined, true),
  bookingCodes: (page = 0, size = 20) =>
    get<PageResponse<BookingCode>>(`/api/admin/booking-codes?page=${page}&size=${size}`, true),
  bookingCodeDetail: (id: string) =>
    get<BookingCode>(`/api/admin/booking-codes/${id}`, true),
  createBookingCode: (payload: {
    kind: string;
    label: string;
    currency: string;
    stake: number;
    selections: Record<string, unknown>[];
    maxRedemptions?: number;
    expiresAt: string;
  }) => post<BookingCode>("/api/admin/booking-codes", payload, true),
  crashSchedule: (game: string, limit = 10) =>
    get<GameCrashSchedule[]>(`/api/admin/crash/schedule/${game}?limit=${limit}`, true),
  crashHistory: (game: string, page = 0, size = 50) =>
    get<PageResponse<GameCrashSchedule>>(
      `/api/admin/crash/history/${game}?page=${page}&size=${size}`,
      true
    ),
  generateCrashSchedule: (game: string) =>
    post<void>(`/api/admin/crash/schedule/${game}/generate`, undefined, true),
  overrideCrash: (id: string, payload: Record<string, unknown>) =>
    patch<GameCrashSchedule>(`/api/admin/crash/schedule/${id}/override`, payload, true),
};

// ============================================================
// SUPER ADMIN
// ============================================================
export const superAdmin = {
  metrics:     () => get<Record<string, unknown>>("/api/super-admin/metrics", true),
  admins:      () => get<Record<string, unknown>[]>("/api/super-admin/admins", true),
  auditLog:    (page = 0, size = 50) =>
    get<PageResponse<Record<string, unknown>>>(`/api/super-admin/audit-log?page=${page}&size=${size}`, true),
  predictions: (page = 0, size = 50) =>
    get<PageResponse<AiPrediction>>(`/api/super-admin/predictions?page=${page}&size=${size}`, true),
  pendingPayouts: () => get<PayoutRequest[]>("/api/super-admin/payout-requests", true),
  approvePayout:  (id: string) =>
    post<PayoutRequest>(`/api/super-admin/payout-requests/${id}/approve`, undefined, true),
  rejectPayout:   (id: string, reason: string) =>
    post<PayoutRequest>(`/api/super-admin/payout-requests/${id}/reject`, { reason }, true),
  markPaidPayout: (id: string) =>
    post<PayoutRequest>(`/api/super-admin/payout-requests/${id}/mark-paid`, undefined, true),
  grantVip:    (payload: Record<string, unknown>) =>
    post<VipMembership>("/api/super-admin/vip/grant", payload, true),
  createAdmin: (payload: Record<string, string>) =>
    post<Record<string, unknown>>("/api/super-admin/admins", payload, true),
};

// ============================================================
// CONFIG
// ============================================================
export const config = {
  get: () => get<Record<string, unknown>>("/api/public/config"),
};

// ============================================================
// STANDINGS / SCORERS
// ============================================================
export const standings = {
  bsd: (leagueId: number) =>
    get<Record<string, unknown>>(`/api/standings/bsd/${leagueId}`, true),
  footballData: (code: string, season: string) =>
    get<Record<string, unknown>>(`/api/standings/football-data/${code}/${season}`, true),
  topScorers: (code: string, season: string) =>
    get<Record<string, unknown>>(`/api/scorers/${code}/${season}`, true),
};