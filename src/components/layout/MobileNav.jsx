import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Headphones, 
  BarChart3, 
  TrendingDown, 
  Users,
  AlertTriangle,
  Info
} from 'lucide-react';

const MobileNav = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Home' },
    { id: 'live-monitoring', icon: Headphones, label: 'Calls' },
    { id: 'qa-analytics', icon: BarChart3, label: 'QA' },
    { id: 'revenue-leakage', icon: TrendingDown, label: 'Revenue' },
    { id: 'agent-coaching', icon: Users, label: 'Agents' },
    { id: 'supervisor-alerts', icon: AlertTriangle, label: 'Alerts' },
    { id: 'about', icon: Info, label: 'About' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl min-w-[60px] transition-all ${
                isActive 
                  ? 'bg-teal/10' 
                  : 'hover:bg-gray-50'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon 
                  className={`w-5 h-5 ${
                    isActive ? 'text-teal' : 'text-gray-500'
                  }`}
                />
              </motion.div>
              <span 
                className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'text-teal' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-teal"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNav;
