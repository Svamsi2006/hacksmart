import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Radio, 
  BarChart3, 
  TrendingDown, 
  GraduationCap, 
  MapPin, 
  AlertTriangle,
  X
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, isMobile = false, onClose }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-monitoring', label: 'Live Call Monitoring', icon: Radio },
    { id: 'qa-analytics', label: 'QA Analytics', icon: BarChart3 },
    { id: 'revenue-leakage', label: 'Revenue Leakage', icon: TrendingDown },
    { id: 'agent-coaching', label: 'Agent Coaching', icon: GraduationCap },
    { id: 'city-insights', label: 'City Insights', icon: MapPin },
    { id: 'supervisor-alerts', label: 'Supervisor Alerts', icon: AlertTriangle },
  ];

  return (
    <aside className={`bg-navy w-64 min-h-screen ${isMobile ? '' : 'fixed left-0 top-16'} pt-6 pb-6 overflow-y-auto`}>
      {/* Mobile Close Button */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 100" className="w-8 h-8">
              <defs>
                <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E676" />
                  <stop offset="100%" stopColor="#00C853" />
                </linearGradient>
              </defs>
              <rect x="35" y="5" width="30" height="8" rx="3" fill="url(#sidebarLogoGradient)"/>
              <path d="M25 18 L75 18 L75 25 L55 50 L75 75 L75 82 L25 82 L25 75 L45 50 L25 25 Z" fill="url(#sidebarLogoGradient)"/>
            </svg>
            <span className="text-white font-bold">Smart-Audit AI</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <nav className="space-y-1 px-3">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              initial={isMobile ? { opacity: 0, x: -20 } : false}
              animate={isMobile ? { opacity: 1, x: 0 } : false}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all touch-target
                ${isActive 
                  ? 'bg-teal text-white shadow-lg shadow-teal/30' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 px-4">
        <motion.div 
          className="bg-gradient-to-r from-teal/10 to-transparent rounded-lg p-4"
          initial={isMobile ? { opacity: 0 } : false}
          animate={isMobile ? { opacity: 1 } : false}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-400 mb-2">Powered by</p>
          <p className="text-sm font-semibold text-white">Battery Smart AI</p>
          <p className="text-xs text-gray-500 mt-1">v2.0.1</p>
        </motion.div>
      </div>
    </aside>
  );
};

export default Sidebar;
