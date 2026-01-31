// Data Settings - Simple action buttons for navbar with URL input modal
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, RefreshCw, CheckCircle, X, Link2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

const DataSettings = () => {
  const [status, setStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState('');
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
    if (!url.trim()) {
      return;
    }
    setStatus('fetching');
    const result = await fetchFromGoogleSheets(url);
    if (result) {
      setStatus('success');
      setShowModal(false);
      setTimeout(() => setStatus(null), 2000);
    } else {
      setStatus('error');
    }
  };

  const handleAnalyze = async () => {
    setStatus('analyzing');
    await analyzeAllAudio();
    setStatus('success');
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <>
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

        {/* Fetch Live Button - Opens Modal */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
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

      {/* URL Input Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl max-w-md w-full shadow-2xl ${
                isDarkMode ? 'bg-[#0d0f1a] border border-purple-500/30' : 'bg-white'
              }`}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isDarkMode ? 'border-purple-500/20' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Cloud className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`} />
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-navy'}`}>
                    Fetch Live Data
                  </h3>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-purple-500/20' : 'hover:bg-gray-100'}`}
                >
                  <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Google Sheets URL
                  </label>
                  <div className="relative">
                    <Link2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-purple-900/30 border-purple-500/30 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500' 
                          : 'border-gray-300 focus:ring-teal focus:border-teal'
                      }`}
                    />
                  </div>
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    ⚠️ Make sure the sheet is shared publicly
                  </p>
                </div>

                {/* Status */}
                {status === 'error' && (
                  <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded-lg">
                    Failed to fetch. Ensure the sheet is public.
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      isDarkMode 
                        ? 'bg-purple-900/30 text-gray-300 hover:bg-purple-900/50' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFetchLive}
                    disabled={loading || !url.trim()}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50' 
                        : 'bg-teal text-white hover:bg-teal/90 disabled:opacity-50'
                    }`}
                  >
                    <Cloud className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                    {loading ? 'Fetching...' : 'Fetch Data'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DataSettings;
