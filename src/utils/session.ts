import { Session } from '../types';
import { CONFIG, SESSION_KEY } from '../config/constants';

export const getSession = (): Session | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const saveSession = (code: string, version: number): void => {
  const session: Session = {
    code,
    version,
    timestamp: Date.now()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const isSessionExpired = (session: Session | null): boolean => {
  if (!session || !session.timestamp) return true;
  const expirationMs = CONFIG.SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - session.timestamp > expirationMs;
};
