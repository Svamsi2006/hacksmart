import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Phone, TrendingUp, CheckCircle, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { calculateRealKPIs } from '../../services/analyticsService';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(true);
  const { calls } = useData();

  // Generate notifications based on real data
  useEffect(() => {
    if (calls.length > 0) {
      const kpis = calculateRealKPIs(calls);
      const highRiskCalls = calls.filter(c => c.riskLevel === 'high');
      
      const newNotifications = [
        {
          id: 1,
          type: 'alert',
          icon: AlertTriangle,
          title: `${kpis.highRiskCalls} High-Risk Cases Found`,
          message: `${kpis.highRiskCalls} calls require immediate supervisor attention`,
          time: '2 min ago',
          read: false,
          color: 'danger'
        },
        {
          id: 2,
          type: 'info',
          icon: Phone,
          title: `${calls.length} Call Recordings Added`,
          message: 'New call data synced from Google Sheets',
          time: '5 min ago',
          read: false,
          color: 'teal'
        },
        {
          id: 3,
          type: 'success',
          icon: TrendingUp,
          title: `₹${kpis.revenueSaved.toLocaleString()} Revenue Saved`,
          message: 'Proactive monitoring prevented potential leakage',
          time: '10 min ago',
          read: true,
          color: 'teal'
        },
        {
          id: 4,
          type: 'info',
          icon: CheckCircle,
          title: `QA Score: ${kpis.avgQAScore}%`,
          message: 'Company-wide average across all agents',
          time: '15 min ago',
          read: true,
          color: 'blue'
        }
      ];

      // Add specific high-risk call notifications
      highRiskCalls.slice(0, 2).forEach((call, idx) => {
        newNotifications.push({
          id: 10 + idx,
          type: 'alert',
          icon: AlertTriangle,
          title: `${call.callType} - ${call.agent}`,
          message: `High-risk call from ${call.city} needs review`,
          time: `${20 + idx * 5} min ago`,
          read: true,
          color: 'amber'
        });
      });

      setNotifications(newNotifications);
    }
  }, [calls]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setHasNew(false);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getColorClasses = (color) => {
    const colors = {
      danger: 'bg-red-100 text-red-600 border-red-200',
      teal: 'bg-teal/10 text-teal border-teal/20',
      amber: 'bg-amber/10 text-amber border-amber/20',
      blue: 'bg-blue-100 text-blue-600 border-blue-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setHasNew(false);
        }}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          >
            {unreadCount}
          </motion.span>
        )}
        {hasNew && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
          />
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-[calc(100vw-32px)] md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
              style={{ maxHeight: 'calc(100vh - 100px)' }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-navy/5 to-teal/5">
                <div>
                  <h3 className="font-bold text-navy">Notifications</h3>
                  <p className="text-xs text-gray-500">{unreadCount} unread</p>
                </div>
                <button
                  onClick={markAllRead}
                  className="text-xs text-teal hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification, index) => {
                      const Icon = notification.icon;
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-teal/5' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColorClasses(notification.color)}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium text-navy ${!notification.read ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </p>
                                <button
                                  onClick={() => dismissNotification(notification.id)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                                >
                                  <X className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal rounded-r" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-teal font-medium hover:underline"
                >
                  View All Alerts →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
