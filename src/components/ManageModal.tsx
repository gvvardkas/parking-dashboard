import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { DateTimeInput } from './DateTimeInput';
import { Spot, ManageSpotFormData } from '../types';
import { api } from '../services/api';
import { parseDateTime, combineDateTime } from '../utils/dateTime';
import { isValidEmail, isValidPhone } from '../utils/validation';
import { formatPhoneNumber } from '../utils/formatting';

interface ManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot: Spot | null;
  onUpdate: () => void;
  onDelete: () => void;
}

export const ManageModal: React.FC<ManageModalProps> = ({ isOpen, onClose, spot, onUpdate, onDelete }) => {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifiedPin, setVerifiedPin] = useState<string | null>(null);
  const [formData, setFormData] = useState<ManageSpotFormData>({
    venmo: '',
    email: '',
    phone: '',
    spotNumber: '',
    size: 'Full Size',
    floor: 'P1',
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
    pricePerDay: 10
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && spot) {
      setStep(1);
      setPin('');
      setPinError('');
      setVerifiedPin(null);
      setErrors({});
      const from = parseDateTime(spot.availableFrom);
      const to = parseDateTime(spot.availableTo);
      setFormData({
        venmo: (spot.venmo || '').replace(/^@/, ''),
        email: spot.email || '',
        phone: spot.phone ? formatPhoneNumber(spot.phone.replace(/\D/g, '')) : '',
        spotNumber: spot.spotNumber || '',
        size: spot.size || 'Full Size',
        floor: spot.floor || 'P1',
        fromDate: from.date,
        fromTime: from.time,
        toDate: to.date,
        toTime: to.time,
        pricePerDay: spot.pricePerDay || 10
      });
    }
  }, [isOpen, spot]);

  if (!spot) return null;

  const handleVerifyPin = async () => {
    if (!pin || pin.length !== 4) {
      setPinError('Please enter a 4-digit PIN');
      return;
    }
    setLoading(true);
    const result = await api.verifyPin(spot.id, pin);
    setLoading(false);
    if (result.success) {
      setVerifiedPin(pin);
      setStep(2);
    } else {
      setPinError('Incorrect PIN');
    }
  };

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
    if (errors.venmo) setErrors(prev => ({ ...prev, venmo: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.venmo) newErrors.venmo = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone) newErrors.phone = 'Required';
    else if (!isValidPhone(formData.phone)) newErrors.phone = 'Invalid phone';
    if (!formData.spotNumber) newErrors.spotNumber = 'Required';
    if (!formData.fromDate || !formData.fromTime) newErrors.fromDate = 'Required';
    if (!formData.toDate || !formData.toTime) newErrors.toDate = 'Required';
    if (!formData.pricePerDay) newErrors.pricePerDay = 'Required';
    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fill in all required fields correctly');
      return;
    }

    const availableFrom = combineDateTime(formData.fromDate, formData.fromTime);
    const availableTo = combineDateTime(formData.toDate, formData.toTime);
    if (new Date(availableFrom) >= new Date(availableTo)) {
      alert('End date/time must be after start date/time');
      return;
    }
    setLoading(true);
    const result = await api.updateSpot(spot.id, verifiedPin!, {
      ...formData,
      venmo: '@' + formData.venmo,
      availableFrom,
      availableTo
    });
    setLoading(false);
    if (result.success) {
      onUpdate();
      onClose();
      alert('Updated!');
    } else {
      alert('Error: ' + (result.error || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return;

    setLoading(true);

    if (verifiedPin) {
      const result = await api.deleteSpot(spot.id, verifiedPin);
      if (result.success) {
        onDelete();
        onClose();
        alert('Deleted!');
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    } else {
      // No op
    }

    setLoading(false);    
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Your Listing">
      {step === 1 && (
        <>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Enter the 4-digit PIN you set when creating this listing.
          </p>
          <div className="form-group">
            <label>Your PIN</label>
            <input
              type="password"
              className="input"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleVerifyPin()}
            />
            {pinError && <div className="error-msg">{pinError}</div>}
          </div>
          <button className="btn btn-primary" onClick={handleVerifyPin} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify PIN'}
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <div className="form-group">
            <label className="required">Venmo Handle</label>
            <input
              type="text"
              className={`input ${errors.venmo ? 'error' : ''}`}
              value={`@${formData.venmo}`}
              onChange={(e) => handleVenmoChange(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="required">Email</label>
              <input
                type="email"
                className={`input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
              {errors.email && <div className="error-msg">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="required">Phone</label>
              <input
                type="tel"
                className={`input ${errors.phone ? 'error' : ''}`}
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
              className={`input ${errors.spotNumber ? 'error' : ''}`}
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
          <DateTimeInput
            label="Available From"
            required
            date={formData.fromDate}
            time={formData.fromTime}
            onDateChange={(v) => setFormData(prev => ({ ...prev, fromDate: v }))}
            onTimeChange={(v) => setFormData(prev => ({ ...prev, fromTime: v }))}
          />
          <DateTimeInput
            label="Available To"
            required
            date={formData.toDate}
            time={formData.toTime}
            onDateChange={(v) => setFormData(prev => ({ ...prev, toDate: v }))}
            onTimeChange={(v) => setFormData(prev => ({ ...prev, toTime: v }))}
            minDate={formData.fromDate}
          />
          <div className="form-group">
            <label className="required">Price Per Day ($)</label>
            <input
              type="number"
              className={`input ${errors.pricePerDay ? 'error' : ''}`}
              value={formData.pricePerDay}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: parseInt(e.target.value) || 10 }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-danger"
              style={{ width: 'auto', padding: '14px 20px' }}
              onClick={handleDelete}
              disabled={loading}
            >
              🗑️ Delete
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
