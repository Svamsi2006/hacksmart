// Data Settings - Simple action buttons for navbar
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Brain, RefreshCw, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

const DataSettings = () => {
  const [status, setStatus] = useState(null);
  const { isDarkMode } = useTheme();

  const { 
    fetchFromGoogleSheets, 
    analyzeAllAudio,
    loading, 
    analyzing,
    dataSource,
    calls,
    sheetUrl
  } = useData();

  const handleFetchLive = async () => {
    setStatus('fetching');
    const result = await fetchFromGoogleSheets();
    if (result) {
      setStatus('success');
      setTimeout(() => setStatus(null), 2000);
    } else {
      setStatus(null);
    }
  };

  const handleAnalyze = async () => {
    setStatus('analyzing');
    await analyzeAllAudio();
    setStatus('success');
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Live Data Status Indicator */}
      <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
        dataSource === 'live' 
          ? (isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-teal/10 text-teal')
          : (isDarkMode ? 'bg-purple-900/30 text-gray-400' : 'bg-gray-100 text-gray-600')
      }`}>
        {dataSource === 'live' ? (
          <CheckCircle className="w-3.5 h-3.5" />
        ) : (
          <Cloud className="w-3.5 h-3.5" />
        )}
        <span>{calls.length} calls</span>
      </div>

      {/* Re-Analyze Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAnalyze}
        disabled={analyzing || calls.length === 0}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isDarkMode 
            ? 'bg-purple-900/30 border border-purple-500/30 text-gray-300 hover:bg-purple-900/50 disabled:opacity-50' 
            : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
        }`}
        title="Run AI Analysis"
      >
        <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{analyzing ? 'Analyzing...' : 'Re-Analyze'}</span>
      </motion.button>

      {/* Fetch Live Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleFetchLive}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isDarkMode 
            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50' 
            : 'bg-teal text-white hover:bg-teal/90 disabled:opacity-50'
        }`}
        title="Fetch Live Data from Google Sheets"
      >
        <Cloud className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
        <span className="hidden sm:inline">{loading ? 'Fetching...' : 'Fetch Live'}</span>
      </motion.button>
    </div>
  );
};

export default DataSettings;
