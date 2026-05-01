import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { buttonPress, buttonRipple } from '../../utils/animations';

// ---------------------------------------------------------------
// Button — premium gradient system with shimmer
// ---------------------------------------------------------------
export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const buttonRef = useRef(null);

  // Apply button animations
  useEffect(() => {
    if (buttonRef.current && !disabled) {
      buttonPress(buttonRef.current);
      buttonRipple(buttonRef.current);
    }
  }, [disabled]);

  const base =
    'btn-shine inline-flex items-center justify-center gap-2 font-semibold rounded-lg select-none disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 active:scale-[0.97] hover:-translate-y-0.5';
  const sizes = {
    xs: 'px-2.5 py-1 text-[11px] min-h-[28px]',
    sm: 'px-3 py-1.5 text-xs min-h-[34px]',
    md: 'px-5 py-2.5 text-sm min-h-[42px]',
    lg: 'px-6 py-3 text-[15px] min-h-[50px]',
    xl: 'px-8 py-4 text-base min-h-[58px]',
  };
  const variants = {
    primary:
      'text-white shadow-[0_4px_16px_rgba(232,0,61,0.3)] hover:shadow-[0_6px_28px_rgba(204,255,0,0.4)] hover-accent',
    gold:
      'text-[#1A1000] font-bold shadow-[0_4px_16px_rgba(255,179,0,0.3)] hover:shadow-[0_6px_28px_rgba(255,179,0,0.5)] hover:brightness-110',
    emerald:
      'text-[#00150A] font-bold shadow-[0_4px_16px_rgba(0,230,118,0.3)] hover:shadow-[0_6px_28px_rgba(0,230,118,0.5)] hover:brightness-110',
    electric:
      'text-[#001520] font-bold shadow-[0_4px_16px_rgba(0,212,255,0.3)] hover:shadow-[0_6px_28px_rgba(0,212,255,0.5)] hover:brightness-110',
    outline:
      'text-white border-[1.5px] hover:bg-[var(--surface-2)] hover:border-[var(--brand)] hover:text-[var(--brand-light)]',
    ghost:
      'text-white-80 hover:bg-[var(--surface-2)] hover:text-white',
    dark:
      'text-white border-[1.5px] hover:brightness-125',
    danger:
      'text-white shadow-[0_4px_16px_rgba(255,23,68,0.3)] hover:shadow-[0_6px_28px_rgba(255,23,68,0.5)]',
  };
  const styles = {
    primary: { background: 'var(--grad-primary)' },
    gold: { background: 'var(--grad-gold)' },
    emerald: { background: 'var(--grad-emerald)' },
    electric: { background: 'var(--grad-electric)' },
    outline: { borderColor: 'var(--surface-4)' },
    dark: { background: 'var(--surface-2)', borderColor: 'var(--border-bright)' },
    danger: { background: 'linear-gradient(135deg, #FF1744 0%, #C41A1A 100%)' },
  };
  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      style={styles[variant]}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ---------------------------------------------------------------
// Card — premium with subtle top sheen
// ---------------------------------------------------------------
export const Card = ({ children, className = '', hover = false, premium = false, ...props }) => (
  <div
    className={`relative rounded-xl overflow-hidden ${
      premium ? '' : 'border'
    } ${
      hover ? 'hover-glow cursor-pointer' : ''
    } ${className}`}
    style={{
      background: 'var(--surface-1)',
      borderColor: premium ? 'transparent' : 'var(--border)',
    }}
    {...props}
  >
    {/* Top sheen */}
    <div className="pointer-events-none absolute top-0 left-0 right-0 h-px"
         style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
    {children}
  </div>
);

// ---------------------------------------------------------------
// Badge
// ---------------------------------------------------------------
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-black-700 text-white-80',
    live: 'bg-crimson-400 text-white',
    vip: 'bg-amber-400 text-black-950',
    new: 'bg-electric-400 text-black-950',
    win: 'bg-emerald-500 text-black-950',
    loss: 'bg-red-600 text-white',
    high: 'bg-amber-400 text-black-950',
    extreme: 'bg-crimson-400 text-white',
    low: 'bg-black-700 text-white-80',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold caps ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// ---------------------------------------------------------------
// LIVE dot
// ---------------------------------------------------------------
export const LiveDot = ({ label = 'LIVE' }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-400" />
    </span>
    <span className="text-[10px] font-bold caps text-crimson-400 tracking-wider">{label}</span>
  </span>
);

// ---------------------------------------------------------------
// Odds button — with flash animation on value change
// ---------------------------------------------------------------
export const OddsButton = ({ label, value, selected, onClick, className = '' }) => {
  const [flash, setFlash] = React.useState(false);
  const prev = React.useRef(value);
  React.useEffect(() => {
    if (prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 700);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 p-2 rounded-md border min-h-[48px] transition-all duration-200 ${
        selected
          ? 'border-crimson-400 bg-crimson-400/10'
          : 'border-black-700 bg-black-800 hover:border-electric-400'
      } ${flash ? 'animate-flash' : ''} ${className}`}
    >
      <span className="text-[10px] text-white-60 caps">{label}</span>
      <span className="font-mono text-sm font-bold text-white tabular">{Number(value).toFixed(2)}</span>
    </button>
  );
};

// ---------------------------------------------------------------
// Section header
// ---------------------------------------------------------------
export const SectionHeader = ({ kicker, title, action, className = '' }) => (
  <div className={`flex items-end justify-between mb-4 ${className}`}>
    <div>
      {kicker && (
        <div className="text-[10px] caps text-electric-400 mb-1 font-bold">{kicker}</div>
      )}
      <h2
        className="font-display text-white text-2xl md:text-3xl"
        style={{ letterSpacing: '0.04em' }}
      >
        {title}
      </h2>
    </div>
    {action}
  </div>
);

// ---------------------------------------------------------------
// Stat pill
// ---------------------------------------------------------------
export const StatPill = ({ label, value, trend }) => (
  <div className="flex flex-col gap-1 p-3 bg-black-800 border border-black-700 rounded-lg">
    <div className="text-[10px] caps text-white-60">{label}</div>
    <div className="font-mono font-bold text-lg text-white tabular">{value}</div>
    {trend != null && (
      <div
        className={`text-[10px] caps ${trend >= 0 ? 'text-emerald-500' : 'text-red-600'}`}
      >
        {trend >= 0 ? '+' : ''}
        {trend}%
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------
export const EmptyState = ({ title, subtitle, icon, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 opacity-50">{icon}</div>}
    <div className="font-display text-2xl text-white mb-1">{title}</div>
    {subtitle && <div className="text-sm text-white-60 mb-4 max-w-sm">{subtitle}</div>}
    {action}
  </div>
);

// ---------------------------------------------------------------
// Input
// ---------------------------------------------------------------
export const Input = React.forwardRef(
  ({ label, error, className = '', shake, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[10px] caps text-white-60">{label}</label>}
      <input
        ref={ref}
        className={`bg-black-800 border ${
          error ? 'border-red-600' : 'border-black-700'
        } text-white rounded-md px-3 py-2.5 outline-none focus:border-electric-400 transition-colors font-body ${
          shake ? 'animate-shake-x' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  )
);
Input.displayName = 'Input';

// ---------------------------------------------------------------
// Modal
// ---------------------------------------------------------------
export const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-black-900 border border-black-700 rounded-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="font-display text-2xl mb-4 text-white" style={{ letterSpacing: '0.04em' }}>
            {title}
          </div>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

// ---------------------------------------------------------------
// ProgressBar
// ---------------------------------------------------------------
export const ProgressBar = ({ value, max = 100, color = '#00E676', className = '' }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`h-1.5 bg-black-700 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
};

// ---------------------------------------------------------------
// Confidence meter (for AI predictions)
// ---------------------------------------------------------------
export const ConfidenceMeter = ({ value }) => {
  const color = value >= 0.7 ? '#00E676' : value >= 0.5 ? '#FFB300' : '#FF1744';
  return (
    <div className="flex items-center gap-2">
      <ProgressBar value={value * 100} color={color} className="flex-1" />
      <span className="font-mono text-xs font-bold tabular" style={{ color }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
};
