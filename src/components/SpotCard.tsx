import React from 'react';
import { Spot } from '../types';
import { daysBetween, formatDate, formatTime } from '../utils/dateTime';
import { CONFIG, SIZE_ICONS } from '../config/constants';

interface SpotCardProps {
  spot: Spot;
  onRent: (spot: Spot) => void;
  onManage: (spot: Spot) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot, onRent, onManage }) => {
  const days = daysBetween(spot.availableFrom, spot.availableTo);

  return (
    <div className="spot-card">
      <div className="spot-header">
        <div>
          <div className="spot-badge">
            {days} {days === 1 ? 'day' : 'days'} available
          </div>
          <div className="spot-venmo">
            Pay to: <span>{spot.venmo}</span>
          </div>
        </div>
        <div className="spot-price">
          <div className="amount">${spot.pricePerDay}</div>
          <div className="period">per day</div>
        </div>
      </div>
      <div className="spot-info-row">
        <div className="spot-info-tag">
          {SIZE_ICONS[spot.size] || '🚗'} {spot.size || 'Full Size'}
        </div>
        <div className="spot-info-tag">📍 {spot.floor || 'P1'}</div>
      </div>
      <div className="spot-dates">
        <div>
          <div className="spot-dates-label">Available Period</div>
          <div className="spot-dates-value">
            {formatDate(spot.availableFrom)} → {formatDate(spot.availableTo)}
          </div>
          <div className="spot-dates-time">
            {formatTime(spot.availableFrom)} - {formatTime(spot.availableTo)} {CONFIG.TIMEZONE}
          </div>
        </div>
      </div>
      <button className="spot-btn" onClick={() => onRent(spot)}>
        Rent This Spot →
      </button>
      <button className="spot-btn manage-btn" onClick={() => onManage(spot)}>
        Edit / Delete Listing
      </button>
    </div>
  );
};
