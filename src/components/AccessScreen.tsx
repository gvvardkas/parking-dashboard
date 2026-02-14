import React, { useState } from 'react';
import { api } from '../services/api';
import { saveSession } from '../utils/session';

interface AccessScreenProps {
  onAccess: () => void;
}

export const AccessScreen: React.FC<AccessScreenProps> = ({ onAccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter the access code');
      return;
    }
    setLoading(true);
    setError('');
    const result = await api.validateAccess(code);
    setLoading(false);

    if (result.success) {
      saveSession(code, result.version || 1);
      onAccess();
    } else {
      setError(result.error || 'Incorrect access code');
    }
  };

  return (
    <div className="access-screen">
      <div className="access-box">
        <h1>🚗 The Palms Parking</h1>
        <p>Enter the access code to view available spots</p>
        <input
          type="password"
          className={`input ${error ? 'error' : ''}`}
          placeholder="Enter access code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
          style={{ marginBottom: '16px' }}
          disabled={loading}
        />
        {error && <div className="error-msg" style={{ marginBottom: '16px' }}>{error}</div>}
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Verifying...' : 'Enter Dashboard'}
        </button>
      </div>
    </div>
  );
};
