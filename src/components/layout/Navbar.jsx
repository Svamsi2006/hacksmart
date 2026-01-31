import { Building2, Calendar, ChevronDown, User, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DataSettings from '../shared/DataSettings';
import NotificationCenter from '../shared/NotificationCenter';
import { useData } from '../../context/DataContext';

const Navbar = ({ currentPage, onMenuClick, isMobile, onLogout }) => {
  const { selectedCity, setSelectedCity, selectedDateRange, setSelectedDateRange } = useData();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const cities = ['All Cities', 'Delhi', 'Noida', 'Gurgaon', 'Ghaziabad', 'Bangalore', 'Pune', 'Hyderabad'];
  // Actual dates from Google Sheets data
  const dateRanges = ['All Time', '1/29/26', '1/28/26'];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {isMobile && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </motion.button>
          )}
          
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <motion.div 
              className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-teal to-navy rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Battery Smart Logo */}
              <svg viewBox="0 0 100 100" className="w-5 h-5 md:w-6 md:h-6">
                <defs>
                  <linearGradient id="navLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00E676" />
                    <stop offset="100%" stopColor="#00C853" />
                  </linearGradient>
                </defs>
                <rect x="35" y="5" width="30" height="8" rx="3" fill="url(#navLogoGradient)"/>
                <path d="M25 18 L75 18 L75 25 L55 50 L75 75 L75 82 L25 82 L25 75 L45 50 L25 25 Z" fill="url(#navLogoGradient)"/>
              </svg>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-navy">Smart-Audit AI</h1>
              <p className="text-[10px] md:text-xs text-gray-500">Battery Smart Intelligence</p>
            </div>
          </div>
        </div>

        {/* Center - Page Title (Desktop only) */}
        <h2 className="hidden lg:block text-lg font-semibold text-gray-700">{currentPage}</h2>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* City Selector - Desktop only */}
          <div className="relative hidden lg:block">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Range Selector - Desktop only */}
          <div className="relative hidden lg:block">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 pl-10 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              {dateRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* Data Settings */}
          <div className="hidden sm:block">
            <DataSettings />
          </div>

          {/* Profile with Logout */}
          <div className="relative">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogoutMenu(!showLogoutMenu)}
              className="flex items-center gap-1 md:gap-2 bg-teal/10 px-2 md:px-4 py-2 rounded-lg cursor-pointer"
            >
              <User className="w-5 h-5 text-teal" />
              <span className="hidden sm:block text-sm font-medium text-navy">Supervisor</span>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </motion.div>
            
            {/* Logout Dropdown */}
            {showLogoutMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
              >
                <button
                  onClick={() => {
                    setShowLogoutMenu(false);
                    onLogout && onLogout();
                  }}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 font-medium text-sm w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
