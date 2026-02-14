import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { DateTimeInput } from './DateTimeInput';
import { Spot, RentalData } from '../types';
import { api } from '../services/api';
import { parseDateTime, combineDateTime, formatDateTimeDisplay, hoursBetween, isDateTimeInPastPST, getNowInPST } from '../utils/dateTime';
import { isValidEmail, isValidPhone } from '../utils/validation';
import { formatPhoneNumber } from '../utils/formatting';
import { fileToBase64 } from '../utils/helpers';

interface RentModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot: Spot | null;
  onSubmit: () => void;
}

export const RentModal: React.FC<RentModalProps> = ({ isOpen, onClose, spot, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [rentData, setRentData] = useState<RentalData>({
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
    name: '',
    email: '',
    phone: '',
    screenshot: null,
    screenshotPreview: null
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ spotNumber: string; ownerPhone: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const spotFrom = useMemo(() => (spot ? parseDateTime(spot.availableFrom) : { date: '', time: '' }), [spot]);
  const spotTo = useMemo(() => (spot ? parseDateTime(spot.availableTo) : { date: '', time: '' }), [spot]);

  useEffect(() => {
    if (isOpen && spot) {
      setStep(1);
      
      // Get current PST time to determine initial rental start
      const nowPST = getNowInPST();
      const spotStartDate = spotFrom.date;
      const spotStartTime = spotFrom.time;
      
      // Determine initial from date/time
      // If spot starts in the future, use spot start time
      // If spot starts today or in the past, use current PST time (or spot start if it's later today)
      let initialFromDate = spotStartDate;
      let initialFromTime = spotStartTime;
      
      if (spotStartDate < nowPST.date) {
        // Spot started in the past, use today
        initialFromDate = nowPST.date;
        initialFromTime = nowPST.time;
      } else if (spotStartDate === nowPST.date && spotStartTime < nowPST.time) {
        // Spot started earlier today, use current time
        initialFromTime = nowPST.time;
      }
      
      setRentData({
        fromDate: initialFromDate,
        fromTime: initialFromTime,
        toDate: spotTo.date,
        toTime: spotTo.time,
        name: '',
        email: '',
        phone: '',
        screenshot: null,
        screenshotPreview: null
      });
      setResult(null);
    }
  }, [isOpen, spot, spotFrom, spotTo]);

  if (!spot) return null;

  const startDateTime = combineDateTime(rentData.fromDate, rentData.fromTime);
  const endDateTime = combineDateTime(rentData.toDate, rentData.toTime);

  const validateRental = (): string => {
    if (!rentData.fromDate || !rentData.fromTime || !rentData.toDate || !rentData.toTime)
      return 'Please fill in all date and time fields';
    
    // NEW: Check if rental start is in the past (PST)
    if (isDateTimeInPastPST(rentData.fromDate, rentData.fromTime)) {
      return 'Rental start time cannot be in the past (PST timezone)';
    }
    
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const spotStart = new Date(spot.availableFrom);
    const spotEnd = new Date(spot.availableTo);
    if (start < spotStart) return `Cannot start before ${formatDateTimeDisplay(spot.availableFrom)}`;
    if (end > spotEnd) return `Cannot end after ${formatDateTimeDisplay(spot.availableTo)}`;
    if (start >= end) return 'End time must be after start time';
    return '';
  };

  const validationError = validateRental();
  const hours = hoursBetween(startDateTime, endDateTime);
  const days = hours > 0 ? Math.ceil(hours / 24) : 0;
  const total = days * spot.pricePerDay;

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (rentData.email && !isValidEmail(rentData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (rentData.phone && !isValidPhone(rentData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone';
    }
    return newErrors;
  };

  const step2Errors = validateStep2();
  const canProceedToStep2 = validationError === '';
  const canConfirm =
    rentData.name &&
    rentData.email &&
    rentData.phone &&
    rentData.screenshot &&
    isValidEmail(rentData.email) &&
    isValidPhone(rentData.phone);

  // Get minimum time constraints
  const getFromTimeMin = () => {
    const nowPST = getNowInPST();
    
    // If selected date is today in PST, minimum time is current PST time
    if (rentData.fromDate === nowPST.date) {
      // Return the later of: current PST time or spot start time (if spot starts today)
      if (spotFrom.date === nowPST.date && spotFrom.time > nowPST.time) {
        return spotFrom.time;
      }
      return nowPST.time;
    }
    
    // If selected date is the spot's start date (and not today), use spot start time
    if (rentData.fromDate === spotFrom.date) {
      return spotFrom.time;
    }
    
    return undefined;
  };
  
  const getToTimeMax = () => (rentData.toDate === spotTo.date ? spotTo.time : undefined);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setRentData(prev => ({ ...prev, screenshot: base64, screenshotPreview: base64 }));
    }
  };

  const clearScreenshot = () => setRentData(prev => ({ ...prev, screenshot: null, screenshotPreview: null }));

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setRentData(prev => ({ ...prev, phone: formatted }));
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setLoading(true);
    
    // FIXED: Include screenshot in the renterInfo object
    const res = await api.rentSpot(spot.id, startDateTime, endDateTime, {
      name: rentData.name,
      email: rentData.email,
      phone: rentData.phone,
      screenshot: rentData.screenshot  // <-- Screenshot is now included!
    });
    
    setLoading(false);
    if (res.success) {
      setResult({ spotNumber: res.spotNumber || '', ownerPhone: res.ownerPhone || '' });
      setStep(3);
      onSubmit();
    } else {
      alert('Error: ' + (res.error || 'Unknown error'));
    }
  };

  const handleCopyVenmo = async () => {
    const venmoHandle = spot.venmo.replace('@', '');
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(venmoHandle);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        await handleCopyVenmoOlderBrowsers(venmoHandle)
      }
    } catch (err) {
      alert('Unable to copy. Please copy manually: ' + venmoHandle);
    }
  };

  const handleCopyVenmoOlderBrowsers = async (venmoHandle: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = venmoHandle;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Unable to copy. Please copy manually: ' + venmoHandle);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  const handleClose = () => {
    setStep(1);
    setResult(null);
    onClose();
  };

  // Determine minimum date for rental start (today in PST or spot start date, whichever is later)
  const nowPST = getNowInPST();
  const minFromDate = spotFrom.date > nowPST.date ? spotFrom.date : nowPST.date;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 3 ? '✅ Rental Confirmed!' : 'Rent Parking Spot'}>
      {step === 1 && (
        <>
          <div className="availability-info">
            <div className="label">Available From:</div>
            <div className="value">{formatDateTimeDisplay(spot.availableFrom)}</div>
            <div style={{ height: '8px' }} />
            <div className="label">Available To:</div>
            <div className="value">{formatDateTimeDisplay(spot.availableTo)}</div>
          </div>
          {spot.notes && (
            <div className="availability-info" style={{ background: 'var(--accent-light)' }}>
              <div className="label">Owner's Note</div>
              <div className="value">{spot.notes}</div>
            </div>
          )}
          <DateTimeInput
            label="Rental Start"
            required
            date={rentData.fromDate}
            time={rentData.fromTime}
            onDateChange={(v) =>
              setRentData(prev => ({
                ...prev,
                fromDate: v,
                fromTime: v === spotFrom.date ? spotFrom.time : prev.fromTime
              }))
            }
            onTimeChange={(v) => setRentData(prev => ({ ...prev, fromTime: v }))}
            minDate={minFromDate}
            maxDate={spotTo.date}
            minTime={getFromTimeMin()}
            showTimeBounds={!!getFromTimeMin()}
          />
          <DateTimeInput
            label="Rental End"
            required
            date={rentData.toDate}
            time={rentData.toTime}
            onDateChange={(v) =>
              setRentData(prev => ({
                ...prev,
                toDate: v,
                toTime: v === spotTo.date ? spotTo.time : prev.toTime
              }))
            }
            onTimeChange={(v) => setRentData(prev => ({ ...prev, toTime: v }))}
            minDate={rentData.fromDate || spotFrom.date}
            maxDate={spotTo.date}
            maxTime={getToTimeMax()}
            showTimeBounds={rentData.toDate === spotTo.date}
          />
          <div className="cost-box">
            <div className="cost-row">
              <span className="label">
                ${spot.pricePerDay} × {days} {days === 1 ? 'day' : 'days'}
              </span>
              <span>${total}</span>
            </div>
            {hours > 0 && (
              <div className="cost-row" style={{ fontSize: '13px' }}>
                <span className="label">({hours.toFixed(1)} hours total)</span>
                <span></span>
              </div>
            )}
            <div className="cost-row total">
              <span className="label">Total</span>
              <span className="value">${total}</span>
            </div>
          </div>
          <div className="venmo-box">
            <div className="label">Send payment via Venmo to:</div>
            <div className="venmo-content">
              <div className="handle">{spot.venmo}</div>
              <button
                className="copy-venmo-btn"
                onClick={handleCopyVenmo}
                disabled={copied}
                title={copied ? 'Copied!' : 'Copy to clipboard'}
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
            <a
              href={`https://venmo.com/${spot.venmo.replace('@', '')}?txn=pay&amount=${total}&note=Parking Spot Rental: ${formatDateTimeDisplay(startDateTime).replace(' PST', '')} to ${formatDateTimeDisplay(endDateTime)}`}
              className="btn btn-secondary"
              style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              💳 Open in Venmo
            </a>
          </div>
          <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!canProceedToStep2}>
            I've Sent the Payment →
          </button>
          {validationError && (
            <div className="error-msg" style={{ textAlign: 'center', marginTop: '8px' }}>
              {validationError}
            </div>
          )}
        </>
      )}
      {step === 2 && (
        <>
          <div className="form-group">
            <label className="required">Your Name</label>
            <input
              type="text"
              className="input"
              placeholder="Your full name"
              value={rentData.name}
              onChange={(e) => setRentData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="required">Your Email</label>
              <input
                type="email"
                className={`input ${step2Errors.email ? 'error' : ''}`}
                placeholder="you@email.com"
                value={rentData.email}
                onChange={(e) => setRentData(prev => ({ ...prev, email: e.target.value }))}
              />
              {step2Errors.email && <div className="error-msg">{step2Errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="required">Your Phone</label>
              <input
                type="tel"
                className={`input ${step2Errors.phone ? 'error' : ''}`}
                placeholder="(555) 123-4567"
                value={rentData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
              />
              {step2Errors.phone && <div className="error-msg">{step2Errors.phone}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="required">Upload your Venmo payment screenshot</label>
            <div
              className={`upload-area ${rentData.screenshotPreview ? 'has-file' : ''}`}
              onClick={() => document.getElementById('screenshot-input')?.click()}
            >
              <input
                type="file"
                id="screenshot-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {rentData.screenshotPreview ? (
                <img src={rentData.screenshotPreview} className="upload-preview" alt="Screenshot" />
              ) : (
                <>
                  <div className="upload-icon">📤</div>
                  <div className="upload-text">Click to upload screenshot</div>
                  <div className="upload-hint">PNG, JPG up to 10MB</div>
                </>
              )}
            </div>
            {rentData.screenshotPreview && (
              <button className="clear-btn" onClick={clearScreenshot}>
                ✕ Clear Image
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleConfirm} disabled={!canConfirm || loading}>
              {loading ? 'Processing...' : 'Confirm & Get Spot Number'}
            </button>
          </div>
          {!canConfirm && (
            <div className="error-msg" style={{ textAlign: 'center', marginTop: '8px' }}>
              Please fill in all fields correctly and upload a screenshot
            </div>
          )}
        </>
      )}
      {step === 3 && result && (
        <div className="success-content">
          {/* <div className="success-icon">🎉</div> */}
          <div className="spot-number-reveal">
            <div className="label">Your parking spot number is:</div>
            <div className="number">{result.spotNumber}</div>
          </div>
          <div className="owner-contact">
            <div className="label">Owner's Phone (for questions)</div>
            <div className="value">{result.ownerPhone || '—'}</div>
          </div>
          <div className="owner-contact">
            <div className="label">Rental Period</div>
            <div className="value">
              {formatDateTimeDisplay(startDateTime)}
            </div>
            <div className="value">
              →
            </div>
            <div className="value">
              {formatDateTimeDisplay(endDateTime)}
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            A confirmation email has been sent to you and the spot owner.
          </p>
          <button className="btn btn-secondary" onClick={handleClose}>
            Done
          </button>
        </div>
      )}
    </Modal>
  );
};
