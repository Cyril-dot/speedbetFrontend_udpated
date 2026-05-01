import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Card, Badge } from '../../components/ui/UIKit';
import { Logo } from '../../components/Logo';
import { useStore } from '../../store';
import { auth as authApi } from '../../api';
import { GiftIcon } from '../../components/icons';

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useStore((s) => s.login);
  const setCurrency = useStore((s) => s.setCurrency);
  const pushToast = useStore((s) => s.pushToast);
  const currencies = useStore((s) => s.currencies);

  const refCode = params.get('ref') || '';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    currency: 'GHS',
    accept: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (!form.firstName || form.firstName.trim().length < 1) e.firstName = 'Enter your first name';
    if (!form.lastName || form.lastName.trim().length < 1) e.lastName = 'Enter your last name';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone || form.phone.length < 7) e.phone = 'Enter a valid phone';
    if (!form.password || form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!form.accept) e.accept = 'You must accept the terms';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);

    // ✅ Set currency FIRST so it's available immediately in the store
    // for Wallet and TopBar to auto-detect after login.
    setCurrency(form.currency);

    try {
      const data = await authApi.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
        country: form.currency,
        ref: refCode || undefined,
      });

      // Hydrate the Zustand store with the user.
      // Currency is already set above — Wallet will auto-detect it.
      login(data.user);

      pushToast({
        variant: 'win',
        title: 'Account created',
        message: refCode
          ? `Welcome! ${currencies.find((c) => c.code === form.currency)?.symbol || form.currency} 50 signup bonus applied via referral ${refCode}.`
          : 'Welcome to SpeedBet. Start by picking a match.',
      });

      navigate('/app');
    } catch (err) {
      pushToast({ variant: 'error', title: 'Registration failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-950 bg-spotlight flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div
          className="flex justify-center mb-8 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Logo size="md" linkTo={null} />
        </div>

        {refCode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 border-2 border-crimson-400 bg-crimson-400/10 flex items-center gap-3"
          >
            <GiftIcon size={20} color="#E8003D" />
            <div className="flex-1">
              <div className="text-[10px] caps text-crimson-400">INVITE CODE DETECTED</div>
              <div className="text-white-100 text-sm font-semibold">
                Code <span className="font-mono">{refCode}</span> · GHS 50 signup bonus
              </div>
            </div>
            <Badge variant="new">BONUS</Badge>
          </motion.div>
        )}

        <Card className="p-7">
          <h1
            className="text-white-100 font-display text-4xl leading-none mb-1"
            style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em' }}
          >
            JOIN SPEEDBET
          </h1>
          <p className="text-white-60 text-sm mb-6">
            Hit different. Cash out smart. It takes 30 seconds.
          </p>

          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={set('firstName')}
                error={errors.firstName}
                placeholder="John"
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={set('lastName')}
                error={errors.lastName}
                placeholder="Mensah"
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              error={errors.phone}
              placeholder="+233 20 000 0000"
            />

            <div>
              <label className="block text-white-80 text-xs font-semibold mb-1.5">
                Currency
                <span className="ml-1 text-white-40 font-normal normal-case">(used across your whole account)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setForm({ ...form, currency: c.code })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      form.currency === c.code
                        ? 'border-brand-400 bg-brand-400/20'
                        : 'border-black-700 bg-black-800 hover:border-black-600'
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span
                      className="font-mono font-bold text-sm"
                      style={{
                        color: form.currency === c.code ? 'var(--brand)' : 'var(--text-100)',
                      }}
                    >
                      {c.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              placeholder="min. 6 chars"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
              placeholder="re-enter"
            />

            <label className="flex items-start gap-2 text-white-80 text-xs cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.accept}
                onChange={set('accept')}
                className="mt-1 accent-crimson-400"
              />
              <span>
                I am 18+ and agree to the{' '}
                <a href="#" className="text-electric-400 hover:underline">Terms</a>{' '}
                and{' '}
                <a href="#" className="text-electric-400 hover:underline">Privacy Policy</a>.
                {errors.accept && (
                  <span className="block text-red-600 mt-1">{errors.accept}</span>
                )}
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'CREATING…' : 'CREATE ACCOUNT'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-white-60 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-crimson-400 hover:text-crimson-500 font-semibold">
            Sign in →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}