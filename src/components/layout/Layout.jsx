import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = ({ children, activePage, setActivePage, onLogout }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <Navbar 
        currentPage={pageNames[activePage]} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        onLogout={onLogout}
      />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full z-50 md:hidden"
            >
              <Sidebar 
                activePage={activePage} 
                setActivePage={(page) => {
                  setActivePage(page);
                  setSidebarOpen(false);
                }}
                isMobile={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main 
        className="md:ml-64 mt-16 p-4 md:p-6 pb-24 md:pb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={activePage}
      >
        {children}
      </motion.main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNav activePage={activePage} setActivePage={setActivePage} />
      )}
    </div>
  );
};

export default Layout;
