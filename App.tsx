
import React, { useState } from 'react';
import { Login } from './components/Login';
import MarketAnalysisTool from './components/MarketAnalysisTool';
import { LanguageProvider } from './components/LanguageContext';

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return <MarketAnalysisTool />;
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;