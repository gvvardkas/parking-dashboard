export const CONFIG = {
  GOOGLE_SCRIPT_URL: import.meta.env.VITE_GOOGLE_SCRIPT_URL,
  PRICE_PER_DAY: 10,
  TIMEZONE: 'PST',
  SESSION_DURATION_DAYS: 7
};

export const SESSION_KEY = 'parking_session';

export const SIZE_ICONS: Record<string, string> = {
  'Full Size': '🚗',
  'Compact': '🚙',
  'Motorcycle': '🏍️'
};

export const SIZE_OPTIONS = ['Full Size', 'Compact', 'Motorcycle'] as const;
export const FLOOR_OPTIONS = ['P1', 'P2', 'P3'] as const;
