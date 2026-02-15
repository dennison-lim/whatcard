import React, { useState, useCallback } from 'react';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import { getCurrentUserId, setCurrentUserId, clearCurrentUserId } from './utils/userSession';

const App: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(() => getCurrentUserId());

  const handleSelectUser = useCallback((id: string) => {
    setCurrentUserId(id);
    setUserId(id);
  }, []);

  const handleLogout = useCallback(() => {
    clearCurrentUserId();
    setUserId(null);
  }, []);

  if (!userId) {
    return <LoginScreen onSelectUser={handleSelectUser} />;
  }

  return <HomeScreen userId={userId} onLogout={handleLogout} />;
};

export default App;
