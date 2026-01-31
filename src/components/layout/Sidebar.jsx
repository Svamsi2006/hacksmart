import { 
  LayoutDashboard, 
  Radio, 
  BarChart3, 
  TrendingDown, 
  GraduationCap, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
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
    <aside className="bg-navy w-64 min-h-screen fixed left-0 top-16 pt-6 pb-6 overflow-y-auto">
      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-teal text-white shadow-lg shadow-teal/30' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 px-6">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">Powered by</p>
          <p className="text-sm font-semibold text-white">Battery Smart AI</p>
          <p className="text-xs text-gray-500 mt-1">v2.0.1</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
