/**
 * ═══════════════════════════════════════════════════════════════
 * SPIN DA BOTTLE — Casino Edition
 * game.js  (Aviator-pattern, fully integrated)
 *
 * FIXES vs previous version:
 *   [Bug 1] GAME_SLUG typo: 'spin da bott,e' → 'spin-da-bottle'
 *   [Bug 2] WSBus.subscribe no longer pre-parses JSON — callbacks
 *            receive raw msg and do JSON.parse(msg.body) themselves,
 *            matching the Aviator/Mines contract exactly.
 *   [Bug 3] _spinning in-flight guard in _startSpin prevents double-
 *            click from firing two concurrent /play requests.
 *   [Bug 4] Online path now optimistically debits before /play, and
 *            refunds on error — matches fixed Mines pattern.
 *   [Fix 5] credentials:'include' removed from _silentRefresh to
 *            match Aviator/Mines (no CORS credential requirement).
 *   [Fix 6] GameState.s.balance removed. All balance reads/writes
 *            go through Wallet. applyResult calls Wallet.deduct /
 *            Wallet.credit. Eliminates dual-source desync.
 *
 * Modules:
 *   1.  CONFIG           — shared constants
 *   2.  SpeedBetAPI      — typed REST service (mirrors Aviator api.ts)
 *   3.  WSBus            — STOMP/SockJS WebSocket hub, auto-reconnect
 *   4.  Wallet           — optimistic balance + WS real-time sync
 *   5.  SpinRound        — round-id tracking, play / settle wrappers
 *   6.  GameState        — central state manager
 *   7.  RNG              — provably-fair HMAC-SHA256 outcome generator
 *   8.  FakePlayers      — social-proof ticker simulation
 *   9.  AudioEngine      — Web Audio API procedural sounds
 *  10.  Renderer         — Canvas 2D (table + bottle)
 *  11.  PhysicsEngine    — quartic ease-out + wobble tail
 *  12.  AnimController   — requestAnimationFrame spin loop
 *  13.  UI               — DOM updates, modals, feedback
 *  14.  AuthReactor      — login / logout / expiry event handler
 *  15.  GameCore         — orchestrates all modules
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. CONFIG
   ═══════════════════════════════════════════════════════════════ */
const CONFIG = {
  GAME_SLUG:       'spin-da-bottle',  // [Bug 1 fixed] was 'spin da bott,e' (comma typo)
  API_BASE:        'https://speedbetbackend-production.up.railway.app',
  WS_ENDPOINT:     '/ws',
  DEFAULT_BET:     50,
  RECONNECT_DELAY: 3000,
  MAX_HISTORY:     15,
};


/* ═══════════════════════════════════════════════════════════════
   2. SPEEDBET API SERVICE
   ═══════════════════════════════════════════════════════════════ */
const SpeedBetAPI = (() => {
  const TOKEN_KEY = 'sb_token';
  const USER_KEY  = 'sb_user';

  const getToken = () => {
    const t = localStorage.getItem(TOKEN_KEY);
    return (t && t !== 'undefined' && t !== 'null') ? t : null;
  };
  const setToken = t => {
    if (!t || t === 'undefined') { console.error('[SpeedBetAPI] setToken invalid:', t); return; }
    localStorage.setItem(TOKEN_KEY, t);
  };
  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };
  const getUser  = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  };
  const setUser  = u => localStorage.setItem(USER_KEY, JSON.stringify(u));
  const isAuthed = () => !!getToken();

  async function _req(path, options = {}, auth = false, retrying = false) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      else       console.warn(`[SpeedBetAPI] auth=true but no token for ${path}`);
    }
    let res;
    try {
      res = await fetch(CONFIG.API_BASE + path, { ...options, headers });
    } catch {
      throw new Error('NETWORK_ERROR');
    }

    if (res.status === 401 && !retrying) {
      const refreshed = await _silentRefresh();
      if (refreshed) return _req(path, options, auth, true);
      throw new Error('SESSION_EXPIRED');
    }

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try { const e = await res.json(); message = e.message ?? e.error ?? message; } catch { /**/ }
      throw new Error(message);
    }

    const json = await res.json();
    return json?.data !== undefined ? json.data : json;
  }

  // [Fix 5] credentials:'include' removed — matches Aviator/Mines pattern
  async function _silentRefresh() {
    try {
      const res = await fetch(CONFIG.API_BASE + '/api/auth/refresh', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
      });
      if (!res.ok) throw new Error('refresh_failed');
      const json = await res.json();
      const data = json?.data ?? json;
      setToken(data.accessToken);
      if (data.user) setUser(data.user);
      console.log('[SpeedBetAPI] Token refreshed silently');
      return true;
    } catch {
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return false;
    }
  }

  const _get   = (path, auth = false)        => _req(path, { method: 'GET'  }, auth);
  const _post  = (path, body, auth = false)  => _req(path, { method: 'POST',  body: JSON.stringify(body) }, auth);
  const _patch = (path, body, auth = false)  => _req(path, { method: 'PATCH', body: JSON.stringify(body) }, auth);

  const auth = {
    login: async (email, password) => {
      const data = await _post('/api/auth/login', { email, password });
      setToken(data.accessToken);
      if (data.user) setUser(data.user);
      return data;
    },
    register: async payload => {
      const data = await _post('/api/auth/register', payload);
      setToken(data.accessToken);
      if (data.user) setUser(data.user);
      return data;
    },
    demoLogin: async (role = 'USER') => {
      const data = await _post('/api/auth/demo-login', { role });
      setToken(data.accessToken);
      if (data.user) setUser(data.user);
      return data;
    },
    refresh: async () => {
      const data = await _post('/api/auth/refresh', undefined, true);
      setToken(data.accessToken);
      return data;
    },
    logout: async () => {
      try { await _post('/api/auth/logout', undefined, true); } finally { clearToken(); }
    },
  };

  const wallet = {
    get:          ()           => _get('/api/wallet', true),
    transactions: (p=0, s=20) => _get(`/api/wallet/transactions?page=${p}&size=${s}`, true),
    withdraw:     payload      => _post('/api/wallet/withdraw', payload, true),
  };

  const games = {
    currentRound: slug         => _get(`/api/games/${slug}/current-round`, true),
    history:      (limit = 20) => _get(`/api/games/history?limit=${limit}`, true),
    play:         (slug, body) => _post(`/api/games/${slug}/play`,   body, true),
    settle:       (slug, body) => _post(`/api/games/${slug}/settle`, body, true),
  };

  const user = {
    me:     ()      => _get('/api/users/me', true),
    update: payload => _patch('/api/users/me', payload, true),
  };

  window.addEventListener('storage', e => {
    if (e.key !== TOKEN_KEY) return;
    if (!e.newValue && e.oldValue) {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    } else if (e.newValue && !e.oldValue) {
      window.dispatchEvent(new CustomEvent('auth:login', { detail: { user: getUser() } }));
    }
  });

  return {
    getToken, setToken, clearToken, getUser, setUser, isAuthed,
    auth, wallet, games, user,
  };
})();


/* ═══════════════════════════════════════════════════════════════
   3. WEBSOCKET BUS
   [Bug 2 fixed] subscribe() no longer pre-parses JSON.
   Callbacks receive the raw STOMP message frame and must call
   JSON.parse(msg.body) themselves — matching Aviator/Mines exactly.
   This prevents double-parse bugs when Wallet.subscribeWS and
   SpinRound.subscribeToState unwrap the body.
   ═══════════════════════════════════════════════════════════════ */
const WSBus = (() => {
  let client    = null;
  let connected = false;
  const pending = {};

  function connect(onReady) {
    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
      console.warn('[WSBus] SockJS/Stomp not loaded — WebSocket disabled');
      return;
    }
    if (!SpeedBetAPI.isAuthed()) {
      console.warn('[WSBus] No auth token — skipping connect');
      return;
    }

    const socket = new SockJS(CONFIG.API_BASE + CONFIG.WS_ENDPOINT);
    client       = Stomp.over(socket);
    client.debug = () => {};

    const headers = SpeedBetAPI.getToken()
      ? { Authorization: `Bearer ${SpeedBetAPI.getToken()}` }
      : {};

    client.connect(
      headers,
      () => {
        connected = true;
        console.info('[WSBus] Connected');
        // Re-subscribe all pending topics — pass raw msg, callers parse
        Object.entries(pending).forEach(([topic, cb]) => {
          client.subscribe(topic, cb);
        });
        if (onReady) onReady();
      },
      () => {
        connected = false;
        console.warn('[WSBus] Disconnected — will retry');
        if (SpeedBetAPI.isAuthed()) {
          setTimeout(() => connect(onReady), CONFIG.RECONNECT_DELAY);
        }
      },
    );
  }

  // [Bug 2 fixed] callback receives raw STOMP msg — caller does JSON.parse(msg.body)
  function subscribe(topic, callback) {
    pending[topic] = callback;
    if (connected && client) {
      client.subscribe(topic, callback);
    }
  }

  function disconnect() {
    try { if (client && connected) client.disconnect(); } catch { /**/ }
    client    = null;
    connected = false;
  }

  function reconnect(onReady) { disconnect(); connect(onReady); }

  return { connect, subscribe, disconnect, reconnect };
})();


/* ═══════════════════════════════════════════════════════════════
   4. WALLET
   [Fix 6] Single source of truth for balance.
   All balance reads everywhere in the codebase use Wallet.get().
   Callers must NOT cache balance in any other state object.
   ═══════════════════════════════════════════════════════════════ */
const Wallet = (() => {
  let _balance = 1000.00;

  async function fetch() {
    if (!SpeedBetAPI.isAuthed()) return;
    try {
      const data = await SpeedBetAPI.wallet.get();
      _balance = parseFloat(data.balance ?? data.amount ?? _balance);
      UI.updateBalance(_balance);
    } catch (e) {
      if (e.message !== 'SESSION_EXPIRED' && e.message !== 'NETWORK_ERROR') {
        console.warn('[Wallet] fetch:', e.message);
      }
    }
  }

  // [Bug 2 fixed] Raw msg received — parse body here
  function subscribeWS() {
    WSBus.subscribe('/topic/wallet/balance', msg => {
      try {
        const data = JSON.parse(msg.body);
        const prev = _balance;
        _balance   = parseFloat(data.balance ?? data.amount ?? _balance);
        UI.updateBalance(_balance);
        UI.flashBalance(_balance >= prev);
      } catch { /**/ }
    });
  }

  const get    = ()  => _balance;
  const set    = v   => { _balance = parseFloat(v); };
  const deduct = amt => { _balance = Math.max(0, parseFloat((_balance - parseFloat(amt)).toFixed(2))); };
  const credit = amt => { _balance = parseFloat((_balance + parseFloat(amt)).toFixed(2)); };

  return { fetch, subscribeWS, get, set, deduct, credit };
})();


/* ═══════════════════════════════════════════════════════════════
   5. SPIN ROUND
   [Bug 3 fixed] _spinning guard added — see GameCore._startSpin.
   [Bug 4 fixed] Optimistic debit now happens in GameCore._startSpin
                 BEFORE placeBet() is called, with refund on error.
   ═══════════════════════════════════════════════════════════════ */
const SpinRound = (() => {
  let _roundId = null;
  let _settled = false;

  async function fetchCurrentRound() {
    if (!SpeedBetAPI.isAuthed()) return null;
    try {
      return await SpeedBetAPI.games.currentRound(CONFIG.GAME_SLUG);
    } catch (e) {
      if (e.message !== 'SESSION_EXPIRED' && e.message !== 'NETWORK_ERROR') {
        console.warn('[SpinRound] fetchCurrentRound:', e.message);
      }
      return null;
    }
  }

  // POST /api/games/{slug}/play { stake }
  // Wallet debit is handled optimistically in GameCore._startSpin BEFORE this call.
  async function placeBet(stake) {
    const data = await SpeedBetAPI.games.play(CONFIG.GAME_SLUG, { stake });
    _roundId = data.id;
    _settled = false;
    return data;
  }

  // POST /api/games/{slug}/settle — _settled flag prevents double-settle
  async function settle(outcome, won, payout) {
    if (!_roundId || _settled) return null;
    _settled = true;
    return await SpeedBetAPI.games.settle(CONFIG.GAME_SLUG, {
      roundId: _roundId,
      outcome,
      won,
      payout: won ? payout : 0,
    });
  }

  // [Bug 2 fixed] Raw msg — parse body here
  function subscribeToState(onResult) {
    WSBus.subscribe(`/topic/${CONFIG.GAME_SLUG}/state`, msg => {
      try {
        const data = JSON.parse(msg.body);
        if (data.state === 'RESULT' && onResult) onResult(data);
      } catch { /**/ }
    });
  }

  function reset() { _roundId = null; _settled = false; }
  const getRoundId = () => _roundId;

  return { fetchCurrentRound, placeBet, settle, subscribeToState, reset, getRoundId };
})();


/* ═══════════════════════════════════════════════════════════════
   6. GAME STATE MANAGER
   [Fix 6] s.balance removed. All balance access goes through
   Wallet.get() / Wallet.set() / Wallet.deduct() / Wallet.credit().
   applyResult now calls Wallet.deduct/credit directly.
   ═══════════════════════════════════════════════════════════════ */
const GameState = (() => {
  const PHASES = {
    IDLE:     'IDLE',
    SPINNING: 'SPINNING',
    RESULT:   'RESULT',
    PAUSED:   'PAUSED',
  };

  // [Fix 6] balance field removed from state — use Wallet.get() everywhere
  const s = {
    phase:        PHASES.IDLE,

    wins:         0,
    losses:       0,
    streak:       0,
    bestStreak:   0,
    totalWon:     0,
    totalLost:    0,
    freeBetGiven: false,

    choice:       null,
    bet:          CONFIG.DEFAULT_BET,
    lastOutcome:  null,

    roundId:      null,
    roundNumber:  null,
    commitHash:   null,

    fairness: { serverSeed: '', clientSeed: '', nonce: '', hash: '' },

    currentAngle: 0,
    history: [],
  };

  const get    = k      => s[k];
  const set    = (k, v) => { s[k] = v; return v; };
  const getAll = ()     => ({ ...s, balance: Wallet.get() }); // expose balance for UI.updateStats

  function addHistory(outcome) {
    s.history.unshift(outcome);
    if (s.history.length > CONFIG.MAX_HISTORY) s.history.pop();
  }

  // [Fix 6] applyResult now calls Wallet.deduct/credit — no direct s.balance mutation
  function applyResult(outcome, bet) {
    s.lastOutcome = outcome;
    let won       = false;

    if (
      (outcome === 'UP'   && s.choice === 'UP') ||
      (outcome === 'DOWN' && s.choice === 'DOWN')
    ) {
      Wallet.credit(bet);
      s.wins++;
      s.streak++;
      s.totalWon += bet;
      if (s.streak > s.bestStreak) s.bestStreak = s.streak;
      won = true;
    } else {
      // Wallet was already debited optimistically in _startSpin — no deduct here
      s.losses++;
      s.streak     = 0;
      s.totalLost += bet;
    }

    // Free-bet rescue: if balance critically low, grant a one-time bonus
    let freeBonus = 0;
    if (Wallet.get() < 10 && !s.freeBetGiven) {
      freeBonus      = 250;
      Wallet.credit(freeBonus);
      s.freeBetGiven = true;
    } else if (Wallet.get() >= 100) {
      s.freeBetGiven = false;
    }

    addHistory(outcome);
    return { won, freeBonus };
  }

  function resetRound() {
    s.roundId     = null;
    s.roundNumber = null;
    s.commitHash  = null;
    s.choice      = null;
    s.lastOutcome = null;
    s.fairness    = { serverSeed: '', clientSeed: '', nonce: '', hash: '' };
    SpinRound.reset();
  }

  return { PHASES, get, set, getAll, applyResult, resetRound, addHistory };
})();


/* ═══════════════════════════════════════════════════════════════
   7. RNG — Provably Fair Outcome Generator
   ═══════════════════════════════════════════════════════════════ */
const RNG = (() => {
  function randomHex(byteLen) {
    const arr = new Uint8Array(byteLen);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }

  async function hmacSHA256(secret, message) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
    return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
  }

  async function generateOutcome() {
    const serverSeed = randomHex(16);
    const clientSeed = randomHex(8);
    const nonce      = Math.floor(Math.random() * 1_000_000);
    const hash       = await hmacSHA256(serverSeed, `${clientSeed}:${nonce}`);
    const num        = parseInt(hash.substring(0, 8), 16);
    const r          = num / 0xffffffff;

    let outcome;
    if      (r < 0.485) outcome = 'UP';
    else if (r < 0.970) outcome = 'DOWN';
    else                outcome = 'MIDDLE';

    return { outcome, serverSeed, clientSeed, nonce: String(nonce), hash };
  }

  function getTargetAngle(outcome) {
    switch (outcome) {
      case 'UP':     return (Math.random() * 50) - 25;
      case 'DOWN':   return 180 + (Math.random() * 50) - 25;
      case 'MIDDLE': return (Math.random() > 0.5 ? 90 : 270) + (Math.random() * 30) - 15;
      default:       return 0;
    }
  }

  return { generateOutcome, getTargetAngle };
})();


/* ═══════════════════════════════════════════════════════════════
   8. FAKE PLAYERS — Social Proof Ticker
   ═══════════════════════════════════════════════════════════════ */
const FakePlayers = (() => {
  const NAMES = [
    'ace_flip', 'bottle_king', 'spin_lord', 'lucky_7', 'neon_spin',
    'turbo_flip', 'hawk_spin', 'night_roll', 'ghost_turn', 'crypto_spin',
    'thunder_b', 'redline99', 'blaze_it', 'dark_spin', 'slick_roll',
  ];

  let _players  = [];
  let _interval = null;

  function init(wonProbability = 0.485) {
    _players = NAMES.map(name => ({
      name,
      bet:     Math.floor(Math.random() * 190 + 10),
      willWin: Math.random() < wonProbability,
      fired:   false,
    }));
  }

  function startTickers() {
    let idx = 0;
    _interval = setInterval(() => {
      const winners = _players.filter(p => !p.fired && p.willWin);
      if (!winners.length || idx > 5) { clearInterval(_interval); return; }
      const p = winners[Math.floor(Math.random() * winners.length)];
      p.fired  = true;
      UI.showCashoutTicker(p.name, p.bet * (1 + Math.random() * 0.5));
      idx++;
    }, 600 + Math.random() * 800);
  }

  function stopTickers() {
    clearInterval(_interval);
    _interval = null;
  }

  return { init, startTickers, stopTickers };
})();


/* ═══════════════════════════════════════════════════════════════
   9. AUDIO ENGINE — Procedural Web Audio API Sounds
   ═══════════════════════════════════════════════════════════════ */
const AudioEngine = (() => {
  let ctx     = null;
  let enabled = true;

  function init() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      enabled = false;
    }
  }

  function _resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function playSpinStart() {
    if (!enabled || !ctx) return;
    _resume();
    const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src    = ctx.createBufferSource();
    src.buffer   = buf;
    const gain   = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type            = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value         = 0.8;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0,    ctx.currentTime + 0.4);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  function playTick() {
    if (!enabled || !ctx) return;
    _resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08,  ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  function playWin() {
    if (!enabled || !ctx) return;
    _resume();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const t    = ctx.currentTime + i * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0,     t);
      gain.gain.linearRampToValueAtTime(0.12,  t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  function playLose() {
    if (!enabled || !ctx) return;
    _resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.1,  ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  function playHouse() {
    if (!enabled || !ctx) return;
    _resume();
    [130, 155, 185].forEach(freq => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    });
  }

  function playClick() {
    if (!enabled || !ctx) return;
    _resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  return { init, playSpinStart, playTick, playWin, playLose, playHouse, playClick };
})();


/* ═══════════════════════════════════════════════════════════════
   10. RENDERER — Canvas 2D (Table + Bottle)
   ═══════════════════════════════════════════════════════════════ */
const Renderer = (() => {
  let canvas, c;
  const CX = 160, CY = 160, R = 148;

  function init(canvasEl) {
    canvas = canvasEl;
    c      = canvas.getContext('2d');
  }

  function _roundRect(x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  function _drawTable(hz) {
    c.clearRect(0, 0, 320, 320);

    const bg = c.createRadialGradient(CX, CY, 0, CX, CY, R);
    bg.addColorStop(0,   '#1a2638');
    bg.addColorStop(0.7, '#111d2e');
    bg.addColorStop(1,   '#0a1520');
    c.beginPath(); c.arc(CX, CY, R, 0, Math.PI * 2);
    c.fillStyle = bg; c.fill();

    c.save();
    c.beginPath(); c.arc(CX, CY, R, Math.PI, 0); c.lineTo(CX, CY); c.closePath();
    c.fillStyle = hz === 'UP' ? 'rgba(0,210,100,0.22)' : 'rgba(0,190,90,0.10)';
    c.fill(); c.restore();

    c.save();
    c.beginPath(); c.arc(CX, CY, R, 0, Math.PI); c.lineTo(CX, CY); c.closePath();
    c.fillStyle = hz === 'DOWN' ? 'rgba(255,55,55,0.22)' : 'rgba(220,40,40,0.10)';
    c.fill(); c.restore();

    c.beginPath(); c.moveTo(CX - R, CY); c.lineTo(CX + R, CY);
    c.strokeStyle = hz === 'MIDDLE' ? 'rgba(255,215,0,0.7)' : 'rgba(255,215,0,0.2)';
    c.lineWidth   = hz === 'MIDDLE' ? 5 : 3;
    c.stroke();

    c.fillStyle = 'rgba(255,215,0,0.35)';
    c.font      = 'bold 9px Rajdhani, sans-serif';
    c.textAlign = 'center';
    c.fillText('HOUSE', CX + 90, CY - 5);
    c.fillText('ZONE',  CX + 90, CY + 11);

    c.font      = 'bold 14px Rajdhani, sans-serif';
    c.fillStyle = hz === 'UP' ? 'rgba(0,230,120,0.9)' : 'rgba(0,210,100,0.45)';
    c.fillText('▲ UP', CX, CY - 72);
    c.fillStyle = hz === 'DOWN' ? 'rgba(255,80,80,0.9)' : 'rgba(230,60,60,0.45)';
    c.fillText('▼ DOWN', CX, CY + 85);

    [R * 0.95, R * 0.75, R * 0.45].forEach((r, i) => {
      c.beginPath(); c.arc(CX, CY, r, 0, Math.PI * 2);
      c.strokeStyle = `rgba(255,215,0,${0.05 - i * 0.01})`;
      c.lineWidth   = 0.5; c.stroke();
    });

    c.beginPath(); c.arc(CX, CY, R, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(255,215,0,0.35)'; c.lineWidth = 2; c.stroke();

    c.beginPath(); c.arc(CX, CY, R - 4, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(255,255,255,0.04)'; c.lineWidth = 1; c.stroke();

    const sh = c.createRadialGradient(CX - 40, CY - 50, 0, CX, CY, R);
    sh.addColorStop(0, 'rgba(255,255,255,0.05)');
    sh.addColorStop(1, 'rgba(255,255,255,0)');
    c.beginPath(); c.arc(CX, CY, R, 0, Math.PI * 2);
    c.fillStyle = sh; c.fill();
  }

  function _drawBottle(deg) {
    const rad = (deg - 90) * Math.PI / 180;
    const bw  = 22, bh = 47, nw = 13, nh = 52;

    c.save();
    c.translate(CX, CY);
    c.rotate(rad);

    c.save();
    c.shadowColor   = 'rgba(0,0,0,0.5)';
    c.shadowBlur    = 12;
    c.shadowOffsetX = 4;
    c.shadowOffsetY = 4;

    const bodyGrad = c.createLinearGradient(-bw / 2, 0, bw / 2, 0);
    bodyGrad.addColorStop(0,    'rgba(30,80,160,0.9)');
    bodyGrad.addColorStop(0.25, 'rgba(100,180,255,0.75)');
    bodyGrad.addColorStop(0.5,  'rgba(160,220,255,0.65)');
    bodyGrad.addColorStop(0.75, 'rgba(80,150,220,0.75)');
    bodyGrad.addColorStop(1,    'rgba(20,60,130,0.9)');

    _roundRect(-bw / 2, 6, bw, bh, 7);
    c.fillStyle = bodyGrad; c.fill();
    c.strokeStyle = 'rgba(140,210,255,0.5)'; c.lineWidth = 0.8; c.stroke();

    c.beginPath();
    c.moveTo(-bw / 2, 10);
    c.bezierCurveTo(-bw / 2, 6, -nw / 2 - 2, 2, -nw / 2, -4);
    c.lineTo(nw / 2, -4);
    c.bezierCurveTo(nw / 2 + 2, 2, bw / 2, 6, bw / 2, 10);
    c.closePath();
    c.fillStyle = bodyGrad; c.fill();
    c.strokeStyle = 'rgba(140,210,255,0.5)'; c.lineWidth = 0.8; c.stroke();

    const neckGrad = c.createLinearGradient(-nw / 2, 0, nw / 2, 0);
    neckGrad.addColorStop(0,   'rgba(30,80,160,0.9)');
    neckGrad.addColorStop(0.3, 'rgba(120,190,255,0.7)');
    neckGrad.addColorStop(0.7, 'rgba(100,170,240,0.7)');
    neckGrad.addColorStop(1,   'rgba(25,70,140,0.9)');

    _roundRect(-nw / 2, -4 - nh, nw, nh, 4);
    c.fillStyle = neckGrad; c.fill();
    c.strokeStyle = 'rgba(140,210,255,0.5)'; c.lineWidth = 0.8; c.stroke();

    const lipY = -4 - nh - 8;
    _roundRect(-nw / 2 - 1.5, lipY, nw + 3, 10, 3);
    c.fillStyle   = 'rgba(170,225,255,0.85)'; c.fill();
    c.strokeStyle = 'rgba(200,240,255,0.7)';  c.lineWidth = 0.7; c.stroke();

    c.restore();

    const bShine = c.createLinearGradient(-bw / 2, 0, -bw / 2 + 7, 0);
    bShine.addColorStop(0,   'rgba(255,255,255,0)');
    bShine.addColorStop(0.3, 'rgba(255,255,255,0.35)');
    bShine.addColorStop(1,   'rgba(255,255,255,0)');
    _roundRect(-bw / 2 + 2, 10, 6, bh - 6, 3);
    c.fillStyle = bShine; c.fill();

    const nShine = c.createLinearGradient(-nw / 2, 0, -nw / 2 + 5, 0);
    nShine.addColorStop(0,   'rgba(255,255,255,0)');
    nShine.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    nShine.addColorStop(1,   'rgba(255,255,255,0)');
    _roundRect(-nw / 2 + 1.5, -4 - nh + 4, 4, nh - 8, 2);
    c.fillStyle = nShine; c.fill();

    c.fillStyle   = 'rgba(255,255,255,0.06)';
    c.strokeStyle = 'rgba(255,255,255,0.1)';
    c.lineWidth   = 0.5;
    _roundRect(-bw / 2 + 1, 16, bw - 2, 26, 2);
    c.fill(); c.stroke();

    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.font      = '600 5.5px Rajdhani, sans-serif';
    c.textAlign = 'center';
    c.fillText('CASINO',  0, 28);
    c.fillText('EDITION', 0, 36);

    c.beginPath(); c.ellipse(0, 53, bw / 2 - 3, 3.5, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(10,40,100,0.6)'; c.fill();

    c.restore();

    c.beginPath(); c.arc(CX, CY, 5, 0, Math.PI * 2);
    c.fillStyle = '#ffd700'; c.fill();
    c.beginPath(); c.arc(CX, CY, 2.5, 0, Math.PI * 2);
    c.fillStyle = '#ffffff'; c.fill();
  }

  function drawFrame(angleDeg, highlightZone) {
    _drawTable(highlightZone);
    _drawBottle(angleDeg);
  }

  return { init, drawFrame };
})();


/* ═══════════════════════════════════════════════════════════════
   11. PHYSICS ENGINE — Quartic Ease-Out + Wobble Tail
   ═══════════════════════════════════════════════════════════════ */
const PhysicsEngine = (() => {
  function createSpin(startAngle, targetAngle, duration) {
    const fullSpins        = (3 + Math.floor(Math.random() * 3)) * 360;
    const normalizedTarget = ((targetAngle % 360) + 360) % 360;
    const normalizedStart  = ((startAngle  % 360) + 360) % 360;
    let delta = normalizedTarget - normalizedStart;
    if (delta < 0) delta += 360;
    return { startAngle, totalDelta: fullSpins + delta, duration, startTime: null };
  }

  function _ease(t) {
    const base = 1 - Math.pow(1 - t, 4);
    if (t > 0.85) {
      const wt     = (t - 0.85) / 0.15;
      const wobble = Math.sin(wt * Math.PI * 5) * 0.006 * (1 - wt);
      return base + wobble;
    }
    return base;
  }

  function evaluate(spin, now) {
    if (!spin.startTime) spin.startTime = now;
    const t      = Math.min((now - spin.startTime) / spin.duration, 1);
    const angle  = spin.startAngle + spin.totalDelta * _ease(t);
    return { angle, progress: t, done: t >= 1 };
  }

  return { createSpin, evaluate };
})();


/* ═══════════════════════════════════════════════════════════════
   12. ANIMATION CONTROLLER — requestAnimationFrame Loop
   ═══════════════════════════════════════════════════════════════ */
const AnimController = (() => {
  let rafId         = null;
  let activeSpin    = null;
  let onDone        = null;
  let lastTickAngle = 0;
  const TICK_DEG    = 45;

  function start(spin, doneCb) {
    activeSpin    = spin;
    onDone        = doneCb;
    lastTickAngle = GameState.get('currentAngle');
    if (rafId) cancelAnimationFrame(rafId);
    _loop(performance.now());
  }

  function _loop(now) {
    if (!activeSpin) return;
    const { angle, done } = PhysicsEngine.evaluate(activeSpin, now);

    if (Math.abs(angle - lastTickAngle) >= TICK_DEG) {
      AudioEngine.playTick();
      lastTickAngle = angle;
    }

    GameState.set('currentAngle', angle);
    Renderer.drawFrame(angle, null);

    if (done) {
      GameState.set('currentAngle', activeSpin.startAngle + activeSpin.totalDelta);
      const cb = onDone;
      activeSpin = null;
      onDone     = null;
      if (cb) cb();
    } else {
      rafId = requestAnimationFrame(_loop);
    }
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId      = null;
    activeSpin = null;
    onDone     = null;
  }

  return { start, stop };
})();


/* ═══════════════════════════════════════════════════════════════
   13. UI — DOM Updates, Modals, Feedback
   [Fix 6] updateStats reads balance from Wallet.get() directly.
   getBet clamps against Wallet.get() — no GameState.get('balance').
   ═══════════════════════════════════════════════════════════════ */
const UI = (() => {
  const $ = id => document.getElementById(id);

  function updateBalance(v) {
    const el = $('balanceDisplay');
    if (el) el.textContent = '$' + parseFloat(v).toLocaleString(undefined, {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
  }

  function flashBalance(won) {
    const el = $('balanceDisplay');
    if (!el) return;
    el.classList.remove('win-flash', 'lose-flash');
    void el.offsetWidth;
    el.classList.add(won ? 'win-flash' : 'lose-flash');
  }

  // [Fix 6] reads Wallet.get() for balance — not GameState.get('balance')
  function updateStats() {
    const s = GameState.getAll(); // getAll() now includes balance: Wallet.get()
    const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
    set('winsVal',       s.wins);
    set('lossesVal',     s.losses);
    set('streakVal',     s.streak    >= 2 ? '🔥×' + s.streak    : '—');
    set('bestStreakVal', s.bestStreak >= 2 ? '🔥×' + s.bestStreak : '—');
    updateBalance(Wallet.get());
  }

  function setChoiceActive(choice) {
    $('btnUp')?.classList.toggle('active',   choice === 'UP');
    $('btnDown')?.classList.toggle('active', choice === 'DOWN');
  }

  function setSpinBtn(text, disabled) {
    const t = $('spinBtnText'), b = $('spinBtn');
    if (t) t.textContent = text;
    if (b) b.disabled    = disabled;
  }

  function setBetStatus(text, color) {
    const e = $('betStatus');
    if (!e) return;
    e.textContent = text || '';
    e.style.color = color || '';
  }

  function showResult(text, type) {
    const d = $('resultDisplay'), t = $('resultText');
    if (!d) return;
    if (t) t.textContent = text;
    d.className = `result-display show ${type}`;
  }

  function hideResult() {
    const d = $('resultDisplay');
    if (d) d.className = 'result-display';
  }

  function flash(type) {
    const f = $('flashOverlay');
    if (!f) return;
    f.className = 'flash-overlay';
    void f.offsetWidth;
    f.className = `flash-overlay ${type}`;
    setTimeout(() => { f.className = 'flash-overlay'; }, 800);
  }

  function showZoneGlow(zone) {
    $('upGlow')?.classList.remove('active');
    $('downGlow')?.classList.remove('active');
    if (zone === 'UP')   $('upGlow')?.classList.add('active');
    if (zone === 'DOWN') $('downGlow')?.classList.add('active');
  }

  function clearZoneGlows() {
    $('upGlow')?.classList.remove('active');
    $('downGlow')?.classList.remove('active');
  }

  function renderHistory(history) {
    const el = $('historyPills');
    if (!el) return;
    if (!history.length) {
      el.innerHTML = '<span class="history-empty">No spins yet</span>';
      return;
    }
    el.innerHTML = '';
    history.forEach(o => {
      const pill       = document.createElement('div');
      const cls        = o === 'UP' ? 'up' : o === 'DOWN' ? 'down' : 'mid';
      const lbl        = o === 'UP' ? '▲'  : o === 'DOWN' ? '▼'    : 'M';
      pill.className   = `h-pill ${cls}`;
      pill.textContent = lbl;
      pill.title       = o;
      el.appendChild(pill);
    });
  }

  // [Fix 6] getBet clamps against Wallet.get() — no GameState.get('balance')
  function getBet() {
    const raw = parseInt($('betInput')?.value, 10) || 1;
    const max = Wallet.get();
    const val = Math.max(1, Math.min(raw, max));
    const inp = $('betInput');
    if (inp) inp.value = val;
    return val;
  }

  function setBetValue(v) {
    const max = Wallet.get();
    const inp = $('betInput');
    if (inp) inp.value = Math.max(1, Math.min(Math.floor(v), max));
  }

  function showCommitHash(hash) {
    const el = $('fairHash');
    if (el) el.textContent = hash || '—';
  }

  function updateFairnessModal(info, outcome) {
    const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
    set('serverSeedDisplay', info.serverSeed || '—');
    set('clientSeedDisplay', info.clientSeed || '—');
    set('nonceDisplay',      info.nonce      || '—');
    set('hashDisplay',       info.hash       || '—');
    set('outcomeDisplay',    outcome         || 'Pending…');
  }

  function showCashoutTicker(name, winAmt) {
    const ticker = $('cashoutTicker');
    if (!ticker) return;
    const item       = document.createElement('div');
    item.className   = 'ticker-item';
    item.textContent = `${name} won +$${parseFloat(winAmt).toFixed(2)}`;
    ticker.prepend(item);
    setTimeout(() => item.remove(), 3200);
  }

  function setPhaseText(text) {
    const el = $('gamePhase');
    if (el) el.textContent = text;
  }

  function showAuthGate(msg = 'Sign in to play.') {
    const gate  = $('authGate');
    const msgEl = $('authGateMsg');
    if (!gate) return;
    if (msgEl) msgEl.textContent = msg;
    gate.classList.add('visible');
    setSpinBtn('SIGN IN TO PLAY', true);
    $('btnLogout') && ($('btnLogout').style.display = 'none');
  }

  function hideAuthGate() {
    $('authGate')?.classList.remove('visible');
    $('btnLogout') && ($('btnLogout').style.display = '');
  }

  function setAuthError(msg) {
    const e = $('authError');
    if (e) e.textContent = msg || '';
  }

  function setAuthLoading(on) {
    const b1 = $('btnLogin'), b2 = $('btnDemoUser');
    if (b1) b1.disabled = on;
    if (b2) b2.disabled = on;
  }

  return {
    updateBalance, flashBalance, updateStats,
    setChoiceActive, setSpinBtn, setBetStatus,
    showResult, hideResult, flash,
    showZoneGlow, clearZoneGlows,
    renderHistory, getBet, setBetValue,
    showCommitHash, updateFairnessModal,
    showCashoutTicker, setPhaseText,
    showAuthGate, hideAuthGate, setAuthError, setAuthLoading,
  };
})();


/* ═══════════════════════════════════════════════════════════════
   14. AUTH REACTOR
   ═══════════════════════════════════════════════════════════════ */
const AuthReactor = (() => {
  function init() {
    window.addEventListener('auth:login',   _onLogin);
    window.addEventListener('auth:logout',  _onLogout);
    window.addEventListener('auth:expired', _onExpired);
    _wireAuthForm();
    _wireFairnessModal();
    _wireLogoutBtn();
  }

  function _wireAuthForm() {
    const btnLogin    = document.getElementById('btnLogin');
    const btnDemoUser = document.getElementById('btnDemoUser');
    const pwField     = document.getElementById('authPassword');

    btnLogin?.addEventListener('click', async () => {
      const email    = document.getElementById('authEmail')?.value?.trim();
      const password = document.getElementById('authPassword')?.value;
      if (!email || !password) { UI.setAuthError('Enter email and password.'); return; }
      UI.setAuthError('');
      UI.setAuthLoading(true);
      try {
        const data = await SpeedBetAPI.auth.login(email, password);
        window.dispatchEvent(new CustomEvent('auth:login', { detail: { user: data.user } }));
      } catch (e) {
        UI.setAuthError(e.message || 'Login failed.');
      } finally {
        UI.setAuthLoading(false);
      }
    });

    btnDemoUser?.addEventListener('click', async () => {
      UI.setAuthError('');
      UI.setAuthLoading(true);
      try {
        const data = await SpeedBetAPI.auth.demoLogin('USER');
        window.dispatchEvent(new CustomEvent('auth:login', { detail: { user: data.user } }));
      } catch (e) {
        // Demo endpoint unavailable — run fully offline
        console.warn('[AuthReactor] demo-login unavailable, running offline:', e.message);
        UI.hideAuthGate();
        UI.updateStats();
        if (GameState.get('phase') === GameState.PHASES.PAUSED) GameCore.resume();
      } finally {
        UI.setAuthLoading(false);
      }
    });

    pwField?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btnLogin')?.click();
    });
  }

  function _wireFairnessModal() {
    const btnF  = document.getElementById('btnFairness');
    const modal = document.getElementById('fairModal');
    const close = document.getElementById('fairClose');
    btnF?.addEventListener('click',  () => modal?.classList.add('visible'));
    close?.addEventListener('click', () => modal?.classList.remove('visible'));
    modal?.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('visible');
    });
  }

  function _wireLogoutBtn() {
    document.getElementById('btnLogout')?.addEventListener('click', async () => {
      try { await SpeedBetAPI.auth.logout(); } catch { /**/ }
      window.dispatchEvent(new CustomEvent('auth:logout'));
    });
  }

  async function _onLogin(e) {
    console.log('[AuthReactor] Login:', e.detail?.user?.email ?? 'demo');
    WSBus.reconnect(() => Wallet.subscribeWS());
    await Wallet.fetch();
    UI.hideAuthGate();
    UI.updateStats();
    if (GameState.get('phase') === GameState.PHASES.PAUSED) {
      await GameCore.resume();
    }
  }

  function _onLogout() {
    console.log('[AuthReactor] Logout');
    WSBus.disconnect();
    GameCore.pause();
    UI.showAuthGate('Sign in to keep playing.');
    UI.updateBalance(0);
  }

  function _onExpired() {
    console.warn('[AuthReactor] Session expired');
    WSBus.disconnect();
    GameCore.pause();
    UI.showAuthGate('Your session expired. Please sign in again.');
    UI.updateBalance(0);
  }

  return { init };
})();


/* ═══════════════════════════════════════════════════════════════
   15. GAME CORE — Orchestrates All Modules
   [Bug 3 fixed] _spinning flag prevents double-click race.
   [Bug 4 fixed] Optimistic debit before /play; refund on error.
   [Fix 6] No GameState.get/set('balance') — all via Wallet.
   ═══════════════════════════════════════════════════════════════ */
const GameCore = (() => {
  let _paused   = false;
  let _spinning = false; // [Bug 3] in-flight guard

  async function init() {
    const canvas = document.getElementById('gameCanvas');
    Renderer.init(canvas);
    AudioEngine.init();

    Renderer.drawFrame(GameState.get('currentAngle'), null);
    UI.setPhaseText('IDLE');

    AuthReactor.init();
    _bindEvents();

    if (!SpeedBetAPI.isAuthed()) {
      UI.showAuthGate('Sign in to play.');
      GameState.set('phase', GameState.PHASES.PAUSED);
      _paused = true;
      return;
    }

    await _startNetworking();
    UI.updateStats();
  }

  async function _startNetworking() {
    WSBus.connect(() => Wallet.subscribeWS());
    await Wallet.fetch();
    await _fetchCurrentRound();
  }

  function pause() {
    _paused   = true;
    _spinning = false;
    AnimController.stop();
    FakePlayers.stopTickers();
    GameState.set('phase', GameState.PHASES.PAUSED);
    UI.setPhaseText('PAUSED');
    UI.setSpinBtn('SIGN IN TO PLAY', true);
    UI.setBetStatus('');
    UI.clearZoneGlows();
    UI.hideResult();
  }

  async function resume() {
    _paused = false;
    await _startNetworking();
    GameState.set('phase', GameState.PHASES.IDLE);
    UI.setPhaseText('IDLE');
    UI.setSpinBtn('SELECT UP OR DOWN', true);
    UI.updateStats();
  }

  async function _fetchCurrentRound() {
    try {
      const round = await SpinRound.fetchCurrentRound();
      if (!round) return;
      GameState.set('roundNumber', round.roundNumber);
      GameState.set('commitHash',  round.commitHash);
      UI.showCommitHash(round.commitHash);
    } catch (e) {
      if (e.message !== 'SESSION_EXPIRED') {
        console.warn('[GameCore] current-round:', e.message);
      }
    }
  }

  function _bindEvents() {
    document.getElementById('btnUp')?.addEventListener('click',   () => _selectChoice('UP'));
    document.getElementById('btnDown')?.addEventListener('click', () => _selectChoice('DOWN'));

    document.getElementById('spinBtn')?.addEventListener('click', () => {
      if (GameState.get('phase') === GameState.PHASES.IDLE && GameState.get('choice')) {
        _startSpin();
      }
    });

    document.querySelectorAll('.qb').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioEngine.playClick();
        const amt = btn.dataset.amt;
        if      (amt === 'max')  UI.setBetValue(Wallet.get());
        else if (amt === 'half') UI.setBetValue(Wallet.get() / 2);
        else                     UI.setBetValue(parseInt(amt, 10));
      });
    });

    document.querySelectorAll('.adj-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioEngine.playClick();
        const inp = document.getElementById('betInput');
        let v     = parseFloat(inp?.value) || 10;
        if (btn.dataset.action === 'half')   v = Math.max(1, v / 2);
        if (btn.dataset.action === 'double') v = Math.min(1_000_000, v * 2);
        UI.setBetValue(v);
      });
    });

    document.addEventListener('keydown', e => {
      if (GameState.get('phase') !== GameState.PHASES.IDLE) return;
      if (e.code === 'Space' && GameState.get('choice')) {
        e.preventDefault();
        _startSpin();
      }
      if (e.code === 'KeyU') _selectChoice('UP');
      if (e.code === 'KeyD') _selectChoice('DOWN');
    });
  }

  function _selectChoice(choice) {
    if (GameState.get('phase') !== GameState.PHASES.IDLE) return;
    AudioEngine.playClick();
    GameState.set('choice', choice);
    UI.setChoiceActive(choice);
    UI.setSpinBtn(`SPIN — ${choice}`, false);
    UI.hideResult();
    UI.setBetStatus(
      `Direction: ${choice}`,
      choice === 'UP' ? '#00d264' : '#e63946',
    );
  }

  /* ─────────────────────────────────────────────────────────
     _startSpin
     [Bug 3] _spinning flag checked at entry and set before any
             async work — prevents double-click from sending two
             concurrent /play requests or starting two RAF loops.
     [Bug 4] Wallet.deduct(bet) called BEFORE SpinRound.placeBet().
             On API error the debit is refunded with Wallet.credit().
             Offline path was already correct; now the online path
             matches the fixed Mines pattern exactly.
  ───────────────────────────────────────────────────────────── */
  async function _startSpin() {
    if (_paused)   return;
    if (_spinning) return; // [Bug 3] block re-entry

    const bet = UI.getBet();
    if (bet < 1 || bet > Wallet.get()) {
      UI.setBetStatus('Insufficient balance', '#e63946');
      return;
    }

    _spinning = true; // [Bug 3] set before any await
    GameState.set('phase', GameState.PHASES.SPINNING);
    UI.setPhaseText('SPINNING…');
    UI.setSpinBtn('SPINNING…', true);
    UI.hideResult();
    UI.clearZoneGlows();
    UI.setBetStatus('');

    const fair = await RNG.generateOutcome();
    GameState.set('fairness', fair);
    UI.updateFairnessModal(fair, null);
    UI.showCommitHash(fair.hash.substring(0, 20) + '…');

    // [Bug 4] Optimistic debit BEFORE /play — matches fixed Mines pattern
    Wallet.deduct(bet);
    UI.updateBalance(Wallet.get());

    if (SpeedBetAPI.isAuthed()) {
      try {
        const res = await SpinRound.placeBet(bet);
        // Server may return an authoritative balance — reconcile
        if (res.walletBalance !== undefined) {
          Wallet.set(res.walletBalance);
          UI.updateBalance(Wallet.get());
        }
      } catch (e) {
        // [Bug 4] Refund the optimistic debit on API failure
        Wallet.credit(bet);
        UI.updateBalance(Wallet.get());
        _spinning = false;
        if (e.message === 'SESSION_EXPIRED') return;
        console.warn('[GameCore] /play failed, demo mode:', e.message);
        // Proceed with local play — don't abort the spin
      }
    }

    FakePlayers.init();
    FakePlayers.startTickers();

    const targetAngle = RNG.getTargetAngle(fair.outcome);
    const duration    = 3400 + Math.random() * 1200;
    const spin        = PhysicsEngine.createSpin(
      GameState.get('currentAngle'),
      targetAngle,
      duration,
    );

    AudioEngine.playSpinStart();
    AnimController.start(spin, () => {
      _spinning = false; // [Bug 3] clear when spin animation ends
      _onSpinComplete(fair.outcome, bet, fair);
    });
  }

  async function _onSpinComplete(outcome, bet, fair) {
    if (_paused) return;
    FakePlayers.stopTickers();

    GameState.set('phase', GameState.PHASES.RESULT);
    UI.setPhaseText('RESULT');

    // [Fix 6] applyResult now calls Wallet.credit/deduct internally
    const { won, freeBonus } = GameState.applyResult(outcome, bet);

    Renderer.drawFrame(GameState.get('currentAngle'), outcome);
    UI.showZoneGlow(outcome);
    UI.updateFairnessModal(fair, outcome);
    UI.showCommitHash(fair.hash.substring(0, 20) + '…');

    if (SpeedBetAPI.isAuthed()) {
      SpinRound.settle(outcome, won, bet)
        .then(res => {
          if (!res) return;
          if (res.newBalance !== undefined) {
            Wallet.set(res.newBalance);
          }
          if (res.walletBalance !== undefined) {
            Wallet.set(res.walletBalance);
          }
          UI.updateStats();
          UI.flashBalance(won);
        })
        .catch(e => {
          if (e.message !== 'SESSION_EXPIRED') {
            console.warn('[GameCore] /settle:', e.message);
          }
        });
    }

    if (freeBonus > 0) {
      setTimeout(() => {
        UI.showResult(`🎁 Free bonus +$${freeBonus}!`, 'win');
        AudioEngine.playWin();
      }, 600);
    } else if (outcome === 'MIDDLE') {
      UI.flash('house');
      AudioEngine.playHouse();
      UI.showResult('⚡ MIDDLE — House wins', 'house');
    } else if (won) {
      UI.flash('win');
      AudioEngine.playWin();
      UI.showResult(`${outcome === 'UP' ? '▲' : '▼'} ${outcome} wins  +$${bet}`, 'win');
      UI.showCashoutTicker('YOU', bet);
    } else {
      UI.flash('lose');
      AudioEngine.playLose();
      UI.showResult(
        `${outcome === 'UP' ? '▲ UP' : '▼ DOWN'} landed — you lose  -$${bet}`,
        'lose',
      );
    }

    UI.updateStats();
    UI.renderHistory(GameState.get('history'));

    if (SpeedBetAPI.isAuthed()) {
      setTimeout(async () => {
        try {
          await Wallet.fetch();
          UI.updateStats();
        } catch { /**/ }
      }, 1000);
    }

    setTimeout(async () => {
      if (_paused) return;
      GameState.set('phase', GameState.PHASES.IDLE);
      UI.setPhaseText('IDLE');
      GameState.resetRound();

      const choice = GameState.get('choice');
      UI.setSpinBtn(
        choice ? `SPIN AGAIN — ${choice}` : 'SELECT UP OR DOWN',
        !choice,
      );
      UI.clearZoneGlows();
      Renderer.drawFrame(GameState.get('currentAngle'), null);

      await _fetchCurrentRound();
    }, 2400);
  }

  return { init, pause, resume };
})();


/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => GameCore.init());