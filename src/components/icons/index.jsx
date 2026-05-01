import React from 'react';

// Base props shape for every icon
const base = (size = 24, className = '') => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  className,
});

export const BoltIcon = ({ size = 24, color = '#E8003D', className = '' }) => (
  <svg {...base(size, className)}>
    <path
      d="M13 2L4 13h6l-2 9 10-12h-6l1-8z"
      fill={color}
      stroke={color}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const HexagonIcon = ({ size = 24, color = '#00D4FF', className = '', fill = 'none' }) => (
  <svg {...base(size, className)}>
    <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke={color} strokeWidth="1.5" fill={fill} />
  </svg>
);

export const CrashWaveIcon = ({ size = 24, color = '#E8003D', className = '' }) => (
  <svg {...base(size, className)}>
    <path
      d="M2 18 C 5 18, 7 10, 12 6 C 16 3, 19 14, 22 20"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="12" cy="6" r="1.6" fill={color} />
  </svg>
);

export const CrosshairIcon = ({ size = 24, color = '#00D4FF', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" />
    <line x1="12" y1="1" x2="12" y2="4" stroke={color} strokeWidth="1.5" />
    <line x1="12" y1="20" x2="12" y2="23" stroke={color} strokeWidth="1.5" />
    <line x1="1" y1="12" x2="4" y2="12" stroke={color} strokeWidth="1.5" />
    <line x1="20" y1="12" x2="23" y2="12" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const FlameIcon = ({ size = 24, color = '#E8003D', className = '' }) => (
  <svg {...base(size, className)}>
    <path
      d="M12 2c0 0-5 6-5 11a5 5 0 0010 0c0-2-1-4-2-5 0 3-2 4-3 4 1-2 1-5-2-6z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const DiamondIcon = ({ size = 24, color = '#00D4FF', className = '' }) => (
  <svg {...base(size, className)}>
    <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export const PulseIcon = ({ size = 24, color = '#00E676', className = '' }) => (
  <svg {...base(size, className)}>
    <path
      d="M2 12h4l2-6 4 12 3-9 2 3h5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const ShieldIcon = ({ size = 24, color = '#00D4FF', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M12 2 L4 5 V12 C 4 17, 8 21, 12 22 C 16 21, 20 17, 20 12 V5 L12 2 Z" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M8.5 12 L11 14.5 L16 9.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const ChartBarIcon = ({ size = 24, color = '#FFFFFF', className = '' }) => (
  <svg {...base(size, className)}>
    <rect x="3" y="14" width="3" height="7" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
    <rect x="8" y="10" width="3" height="11" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
    <rect x="13" y="6" width="3" height="15" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
    <rect x="18" y="2" width="3" height="19" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export const CoinStackIcon = ({ size = 24, color = '#FFB300', className = '' }) => (
  <svg {...base(size, className)}>
    <ellipse cx="12" cy="6" rx="7" ry="2.5" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M5 6 V10 C 5 11.4, 8.1 12.5, 12 12.5 C 15.9 12.5, 19 11.4, 19 10 V6" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M5 12 V16 C 5 17.4, 8.1 18.5, 12 18.5 C 15.9 18.5, 19 17.4, 19 16 V12" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export const CrownIcon = ({ size = 24, color = '#FFB300', className = '', filled = false }) => (
  <svg {...base(size, className)}>
    <path
      d="M3 8 L7 14 L12 6 L17 14 L21 8 L19 19 H5 L3 8Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </svg>
);

export const TargetIcon = ({ size = 24, color = '#00D4FF', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </svg>
);

export const RocketIcon = ({ size = 24, color = '#E8003D', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M12 2 L16 8 V14 L12 18 L8 14 V8 L12 2Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M8 14 L5 20 L9 18" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M16 14 L19 20 L15 18" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="1.5" stroke={color} strokeWidth="1.2" fill="none" />
  </svg>
);

export const ClockIcon = ({ size = 24, color = '#FFFFFF', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M12 7 V12 L15 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const LockIcon = ({ size = 24, color = '#FFFFFF', className = '' }) => (
  <svg {...base(size, className)}>
    <rect x="5" y="11" width="14" height="10" rx="1.5" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M8 11 V7 A 4 4 0 0 1 16 7 V11" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export const TrophyIcon = ({ size = 24, color = '#FFB300', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M7 4 H17 V10 A 5 5 0 0 1 7 10 V4Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M5 6 H3 V8 A 3 3 0 0 0 7 10" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M19 6 H21 V8 A 3 3 0 0 1 17 10" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M10 14 H14 V17 H10Z M8 20 H16" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
  </svg>
);

// Additional utility icons
export const ArrowRightIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M5 12h14M13 5l7 7-7 7" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CloseIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const PlusIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const MinusIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M5 12h14" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const HomeIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M3 11 L12 3 L21 11 V21 H14 V14 H10 V21 H3 V11 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
  </svg>
);

export const PlayIcon = ({ size = 24, color = 'currentColor', className = '', filled = true }) => (
  <svg {...base(size, className)}>
    <path d="M7 4 L20 12 L7 20 V4 Z" stroke={color} strokeWidth="1.5" fill={filled ? color : 'none'} strokeLinejoin="round" />
  </svg>
);

export const UserIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M4 21 C 4 16 8 14 12 14 C 16 14 20 16 20 21" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export const BellIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M6 9 A 6 6 0 0 1 18 9 V14 L20 17 H4 L6 14 V9 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M10 20 A 2 2 0 0 0 14 20" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export const MenuIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M4 7h16M4 12h16M4 17h16" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const CheckIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M4 12 L10 18 L20 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const ShareIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="6" cy="12" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
    <circle cx="18" cy="5" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
    <circle cx="18" cy="19" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M8 11 L16 6 M8 13 L16 18" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export const DownloadIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M12 3 V15 M7 10 L12 15 L17 10 M4 19 H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const TrendUpIcon = ({ size = 24, color = '#00E676', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M3 17 L10 10 L14 14 L21 7" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 7 H21 V13" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrendDownIcon = ({ size = 24, color = '#FF1744', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M3 7 L10 14 L14 10 L21 17" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 17 H21 V11" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SearchIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M21 21 L16.5 16.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const SettingsIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none" />
    <path
      d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const GiftIcon = ({ size = 24, color = '#E8003D', className = '' }) => (
  <svg {...base(size, className)}>
    <rect x="3" y="9" width="18" height="12" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M3 12 H21 M12 9 V21" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M12 9 C 9 9, 7 7, 7 5 C 7 3, 9 3, 12 6 C 15 3, 17 3, 17 5 C 17 7, 15 9, 12 9 Z" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

export const CalendarIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <rect x="3" y="5" width="18" height="17" rx="1.5" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M3 10 H21 M8 3 V7 M16 3 V7" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const WalletIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <rect x="3" y="6" width="18" height="14" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M3 10 H18 A 3 3 0 0 1 18 16 H3" stroke={color} strokeWidth="1.5" fill="none" />
    <circle cx="17" cy="13" r="1" fill={color} />
  </svg>
);

export const ReceiptIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M5 3 V21 L8 19 L12 21 L16 19 L19 21 V3 L16 5 L12 3 L8 5 L5 3 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M8 9 H16 M8 13 H16 M8 17 H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const BallIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
    <polygon points="12,6 15,9 14,13 10,13 9,9" stroke={color} strokeWidth="1.2" fill="none" />
    <path d="M12 3 V6 M12 13 V21 M15 9 L20 7 M14 13 L19 16 M9 9 L4 7 M10 13 L5 16" stroke={color} strokeWidth="1.2" fill="none" />
  </svg>
);

export const DiceIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    <circle cx="8" cy="8" r="1" fill={color} />
    <circle cx="16" cy="8" r="1" fill={color} />
    <circle cx="12" cy="12" r="1" fill={color} />
    <circle cx="8" cy="16" r="1" fill={color} />
    <circle cx="16" cy="16" r="1" fill={color} />
  </svg>
);

export const WheelIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M12 3 V21 M3 12 H21 M5.6 5.6 L18.4 18.4 M18.4 5.6 L5.6 18.4" stroke={color} strokeWidth="1" fill="none" />
  </svg>
);

export const ShuffleIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M3 7 H7 L17 17 H21 M3 17 H7 L17 7 H21" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 4 L21 7 L18 10 M18 14 L21 17 L18 20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrashIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M3 6 H21 M8 6 V4 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 V6 M5 6 V20 a2 2 0 0 0 2 2 h10 a2 2 0 0 0 2 -2 V6" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11 V17 M14 11 V17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ChevronDownIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M6 9 L12 15 L18 9" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronUpIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <path d="M6 15 L12 9 L18 15" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const InfoIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M12 8 V8.01 M12 12 V16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
