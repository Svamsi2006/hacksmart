// Data Settings Modal - Configure Google Sheets URL and trigger fetch
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Cloud, Link2, CheckCircle, AlertCircle, X, Database, Brain } from 'lucide-react';
import Button from './Button';
import { useData } from '../../context/DataContext';

const DataSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState(null);

  const { 
    fetchFromGoogleSheets, 
    analyzeAllAudio,
    loading, 
    analyzing,
    error, 
    dataSource,
    calls,
    sheetUrl,
    loadDemoData 
  } = useData();

  const handleFetch = async () => {
    if (!url.trim()) {
      setStatus({ type: 'error', message: 'Please enter a Google Sheets URL' });
      return;
    }

    setStatus({ type: 'loading', message: 'Fetching data...' });
    const result = await fetchFromGoogleSheets(url);
    
    if (result) {
      setStatus({ type: 'success', message: `Successfully loaded ${result.length} calls!` });
    } else {
      setStatus({ type: 'error', message: 'Failed to fetch. Ensure the sheet is public.' });
    }
  };

  const handleAnalyze = async () => {
    setStatus({ type: 'loading', message: 'Starting AI analysis...' });
    await analyzeAllAudio();
    setStatus({ type: 'success', message: 'Analysis complete!' });
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
        title="Data Settings"
      >
        <Settings className="w-5 h-5 text-gray-600" />
        {dataSource === 'live' && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-teal rounded-full"></span>
        )}
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal/10 rounded-lg">
                    <Cloud className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy">Data Settings</h2>
                    <p className="text-sm text-gray-600">Connect to your Google Sheets data</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Current Status */}
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                  dataSource === 'live' ? 'bg-teal/10 border border-teal/30' : 'bg-gray-100'
                }`}>
                  {dataSource === 'live' ? (
                    <CheckCircle className="w-5 h-5 text-teal" />
                  ) : (
                    <Database className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="font-semibold text-navy">
                      {dataSource === 'live' ? 'Live Data Connected' : 'Using Demo Data'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {calls.length} calls loaded
                    </p>
                  </div>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Google Sheets URL
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ Make sure the sheet is shared publicly (Anyone with the link → Viewer)
                  </p>
                </div>

                {/* Status Message */}
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      status.type === 'success' ? 'bg-teal/10 text-teal' :
                      status.type === 'error' ? 'bg-danger/10 text-danger' :
                      'bg-amber/10 text-amber'
                    }`}
                  >
                    {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                     status.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                     <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                    <span className="text-sm font-medium">{status.message}</span>
                  </motion.div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-danger/10 rounded-lg text-danger">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Button
                    variant="primary"
                    onClick={handleFetch}
                    disabled={loading || !url.trim()}
                    className="w-full justify-center"
                  >
                    <Cloud className={`w-4 h-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
                    {loading ? 'Fetching...' : 'Fetch Data from Google Sheets'}
                  </Button>

                  {calls.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="w-full justify-center"
                    >
                      <Brain className={`w-4 h-4 mr-2 ${analyzing ? 'animate-pulse' : ''}`} />
                      {analyzing ? 'Analyzing...' : 'Run AI Analysis on All Calls'}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => {
                      loadDemoData();
                      setStatus({ type: 'success', message: 'Loaded demo data' });
                    }}
                    className="w-full justify-center"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Reset to Demo Data
                  </Button>
                </div>

                {/* Help Text */}
                <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Expected Sheet Format:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Column A: Call ID or Recording ID</li>
                    <li>Column B: Agent Name</li>
                    <li>Column C: City</li>
                    <li>Column D: Audio URL (Google Drive link)</li>
                    <li>Column E: Call Date</li>
                    <li>Column F: Duration</li>
                  </ul>
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
