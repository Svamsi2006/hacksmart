import { useState } from 'react';
import { DataProvider } from './context/DataContext';
import Layout from './components/layout/Layout';
import Overview from './components/pages/Overview';
import LiveCallMonitoring from './components/pages/LiveCallMonitoring';
import QAAnalytics from './components/pages/QAAnalytics';
import RevenueLeakage from './components/pages/RevenueLeakage';
import AgentCoaching from './components/pages/AgentCoaching';
import CityInsights from './components/pages/CityInsights';
import SupervisorAlerts from './components/pages/SupervisorAlerts';
import DataLoadingOverlay from './components/shared/DataLoadingOverlay';

function App() {
  const [activePage, setActivePage] = useState('overview');

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
      case 'city-insights':
        return <CityInsights />;
      case 'supervisor-alerts':
        return <SupervisorAlerts />;
      default:
        return <Overview setActivePage={setActivePage} />;
    }
  };

  return (
    <DataProvider>
      <DataLoadingOverlay />
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {renderPage()}
      </Layout>
    </DataProvider>
  );
}

export default App;
