import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, activePage, setActivePage }) => {
  const pageNames = {
    'overview': 'Overview Dashboard',
    'live-monitoring': 'Live Call Monitoring',
    'qa-analytics': 'QA Analytics',
    'revenue-leakage': 'Revenue Leakage Radar',
    'agent-coaching': 'Agent Coaching Panel',
    'city-insights': 'City Insights',
    'supervisor-alerts': 'Supervisor Alerts',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={pageNames[activePage]} />
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
