import React, { useState } from 'react';
import { Modal } from './Modal';
import { DateTimeInput } from './DateTimeInput';
import { api } from '../services/api';
import { CONFIG } from '../config/constants';
import { AddSpotFormData } from '../types';
import { isValidEmail, isValidPhone } from '../utils/validation';
import { formatPhoneNumber } from '../utils/formatting';
import { combineDateTime, getTodayStringPST, isDateTimeInPastPST, getMinTimeForDatePST } from '../utils/dateTime';

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const AddSpotModal: React.FC<AddSpotModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AddSpotFormData>({
    venmo: '',
    email: '',
    phone: '',
    spotNumber: '',
    size: 'Full Size',
    floor: 'P1',
    notes: '',
    fromDate: '',
    fromTime: '08:00',
    toDate: '',
    toTime: '18:00',
    pricePerDay: CONFIG.PRICE_PER_DAY,
    pin: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  const handleVenmoChange = (value: string) => {
    // Remove @ if present, store without @
    const withoutAt = value.replace(/^@/, '');
    setFormData(prev => ({ ...prev, venmo: withoutAt }));
  };

  const handleSubmit = async () => {
    const { venmo, email, phone, spotNumber, fromDate, fromTime, toDate, toTime, pin } = formData;
    const newErrors: { [key: string]: string } = {};

    if (!venmo || !email || !phone || !spotNumber || !fromDate || !fromTime || !toDate || !toTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isValidPhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      alert('Please enter a 4-digit PIN');
      return;
    }

    // NEW: Validate that start time is not in the past (PST)
    if (isDateTimeInPastPST(fromDate, fromTime)) {
      alert('Start date/time cannot be in the past (PST timezone)');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const availableFrom = combineDateTime(fromDate, fromTime);
    const availableTo = combineDateTime(toDate, toTime);
    if (new Date(availableFrom) >= new Date(availableTo)) {
      alert('End date/time must be after start date/time');
      return;
    }

    setLoading(true);
    const result = await api.addSpot({
      venmo: '@' + venmo,
      email,
      phone,
      spotNumber,
      size: formData.size,
      floor: formData.floor,
      notes: formData.notes,
      availableFrom,
      availableTo,
      pricePerDay: formData.pricePerDay,
      pin
    });
    setLoading(false);

    if (result.success) {
      onSubmit();
      onClose();
      setFormData({
        venmo: '',
        email: '',
        phone: '',
        spotNumber: '',
        size: 'Full Size',
        floor: 'P1',
        notes: '',
        fromDate: '',
        fromTime: '08:00',
        toDate: '',
        toTime: '18:00',
        pricePerDay: CONFIG.PRICE_PER_DAY,
        pin: ''
      });
      setErrors({});
    } else {
      alert('Error: ' + (result.error || 'Unknown error'));
    }
  };

  // Use PST-aware today string
  const today = getTodayStringPST();
  
  // Get minimum time for the selected from date (only applies if date is today)
  const fromTimeMin = getMinTimeForDatePST(formData.fromDate);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="List Your Spot">
      <div className="form-group">
        <label className="required">Your Venmo Handle</label>
        <input
          type="text"
          className="input"
          placeholder="@username"
          value={`@${formData.venmo}`}
          onChange={(e) => handleVenmoChange(e.target.value)}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="required">Your Email</label>
          <input
            type="email"
            className={`input ${errors.email ? 'error' : ''}`}
            placeholder="you@email.com"
            value={formData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
          />
          {errors.email && <div className="error-msg">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label className="required">Your Phone</label>
          <input
            type="tel"
            className={`input ${errors.phone ? 'error' : ''}`}
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
          />
          {errors.phone && <div className="error-msg">{errors.phone}</div>}
        </div>
      </div>
      <div className="form-group">
        <label className="required">Parking Spot Number</label>
        <input
          type="text"
          className="input"
          placeholder="e.g., A-142"
          value={formData.spotNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, spotNumber: e.target.value }))}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="required">Spot Size</label>
          <select
            className="input"
            value={formData.size}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, size: e.target.value as 'Full Size' | 'Compact' | 'Motorcycle' }))
            }
          >
            <option value="Full Size">Full Size</option>
            <option value="Compact">Compact</option>
            <option value="Motorcycle">Motorcycle</option>
          </select>
        </div>
        <div className="form-group">
          <label className="required">Floor</label>
          <select
            className="input"
            value={formData.floor}
            onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value as 'P1' | 'P2' | 'P3' }))}
          >
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Notes (optional)</label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Near elevator, Covered spot, Easy access"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
        <div className="hint">Add any helpful details for renters</div>
      </div>
      <DateTimeInput
        label="Available From"
        required
        date={formData.fromDate}
        time={formData.fromTime}
        onDateChange={(v) => setFormData(prev => ({ ...prev, fromDate: v }))}
        onTimeChange={(v) => setFormData(prev => ({ ...prev, fromTime: v }))}
        minDate={today}
        minTime={fromTimeMin}
        showTimeBounds={!!fromTimeMin}
      />
      <DateTimeInput
        label="Available To"
        required
        date={formData.toDate}
        time={formData.toTime}
        onDateChange={(v) => setFormData(prev => ({ ...prev, toDate: v }))}
        onTimeChange={(v) => setFormData(prev => ({ ...prev, toTime: v }))}
        minDate={formData.fromDate || today}
      />
      <div className="form-group">
        <label className="required">Price Per Day ($)</label>
        <input
          type="number"
          className="input"
          value={formData.pricePerDay}
          onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: parseInt(e.target.value) || 10 }))}
        />
      </div>
      <div className="form-group">
        <label className="required">4-Digit PIN (to edit/delete later)</label>
        <input
          type="password"
          className="input"
          placeholder="e.g., 1234"
          maxLength={4}
          value={formData.pin}
          onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value }))}
        />
        <div className="hint">Remember this PIN! You'll need it to edit or remove your listing.</div>
      </div>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Adding...' : 'List My Spot'}
      </button>
    </Modal>
  );
};
