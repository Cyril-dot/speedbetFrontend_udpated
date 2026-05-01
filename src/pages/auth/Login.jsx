import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Card } from '../../components/ui/UIKit';
import { Logo } from '../../components/Logo';
import { useStore } from '../../store';
import { auth as authApi } from '../../api';
import { BoltIcon } from '../../components/icons';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useStore((s) => s.login);
  const pushToast = useStore((s) => s.pushToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const next = params.get('next') || '/app';

  const doLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // api.ts already calls setToken(data.accessToken) — no manual
      // localStorage writes needed here. Token is stored by the api layer.
      const data = await authApi.login(email, password);

      // Hydrate the Zustand store with the user
      login(data.user);

      pushToast({
        variant: 'info',
        title: `Welcome back, ${data.user.firstName || 'User'}`,
        message: 'Successfully signed in.',
      });

      if (data.user.role === 'ADMIN') navigate('/admin');
      else if (data.user.role === 'SUPER_ADMIN') navigate('/x-control-9f3a2b');
      else navigate(next);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter email and password.');
      return;
    }
    doLogin(); // FIX: was doLogin('USER') — stray arg removed
  };

  return (
    <div className="min-h-screen bg-black-950 bg-spotlight flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/*
          FIX: was <Link to="/"><Logo /></Link>
          Logo renders its own <Link> internally. Wrapping it in another <Link>
          causes <a> inside <a> DOM nesting error. Use plain div + navigate.
        */}
        <div
          className="flex justify-center mb-8 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Logo size="md" linkTo={null} />
        </div>

        <Card className="p-7">
          <h1
            className="text-white-100 font-display text-4xl leading-none mb-1"
            style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em' }}
          >
            WELCOME BACK
          </h1>
          <p className="text-white-60 text-sm mb-6">
            Sign in to place bets, track slips, and cash out.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              error={error}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-white-80 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-crimson-400" />
                Keep me signed in
              </label>
              <button type="button" className="text-electric-400 hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'SIGNING IN…' : 'SIGN IN'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-black-700" />
            <span className="text-[10px] caps text-white-60">OR CONTINUE AS</span>
            <div className="flex-1 h-px bg-black-700" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/auth/register')}
              className="justify-start"
            >
              <BoltIcon size={18} color="#E8003D" /> Create New Account
            </Button>
          </div>
        </Card>

        <p className="text-center text-white-60 text-sm mt-6">
          New to SpeedBet?{' '}
          <Link to="/auth/register" className="text-crimson-400 hover:text-crimson-500 font-semibold">
            Create an account →
          </Link>
        </p>

        <p className="text-center text-[10px] caps text-white-60 mt-8">
          18+ · Bet responsibly · Development environment
        </p>
      </motion.div>
    </div>
  );
}