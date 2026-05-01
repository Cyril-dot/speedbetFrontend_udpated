import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../api';

export const useStore = create(
  persist(
    (set, get) => ({
      // -----------------------------------------------------------
      // Theme
      // -----------------------------------------------------------
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next === 'dark');
        }
      },
      setTheme: (t) => {
        set({ theme: t });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', t === 'dark');
        }
      },

      // -----------------------------------------------------------
      // Currency
      // -----------------------------------------------------------
      currency: 'GHS',
      currencies: [
        { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
        { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
        { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
      ],
      setCurrency: (code) => set({ currency: code }),
      getCurrencyInfo: () => {
        const currency = get().currency;
        return get().currencies.find(c => c.code === currency) || get().currencies[0];
      },

      // -----------------------------------------------------------
      // Auth
      // -----------------------------------------------------------
      user: null,

      // FIX: login now also fetches wallet immediately so navbar shows balance
      login: async (user) => {
        set({ user });
        try {
          const data = await api.wallet.get();
          set({ wallet: data });
        } catch (_) {}
        try {
          const betsData = await api.bets.myBets(0);
          set({ bets: betsData.content, betsPage: betsData.page, betsTotal: betsData.totalElements });
        } catch (_) {}
      },

      // FIX: register also fetches wallet right after account creation
      register: async (payload) => {
        try {
          const data = await api.auth.register(payload);
          set({ user: data.user });
          try {
            const walletData = await api.wallet.get();
            set({ wallet: walletData });
          } catch (_) {}
          return { ok: true, user: data.user };
        } catch (e) {
          return { error: e.message };
        }
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } catch (_) {}
        set({ user: null, wallet: null, bets: [], vipStatus: null, vipGifts: [], slip: [] });
      },

      refreshUser: async () => {
        try {
          const data = await api.user.me();
          set((s) => ({ user: { ...s.user, ...data } }));
        } catch (_) {}
      },

      // -----------------------------------------------------------
      // Wallet
      // -----------------------------------------------------------
      wallet: null,
      fetchWallet: async () => {
        try {
          const data = await api.wallet.get();
          set({ wallet: data });
          return data;
        } catch (e) {
          return { error: e.message };
        }
      },
      deposit: async (payload) => {
        try {
          const data = await api.wallet.paystackInit(payload);
          return { ok: true, data };
        } catch (e) {
          return { error: e.message };
        }
      },
      withdraw: async (payload) => {
        try {
          const data = await api.wallet.withdraw(payload);
          set((s) => ({
            wallet: s.wallet ? {
              ...s.wallet,
              balance: data.balanceAfter,
              transactions: [data, ...(s.wallet.transactions || [])],
            } : null,
          }));
          return { ok: true };
        } catch (e) {
          return { error: e.message };
        }
      },

      // -----------------------------------------------------------
      // Bet slip
      // -----------------------------------------------------------
      slip: [],
      slipOpen: false,
      addToSlip: (sel) =>
        set((s) => {
          const exists = s.slip.some((x) => x.match_id === sel.match_id && x.market === sel.market);
          if (exists) {
            return {
              slip: s.slip.map((x) =>
                x.match_id === sel.match_id && x.market === sel.market ? sel : x
              ),
            };
          }
          return { slip: [...s.slip, sel], slipOpen: true };
        }),
      removeFromSlip: (id) => set((s) => ({ slip: s.slip.filter((x) => x.id !== id) })),
      clearSlip: () => set({ slip: [] }),
      toggleSlip: () => set((s) => ({ slipOpen: !s.slipOpen })),
      closeSlip: () => set({ slipOpen: false }),

      // -----------------------------------------------------------
      // Bets
      // -----------------------------------------------------------
      bets: [],
      betsPage: 0,
      betsTotal: 0,
      lastWinId: null,
      fetchBets: async (page = 0) => {
        try {
          const data = await api.bets.myBets(page);
          set({
            bets: data.content,
            betsPage: data.page,
            betsTotal: data.totalElements,
          });
          return data;
        } catch (e) {
          return { error: e.message };
        }
      },

      placeBet: async (stake, bookingCodeUsedId = null) => {
        const slip = get().slip;
        if (!slip.length) return { error: 'Empty slip' };

        const user = get().user;
        if (!user) return { error: 'Please login to place a bet.' };

        const payload = {
          stake,
          currency: get().currency,
          selections: slip.map((s) => ({
            matchId:       s.match_id ?? s.matchId,
            market:        s.market,
            selection:     s.selection,
            submittedOdds: s.odds,
          })),
          ...(bookingCodeUsedId ? { bookingCodeUsedId } : {}),
        };

        try {
          const bet = await api.bets.place(payload);
          set((s) => ({
            bets: [bet, ...s.bets],
            slip: [],
            wallet: s.wallet ? {
              ...s.wallet,
              balance: s.wallet.balance - stake,
            } : null,
          }));
          return { ok: true, bet };
        } catch (e) {
          return { error: e.message };
        }
      },

      dismissWin: (_id) => set({ lastWinId: null }),

      // -----------------------------------------------------------
      // VIP
      // -----------------------------------------------------------
      vipStatus: null,
      vipGifts: [],
      fetchVipStatus: async () => {
        try {
          const data = await api.vip.status();
          set({ vipStatus: data });
          return data;
        } catch (e) {
          return { error: e.message };
        }
      },
      fetchVipGifts: async () => {
        try {
          const data = await api.vip.gifts();
          set({ vipGifts: data });
          return data;
        } catch (e) {
          return { error: e.message };
        }
      },
      subscribeVip: async () => {
        try {
          const data = await api.vip.subscribe();
          set({ vipStatus: { isActive: true, ...data } });
          return { ok: true };
        } catch (e) {
          return { error: e.message };
        }
      },
      consumeGift: async (id) => {
        try {
          const data = await api.vip.consumeGift(id);
          set((s) => ({
            vipGifts: s.vipGifts.map((g) =>
              g.id === id ? { ...g, consumedAt: new Date().toISOString() } : g
            ),
          }));
          return data;
        } catch (e) {
          return { error: e.message };
        }
      },

      // -----------------------------------------------------------
      // Booking codes
      // -----------------------------------------------------------
      redeemBookingCode: async (code) => {
        try {
          const data = await api.booking.redeem(code);
          return { ok: true, ...data };
        } catch (e) {
          return { error: e.message };
        }
      },

      // -----------------------------------------------------------
      // Toasts
      // -----------------------------------------------------------
      toasts: [],
      pushToast: (t) =>
        set((s) => ({
          toasts: [...s.toasts, { id: Date.now(), ...t }],
        })),
      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
    }),
    {
      name: 'speedbet-storage',
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark' && typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);