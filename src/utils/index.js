export const fmtMoney = (n, currencyCode = 'GHS', currencySymbol = '₵') => {
  const v = Number(n || 0).toFixed(2);
  return `${currencySymbol} ${v}`;
};

export const fmtMoneyWithCode = (n, currencyCode = 'GHS') => {
  const symbols = { GHS: '₵', NGN: '₦', USD: '$' };
  const symbol = symbols[currencyCode] || currencyCode;
  const v = Number(n || 0).toFixed(2);
  return `${symbol} ${v}`;
};

// Hook to format money with current currency from store
export const useFmtMoney = () => {
  // This will be used in components that have access to the store
  // Components should call this and pass the amount
  return (n, currencyCode, currencySymbol) => {
    return fmtMoneyWithCode(n, currencyCode);
  };
};

export const fmtOdds = (n) => Number(n || 0).toFixed(2);

export const fmtTimeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};

export const fmtCountdown = (iso) => {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Kicking off';
  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / 86400);
  const hrs = Math.floor((total % 86400) / 3600);
  const min = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days}d ${hrs}h`;
  if (hrs > 0) return `${hrs}h ${min}m`;
  return `${min}m`;
};

export const tierColor = (tier) => {
  switch (tier) {
    case 'EXTREME':
      return { bg: 'rgba(232,0,61,0.15)', border: '#E8003D', text: '#E8003D' };
    case 'HIGH':
      return { bg: 'rgba(255,179,0,0.15)', border: '#FFB300', text: '#FFB300' };
    case 'MEDIUM':
      return { bg: 'rgba(0,212,255,0.15)', border: '#00D4FF', text: '#00D4FF' };
    default:
      return { bg: 'rgba(136,136,136,0.15)', border: '#888888', text: '#E0E0E0' };
  }
};

export const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
