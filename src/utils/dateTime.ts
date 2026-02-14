import { CONFIG } from '../config/constants';

// Parse datetime and extract date/time parts in PST timezone
export const parseDateTime = (isoString: string): { date: string; time: string } => {
  if (!isoString) return { date: '', time: '' };
  const dt = new Date(isoString);
  if (isNaN(dt.getTime())) return { date: '', time: '' };
  // Use Intl.DateTimeFormat for reliable timezone conversion
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(dt);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || '';
  const year = get('year');
  const month = get('month');
  const day = get('day');
  let hour = get('hour');
  const minute = get('minute');
  // Handle midnight (hour 24 -> 00)
  if (hour === '24') hour = '00';
  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`
  };
};

export const combineDateTime = (date: string, time: string): string => {
  if (!date || !time) return '';
  return `${date}T${time}:00`;
};

export const formatDate = (isoString: string): string => {
  if (!isoString) return '';
  const dt = new Date(isoString);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
};

export const formatTime = (isoString: string): string => {
  if (!isoString) return '';
  const dt = new Date(isoString);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles'
  });
};

export const formatDateTimeDisplay = (isoString: string): string => {
  if (!isoString) return '';
  return `${formatDate(isoString)} @ ${formatTime(isoString)} ${CONFIG.TIMEZONE}`;
};

export const hoursBetween = (startISO: string, endISO: string): number => {
  if (!startISO || !endISO) return 0;
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const daysBetween = (startISO: string, endISO: string): number => {
  return Math.ceil(hoursBetween(startISO, endISO) / 24);
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const isDateInRange = (dateStr: string, startISO: string, endISO: string): boolean => {
  const d = new Date(dateStr);
  const start = new Date(startISO);
  const end = new Date(endISO);
  d.setHours(12, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
};

// ============================================================
// NEW: PST "NOW" UTILITIES FOR VALIDATION
// ============================================================

/**
 * Get the current date and time in PST timezone
 * Returns { date: 'YYYY-MM-DD', time: 'HH:MM' }
 */
export const getNowInPST = (): { date: string; time: string } => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || '';
  const year = get('year');
  const month = get('month');
  const day = get('day');
  let hour = get('hour');
  const minute = get('minute');
  if (hour === '24') hour = '00';
  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`
  };
};

/**
 * Get today's date string in PST timezone (YYYY-MM-DD format)
 * This is more accurate than getTodayString() which uses local timezone
 */
export const getTodayStringPST = (): string => {
  return getNowInPST().date;
};

/**
 * Check if a given date/time (in PST) is in the past
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format
 * @returns true if the date/time is before current PST time
 */
export const isDateTimeInPastPST = (date: string, time: string): boolean => {
  if (!date || !time) return false;
  
  const now = getNowInPST();
  const nowMinutes = timeToMinutes(now.time);
  const inputMinutes = timeToMinutes(time);
  
  // Compare dates first
  if (date < now.date) return true;
  if (date > now.date) return false;
  
  // Same date, compare times
  return inputMinutes < nowMinutes;
};

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Get the minimum allowed time for today in PST
 * Returns current PST time if date is today, otherwise undefined (no minimum)
 */
export const getMinTimeForDatePST = (date: string): string | undefined => {
  const now = getNowInPST();
  if (date === now.date) {
    return now.time;
  }
  return undefined;
};
