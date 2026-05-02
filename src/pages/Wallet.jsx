import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, SectionHeader, Modal, Input } from '../components/ui/UIKit';
import { WalletIcon, PlusIcon, MinusIcon, TrendUpIcon, TrendDownIcon, ReceiptIcon, ShieldIcon } from '../components/icons';
import { useStore } from '../store';
import { fmtMoney, fmtTimeAgo, fmtMoneyWithCode } from '../utils';

// ─────────────────────────────────────────────────────────────
// Transaction display metadata
// ─────────────────────────────────────────────────────────────
const TX_META = {
  DEPOSIT:        { label: 'Deposit',        color: '#00E676' },
  WITHDRAW:       { label: 'Withdraw',       color: '#FF1744' },
  BET_STAKE:      { label: 'Bet Stake',      color: '#888'    },
  BET_WIN:        { label: 'Win',            color: '#00E676' },
  VIP_CASHBACK:   { label: 'VIP Cashback',   color: '#FFB300' },
  VIP_MEMBERSHIP: { label: 'VIP Membership', color: '#E8003D' },
};

// ─────────────────────────────────────────────────────────────
// Country → Currency mapping
// Ghana (GH) → GHS | Nigeria (NG) → NGN | Everyone else → USD
// Accepts ISO-2 codes and full country names (case-insensitive)
// ─────────────────────────────────────────────────────────────
const COUNTRY_TO_CURRENCY = {
  GH: 'GHS', GHANA: 'GHS',
  NG: 'NGN', NIGERIA: 'NGN',
};

function countryToCurrency(countryCode) {
  if (!countryCode) return null;
  const key = countryCode.trim().toUpperCase();
  return COUNTRY_TO_CURRENCY[key] ?? 'USD';
}

// ─────────────────────────────────────────────────────────────
// IP-based country detection
// Uses ipapi.co (free, no API key required).
// Returns ISO-2 country code, e.g. "GH", "NG", "US"
// Returns null on any network or parse failure.
// ─────────────────────────────────────────────────────────────
async function detectCountryFromIP() {
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.country_code ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Deposit / Withdrawal limits per currency
// ─────────────────────────────────────────────────────────────
const MIN_DEPOSIT       = { GHS: 350,      NGN: 50000,    USD: 200    };
const MIN_DEPOSIT_LABEL = { GHS: '₵350',   NGN: '₦50,000', USD: '$200' };
const CURRENCY_SYMBOL   = { GHS: '₵',      NGN: '₦',      USD: '$'    };

const MIN_WITHDRAW       = { GHS: 10000,     NGN: 500000,     USD: 2000     };
const MIN_WITHDRAW_LABEL = { GHS: '₵10,000', NGN: '₦500,000', USD: '$2,000' };

const QUICK_AMOUNTS = {
  GHS: [350,   500,    1000,   2000  ],
  NGN: [50000, 100000, 200000, 500000],
  USD: [200,   500,    1000,   2000  ],
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function Wallet() {
  const wallet        = useStore((s) => s.wallet);
  const user          = useStore((s) => s.user);
  const fetchWallet   = useStore((s) => s.fetchWallet);
  const withdraw      = useStore((s) => s.withdraw);
  const pushToast     = useStore((s) => s.pushToast);
  const storeCurrency = useStore((s) => s.currency);

  // ── IP detection state ────────────────────────────────────────────────
  // ipCountry: ISO-2 code returned by ipapi.co, e.g. "GH"
  // ipLoading: true while the fetch is in-flight (used to show "···" placeholders)
  const [ipCountry, setIpCountry] = useState(null);
  const [ipLoading, setIpLoading] = useState(true);

  // ── Other UI state ────────────────────────────────────────────────────
  const [loading,        setLoading]        = useState(false);
  const [showDeposit,    setShowDeposit]    = useState(false);
  const [showWithdraw,   setShowWithdraw]   = useState(false);
  const [amount,         setAmount]         = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName,       setBankName]       = useState('');
  const [accountNumber,  setAccountNumber]  = useState('');
  const [accountName,    setAccountName]    = useState('');

  // ── Fire IP detection once on mount ──────────────────────────────────
  useEffect(() => {
    detectCountryFromIP().then((code) => {
      setIpCountry(code);   // e.g. "GH", "NG", "US", or null
      setIpLoading(false);
    });
  }, []);

  // ── Resolve currency — priority chain ────────────────────────────────
  // 1. IP geolocation  ← most reliable, fires ~1-2 s after mount
  // 2. UserDto.country ← from /api/users/me (user.country field)
  // 3. wallet.currency ← whatever the backend stored for this wallet
  // 4. store.currency  ← app-level default
  // 5. 'GHS'           ← hard-coded safety net
  const currency = (() => {
    if (ipCountry)        return countryToCurrency(ipCountry);       // 1. IP
    if (user?.country)    return countryToCurrency(user.country);    // 2. UserDto
    if (wallet?.currency) return wallet.currency;                    // 3. wallet
    if (storeCurrency)    return storeCurrency;                      // 4. store
    return 'GHS';                                                    // 5. fallback
  })();

  // ── Fetch wallet after login ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchWallet().finally(() => setLoading(false));
  }, [user]);

  // ── Poll after Paystack redirect ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      pushToast({ variant: 'info', title: 'Payment received', message: 'Confirming your deposit...' });
      const t1 = setTimeout(() => fetchWallet(), 2000);
      const t2 = setTimeout(() => {
        fetchWallet().then(() => {
          pushToast({ variant: 'win', title: 'Wallet updated', message: 'Your deposit has been credited.' });
        });
      }, 5000);
      window.history.replaceState({}, '', window.location.pathname);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [user]);

  // ── Normalise transactions ────────────────────────────────────────────
  const rawTransactions = wallet?.transactions ?? [];
  const transactions = rawTransactions.map((tx) => ({
    id:            tx.id,
    kind:          tx.kind,
    amount:        tx.amount,
    balance_after: tx.balanceAfter ?? tx.balance_after ?? 0,
    at:            tx.createdAt   ?? tx.at ?? '',
  }));

  const balance          = wallet?.balance ?? 0;
  const totalDeposits    = transactions.filter((t) => t.kind === 'DEPOSIT' ).reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = Math.abs(transactions.filter((t) => t.kind === 'WITHDRAW').reduce((s, t) => s + t.amount, 0));
  const totalWinnings    = transactions.filter((t) => t.kind === 'BET_WIN'  ).reduce((s, t) => s + t.amount, 0);

  // ── Per-currency limits ───────────────────────────────────────────────
  const minDeposit       = MIN_DEPOSIT[currency]       ?? MIN_DEPOSIT.GHS;
  const minDepositLabel  = MIN_DEPOSIT_LABEL[currency] ?? MIN_DEPOSIT_LABEL.GHS;
  const minWithdraw      = MIN_WITHDRAW[currency]       ?? MIN_WITHDRAW.GHS;
  const minWithdrawLabel = MIN_WITHDRAW_LABEL[currency] ?? MIN_WITHDRAW_LABEL.GHS;
  const quickAmounts     = QUICK_AMOUNTS[currency]     ?? QUICK_AMOUNTS.GHS;

  // ── Deposit ───────────────────────────────────────────────────────────
  const submitDeposit = async () => {
    const a = +amount;
    if (!a || a < minDeposit) {
      pushToast({ variant: 'error', title: `Min deposit ${minDepositLabel}` });
      return;
    }
    try {
      const res = await useStore.getState().deposit({ amount: a, currency });
      if (res?.error) throw new Error(res.error);

      const url =
        res?.data?.data?.authorization_url ??
        res?.data?.data?.authorizationUrl  ??
        res?.data?.authorization_url       ??
        res?.data?.authorizationUrl        ??
        res?.authorization_url             ??
        res?.authorizationUrl;

      if (url) {
        window.location.href = url;
      } else {
        console.warn('[deposit] No redirect URL found. Full response:', JSON.stringify(res, null, 2));
        pushToast({ variant: 'error', title: 'Deposit failed', message: 'Could not get payment link. Please try again.' });
      }

      setShowDeposit(false);
      setAmount('');
    } catch (e) {
      pushToast({ variant: 'error', title: 'Deposit failed', message: e.message });
    }
  };

  // ── Withdraw ──────────────────────────────────────────────────────────
  const submitWithdraw = async () => {
    const a = +withdrawAmount;
    if (!a || a < minWithdraw) {
      pushToast({ variant: 'error', title: `Min withdrawal ${minWithdrawLabel}` });
      return;
    }
    if (a > balance) {
      pushToast({ variant: 'error', title: 'Insufficient balance' });
      return;
    }
    if (!bankName || !accountNumber || !accountName) {
      pushToast({ variant: 'error', title: 'Please fill in all bank details' });
      return;
    }

    const result = await withdraw({ amount: a, currency, bankName, accountNumber, accountName });

    if (result?.error) {
      pushToast({ variant: 'error', title: 'Withdrawal failed', message: result.error });
      return;
    }

    pushToast({
      variant: 'info',
      title:   'Withdrawal request submitted',
      message: `${fmtMoneyWithCode(a, currency)} to ${bankName} ****${accountNumber.slice(-4)}. Admin will process within 24h.`,
    });
    setShowWithdraw(false);
    setWithdrawAmount('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    fetchWallet();
  };

  // ── Signed-out gate ───────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <WalletIcon size={48} color="#888" className="mx-auto mb-4" />
          <h2 className="font-display text-3xl text-white-100 mb-2" style={{ fontFamily: 'Outfit' }}>
            SIGN IN TO VIEW WALLET
          </h2>
          <p className="text-white-80 text-sm mb-4">Your balance, transactions, and history.</p>
          <a href="/auth/login"><Button variant="primary">SIGN IN</Button></a>
        </Card>
      </div>
    );
  }

  // ── Currency label — show pulse while IP is resolving ─────────────────
  const currencyLabel = ipLoading
    ? <span className="opacity-40 animate-pulse">···</span>
    : currency;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">

        {/* Balance + actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[10px] caps text-white-60 mb-1 flex items-center gap-1">
              AVAILABLE BALANCE · {currencyLabel}
            </div>
            {loading ? (
              <div className="h-14 w-48 bg-black-800 animate-pulse rounded" />
            ) : (
              <div className="font-mono text-5xl md:text-6xl text-white-100 tabular-nums" style={{ fontFamily: 'Outfit' }}>
                {fmtMoney(balance)}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="lg" onClick={() => setShowDeposit(true)}>
              <PlusIcon size={16} /> DEPOSIT
            </Button>
            <Button variant="outline" size="lg" onClick={() => setShowWithdraw(true)}>
              <MinusIcon size={16} /> WITHDRAW
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60 flex items-center gap-1">
              <TrendUpIcon size={10} color="#00E676" /> DEPOSITED
            </div>
            <div className="font-mono text-2xl text-emerald-500 tabular-nums mt-1">
              {loading ? <span className="opacity-40">—</span> : fmtMoney(totalDeposits)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60 flex items-center gap-1">
              <TrendDownIcon size={10} color="#FF1744" /> WITHDRAWN
            </div>
            <div className="font-mono text-2xl text-red-600 tabular-nums mt-1">
              {loading ? <span className="opacity-40">—</span> : fmtMoney(totalWithdrawals)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] caps text-white-60 flex items-center gap-1">
              <TrendUpIcon size={10} color="#00E676" /> WON
            </div>
            <div className="font-mono text-2xl text-emerald-500 tabular-nums mt-1">
              {loading ? <span className="opacity-40">—</span> : fmtMoney(totalWinnings)}
            </div>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="p-5">
          <SectionHeader kicker={`${transactions.length} entries`} title="Transaction History" />
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-black-800 animate-pulse rounded" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-white-60 text-sm py-4">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-black-700">
              {transactions.map((tx, i) => {
                const meta = TX_META[tx.kind] || { label: tx.kind, color: '#888' };
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="w-8 h-8 bg-black-800 border border-black-700 flex items-center justify-center shrink-0">
                      <ReceiptIcon size={14} color={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white-100 text-sm font-semibold">{meta.label}</div>
                      <div className="text-white-60 text-xs">{fmtTimeAgo(tx.at)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono tabular-nums" style={{ color: meta.color }}>
                        {tx.amount > 0 ? '+' : ''}{fmtMoney(Math.abs(tx.amount))}
                      </div>
                      <div className="text-[10px] text-white-60 font-mono">bal {fmtMoney(tx.balance_after)}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Trust strip */}
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <ShieldIcon size={20} color="#00D4FF" className="shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] caps text-electric-400">SECURE PAYMENTS</div>
              <div className="text-white-100 text-sm">Powered by Paystack. End-to-end encrypted. PCI-DSS compliant.</div>
              <div className="text-white-60 text-xs mt-1">All transactions are encrypted and processed securely.</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Deposit Modal ── */}
      <Modal open={showDeposit} onClose={() => { setShowDeposit(false); setAmount(''); }} title="DEPOSIT FUNDS">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between bg-black-800 border border-black-700 rounded px-4 py-3">
            <span className="text-white-60 text-xs">Depositing in</span>
            <span className="font-mono font-bold text-white-100">{currencyLabel}</span>
          </div>
          <p className="text-white-60 text-xs">
            Min deposit: <span className="text-white-100 font-semibold">{minDepositLabel}</span>
          </p>
          <Input
            label={`Amount (${currency})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={String(minDeposit)}
          />
          <div className="grid grid-cols-4 gap-1">
            {quickAmounts.map((n) => (
              <button
                key={n}
                onClick={() => setAmount(String(n))}
                className="py-2 bg-black-800 border border-black-700 text-white-80 text-xs font-mono tabular-nums hover:border-crimson-400 transition-colors"
              >
                {n.toLocaleString()}
              </button>
            ))}
          </div>
          <Button variant="primary" size="lg" className="w-full" onClick={submitDeposit}>
            DEPOSIT {amount ? fmtMoneyWithCode(+amount, currency) : minDepositLabel}
          </Button>
        </div>
      </Modal>

      {/* ── Withdraw Modal ── */}
      <Modal open={showWithdraw} onClose={() => { setShowWithdraw(false); setWithdrawAmount(''); }} title="WITHDRAW FUNDS">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between bg-black-800 border border-black-700 rounded px-4 py-3">
            <span className="text-white-60 text-xs">Available</span>
            <span className="font-mono text-lg sm:text-2xl text-white-100 tabular-nums">
              {fmtMoneyWithCode(balance, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between bg-black-800 border border-black-700 rounded px-4 py-3">
            <span className="text-white-60 text-xs">Withdrawing in</span>
            <span className="font-mono font-bold text-white-100">{currencyLabel}</span>
          </div>
          <Input
            label={`Amount (${currency})`}
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <div className="border-t border-black-700 pt-4 space-y-3">
            <div className="text-[10px] caps text-white-60">BANK ACCOUNT DETAILS</div>
            <Input
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g., GTBank, Access Bank, Fidelity"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Account Number"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account number"
              />
              <Input
                label="Account Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account holder name"
              />
            </div>
          </div>
          <p className="text-white-60 text-xs">
            Min withdrawal: {minWithdrawLabel} · Processing time: up to 24 hours.
          </p>
          <Button variant="primary" size="lg" className="w-full" onClick={submitWithdraw}>
            WITHDRAW {withdrawAmount ? fmtMoneyWithCode(+withdrawAmount, currency) : '—'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}