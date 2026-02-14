import React from 'react';
import { CONFIG } from '../config/constants';

interface DateTimeInputProps {
  label: string;
  required?: boolean;
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  minTime?: string;
  maxTime?: string;
  showTimeBounds?: boolean;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  label,
  required,
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
  maxDate,
  minTime,
  maxTime,
  showTimeBounds
}) => (
  <div className="form-group">
    <label className={required ? 'required' : ''}>
      {label}
      <span className="timezone-badge">{CONFIG.TIMEZONE}</span>
    </label>
    <div className="datetime-input">
      <input
        type="date"
        className="input"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        min={minDate}
        max={maxDate}
      />
      <input
        type="time"
        className="input"
        value={time}
        onChange={(e) => onTimeChange(e.target.value)}
        min={minTime}
        max={maxTime}
      />
    </div>
    {showTimeBounds && (minTime || maxTime) && (
      <div className="hint" style={{ color: 'var(--accent-primary)' }}>
        {minTime && `Earliest: ${minTime}`}
        {minTime && maxTime && ' | '}
        {maxTime && `Latest: ${maxTime}`}
      </div>
    )}
  </div>
);
