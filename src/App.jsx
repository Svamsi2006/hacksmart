import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DataProvider } from './context/DataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Overview from './components/pages/Overview';
import LiveCallMonitoring from './components/pages/LiveCallMonitoring';
import QAAnalytics from './components/pages/QAAnalytics';
import RevenueLeakage from './components/pages/RevenueLeakage';
import AgentCoaching from './components/pages/AgentCoaching';
import SupervisorAlerts from './components/pages/SupervisorAlerts';
import AboutPage from './components/pages/AboutPage';
import DataLoadingOverlay from './components/shared/DataLoadingOverlay';
import LoadingScreen from './components/shared/LoadingScreen';
import LoginScreen from './components/auth/LoginScreen';
import ChatBot from './components/shared/ChatBot';

function App() {
  const [activePage, setActivePage] = useState('overview');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user was previously authenticated
    return localStorage.getItem('smartaudit_authenticated') === 'true';
  });

  // Initial loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('smartaudit_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('smartaudit_authenticated');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <Overview setActivePage={setActivePage} />;
      case 'live-monitoring':
        return <LiveCallMonitoring />;
      case 'qa-analytics':
        return <QAAnalytics />;
      case 'revenue-leakage':
        return <RevenueLeakage />;
      case 'agent-coaching':
        return <AgentCoaching />;
      case 'supervisor-alerts':
        return <SupervisorAlerts />;
      case 'about':
        return <AboutPage />;
      default:
        return <Overview setActivePage={setActivePage} />;
    }
  };

  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent 
          isAuthenticated={isAuthenticated}
          isInitialLoading={isInitialLoading}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          activePage={activePage}
          setActivePage={setActivePage}
          renderPage={renderPage}
        />
      </DataProvider>
    </ThemeProvider>
  );
}

// Separate component to use theme context
function AppContent({ isAuthenticated, isInitialLoading, handleLogin, handleLogout, activePage, setActivePage, renderPage }) {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-background'}`}>
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <LoginScreen key="login" onLogin={handleLogin} />
        ) : isInitialLoading ? (
          <LoadingScreen key="loading" message="Initializing dashboard..." />
        ) : (
          <>
            <DataLoadingOverlay />
            <Layout activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout}>
              {renderPage()}
            </Layout>
            <ChatBot />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
