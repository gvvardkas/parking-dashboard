import React, { useState, useEffect } from 'react';
import { AccessScreen } from './components/AccessScreen';
import { Dashboard } from './components/Dashboard';
import { getSession, clearSession, isSessionExpired } from './utils/session';
import { api } from './services/api';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
type Page = 'dashboard' | 'faq';

export const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      const session = getSession();

      // No session exists
      if (!session) {
        setAuthState('unauthenticated');
        return;
      }

      // Session expired (7 days)
      if (isSessionExpired(session)) {
        clearSession();
        setAuthState('unauthenticated');
        return;
      }

      // Verify password version with server
      const result = await api.checkSession(session.version);
      if (result.valid) {
        setAuthState('authenticated');
      } else {
        // Password was changed, force re-login
        clearSession();
        setAuthState('unauthenticated');
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    clearSession();
    setAuthState('unauthenticated');
  };

  if (authState === 'loading') {
    return (
      <div className="access-screen">
        <div className="access-box">
          <h1>🚗 The Palms Parking</h1>
          <div className="spinner" style={{ marginTop: '20px' }}></div>
          <p style={{ marginTop: '16px' }}>Checking access...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <AccessScreen onAccess={() => setAuthState('authenticated')} />;
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    />
  );
};
