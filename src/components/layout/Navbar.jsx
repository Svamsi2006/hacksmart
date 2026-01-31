import { Building2, Calendar, ChevronDown, User, Bell } from 'lucide-react';
import { useState } from 'react';
import DataSettings from '../shared/DataSettings';

const Navbar = ({ currentPage }) => {
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [dateRange, setDateRange] = useState('Today');

  const cities = ['All Cities', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'];
  const dateRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'Custom'];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal to-navy rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy">Smart-Audit AI</h1>
            <p className="text-xs text-gray-500">Battery Smart Intelligence</p>
          </div>
        </div>

        {/* Page Title */}
        <h2 className="text-lg font-semibold text-gray-700">{currentPage}</h2>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* City Selector */}
          <div className="relative">
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

          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
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
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>

          {/* Data Settings */}
          <DataSettings />

          {/* Profile */}
          <div className="flex items-center gap-2 bg-teal/10 px-4 py-2 rounded-lg">
            <User className="w-5 h-5 text-teal" />
            <span className="text-sm font-medium text-navy">Supervisor</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
