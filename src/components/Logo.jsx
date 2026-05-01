// SpeedBet logo — uses favicon image
import { Link } from 'react-router-dom';

export const BoltMark = ({ size = 36 }) => (
  <img
    src="/favicon.png"
    alt="SpeedBet"
    width={size}
    height={size}
    style={{ borderRadius: '12px' }}
  />
);

export const Logo = ({ size = 'md', className = '', linkTo = '/' }) => {
  const sizes = {
    sm: { mark: 48, text: 'text-lg' },
    md: { mark: 56, text: 'text-2xl' },
    lg: { mark: 64, text: 'text-3xl' },
  };
  const s = sizes[size] || sizes.md;

  const inner = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <BoltMark size={s.mark} />
      <span
        className={`font-display font-extrabold ${s.text} tracking-tight`}
        style={{ color: 'var(--text-100)' }}
      >
        Speed<span style={{ color: 'var(--brand)' }}>Bet</span>
      </span>
    </div>
  );

  // Only wrap in Link when linkTo is a non-empty string
  if (linkTo) return <Link to={linkTo} className="no-underline">{inner}</Link>;
  return inner;
};

export default Logo;