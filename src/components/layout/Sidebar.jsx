import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Radio, 
  BarChart3, 
  TrendingDown, 
  GraduationCap, 
  AlertTriangle,
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import logoImage from '../../assets/batterysmart_logo.jpg';

const Sidebar = ({ activePage, setActivePage, isMobile = false, onClose }) => {
  const { isDarkMode } = useTheme();
  
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-monitoring', label: 'Live Call Monitoring', icon: Radio },
    { id: 'qa-analytics', label: 'QA Analytics', icon: BarChart3 },
    { id: 'revenue-leakage', label: 'Revenue Leakage', icon: TrendingDown },
    { id: 'agent-coaching', label: 'Agent Coaching', icon: GraduationCap },
    { id: 'supervisor-alerts', label: 'Supervisor Alerts', icon: AlertTriangle },
  ];

  return (
    <aside className={`w-64 min-h-screen ${isMobile ? '' : 'fixed left-0 top-16'} pt-6 pb-6 overflow-y-auto transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0d0f1a] border-r border-purple-500/20' : 'bg-navy'
    }`}>
      {/* Mobile Close Button */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="Battery Smart" className="w-8 h-8 rounded-lg object-cover" />
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
                  ? (isDarkMode 
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-teal text-white shadow-lg shadow-teal/30')
                  : (isDarkMode
                      ? 'text-gray-400 hover:bg-purple-500/10 hover:text-cyan-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white')
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive && isDarkMode ? 'text-cyan-300' : ''}`} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className={`absolute right-3 w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-cyan-400' : 'bg-white'}`}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 px-4">
        <motion.div 
          className={`rounded-lg p-4 ${isDarkMode ? 'bg-gradient-to-r from-purple-500/10 to-transparent' : 'bg-gradient-to-r from-teal/10 to-transparent'}`}
          initial={isMobile ? { opacity: 0 } : false}
          animate={isMobile ? { opacity: 1 } : false}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-400 mb-2">Powered by</p>
          <p className={`text-sm font-semibold ${isDarkMode ? 'text-cyan-400' : 'text-white'}`}>Battery Smart AI</p>
          <p className="text-xs text-gray-500 mt-1">v2.0.1</p>
        </motion.div>
      </div>
    </aside>
  );
};

export default Sidebar;
