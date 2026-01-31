// Data Loading Overlay - Shows progress during audio analysis
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Music2, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

const DataLoadingOverlay = () => {
  const { analyzing, progress } = useData();

  return (
    <AnimatePresence>
      {analyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal/10 rounded-xl">
                <Brain className="w-8 h-8 text-teal animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy">AI Analysis in Progress</h3>
                <p className="text-gray-500 text-sm">Processing audio recordings...</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">
                  Analyzing call {progress.current} of {progress.total}
                </span>
                <span className="font-semibold text-teal">{progress.percentage}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal to-teal/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <AnalysisStep 
                icon={<Music2 className="w-4 h-4" />}
                label="Downloading audio file"
                active={progress.percentage < 30}
                complete={progress.percentage >= 30}
              />
              <AnalysisStep 
                icon={<Brain className="w-4 h-4" />}
                label="Running AI analysis"
                active={progress.percentage >= 30 && progress.percentage < 70}
                complete={progress.percentage >= 70}
              />
              <AnalysisStep 
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="Generating insights"
                active={progress.percentage >= 70 && progress.percentage < 100}
                complete={progress.percentage >= 100}
              />
            </div>

            {/* Current File */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">CURRENT FILE</p>
              <p className="text-sm text-navy font-mono truncate">
                call-recording-{progress.current}.mp3
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AnalysisStep = ({ icon, label, active, complete }) => (
  <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
    active ? 'bg-teal/10' : complete ? 'bg-green-50' : 'bg-gray-50'
  }`}>
    <div className={`p-1.5 rounded-lg ${
      active ? 'bg-teal text-white' : complete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
    }`}>
      {complete ? <CheckCircle2 className="w-4 h-4" /> : icon}
    </div>
    <span className={`text-sm ${
      active ? 'text-teal font-medium' : complete ? 'text-green-600' : 'text-gray-400'
    }`}>
      {label}
    </span>
    {active && (
      <div className="ml-auto">
        <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )}
  </div>
);

export default DataLoadingOverlay;
