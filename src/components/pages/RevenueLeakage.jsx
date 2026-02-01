import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useMemo } from 'react';
import { DollarSign, TrendingDown, AlertCircle, X, Play, Pause, Download, Volume2, VolumeX, SkipBack, SkipForward, RotateCcw, Loader2, FileAudio, Brain, AlertTriangle } from 'lucide-react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import BarChart from '../charts/BarChart';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { sopChecklist, escalationMatrix } from '../../data/sopData';
import { calculateRealKPIs, generateIssueSummary, formatIndianCurrency } from '../../services/analyticsService';

// Helper function to get direct audio URL from Google Drive
const getDirectAudioUrl = (driveUrl) => {       
  if (!driveUrl) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = driveUrl.match(pattern);
    if (match) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return driveUrl;
};

const RevenueLeakage = () => {
  const { calls } = useData();
  const { isDarkMode } = useTheme();
  const [selectedCall, setSelectedCall] = useState(null);
  
  // Audio player state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);

  // Audio player functions
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => {
          setAudioError('Unable to play audio. The file may not be accessible.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setAudioLoading(false);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) {
      audioRef.current.currentTime = percentage * duration;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 1 : 0;
      setIsMuted(!isMuted);
    }
  };

  const skipTime = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  // Reset audio when call changes
  useEffect(() => {
    if (selectedCall) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setAudioError(null);
      setAudioLoading(true);
    }
  }, [selectedCall?.id]);

  const handleReviewCall = (alert) => {
    // Find the full call data from calls array
    const fullCall = calls.find(c => c.id === alert.callId) || alert;
    setSelectedCall(fullCall);
  };

  // Calculate REAL KPIs from actual call data
  const realKPIs = useMemo(() => calculateRealKPIs(calls), [calls]);

  // Calculate ACCURATE revenue leakage based on REAL call data
  const calculateLeakage = () => {
    // Count actual risk distribution from real data
    const highRiskCalls = calls.filter(c => c.riskLevel === 'high');
    const mediumRiskCalls = calls.filter(c => c.riskLevel === 'medium');
    
    // Leakage calculation based on real risk data:
    // High-risk: ₹1,500 per call (major issue that could cause churn)
    // Medium-risk: ₹300 per call (potential SOP deviation)
    const highRiskLeakage = highRiskCalls.length * 1500;  // 7 × ₹1,500 = ₹10,500
    const mediumRiskLeakage = mediumRiskCalls.length * 300; // 60 × ₹300 = ₹18,000
    const total = highRiskLeakage + mediumRiskLeakage; // ₹28,500

    // Group by call type for category breakdown
    const issueGroups = {};
    calls.forEach(call => {
      if (call.riskLevel === 'high' || call.riskLevel === 'medium') {
        const issue = call.callType || 'Other';
        if (!issueGroups[issue]) {
          issueGroups[issue] = { count: 0, amount: 0 };
        }
        issueGroups[issue].count++;
        issueGroups[issue].amount += call.riskLevel === 'high' ? 1500 : 300;
      }
    });

    const categories = Object.entries(issueGroups)
      .map(([type, data]) => ({
        type,
        amount: data.amount,
        count: data.count,
        percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0,
        description: generateIssueSummary(type, 'high')
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Top 6 categories

    return { total, categories, highRiskLeakage, mediumRiskLeakage };
  };

  const leakageData = calculateLeakage();

  // Generate alerts from REAL high-risk calls
  const generateAlerts = () => {
    return calls
      .filter(call => call.riskLevel === 'high')
      .map(call => ({
        id: call.id,
        callId: call.id,
        agent: call.agent,
        issue: call.callType || 'High-Risk Issue Detected',
        severity: 'high',
        potentialLoss: 1500, // Consistent with our calculation
        time: call.callDate,
        city: call.city,
        issueSummary: generateIssueSummary(call.callType, call.riskLevel)
      }));
  };

  const revenueAlerts = generateAlerts();

  // City breakdown from REAL call data
  const cityBreakdown = () => {
    const cities = {};
    calls.forEach(call => {
      const city = call.city || 'Unknown';
      if (!cities[city]) {
        cities[city] = { city, amount: 0, cases: 0 };
      }
      
      // Only count leakage for high and medium risk calls
      if (call.riskLevel === 'high') {
        cities[city].amount += 1500;
        cities[city].cases += 1;
      } else if (call.riskLevel === 'medium') {
        cities[city].amount += 300;
        cities[city].cases += 1;
      }
    });
    
    return Object.values(cities)
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  };

  const formatCurrency = (amount) => {
    return `₹${(amount / 1000).toFixed(1)}K`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-navy'}`}>Revenue Leakage Radar</h2>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Identifying and preventing revenue loss opportunities</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20' : 'bg-gradient-to-br from-danger/10 to-danger/5 border-danger/20'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-red-500/20' : 'bg-danger/20'}`}>
              <TrendingDown className="w-6 h-6 text-danger" />
            </div>
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Leakage</span>
          </div>
          <p className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>{formatIndianCurrency(leakageData.total)}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Detected from {calls.length} calls analyzed</p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>High: ₹{leakageData.highRiskLeakage?.toLocaleString()} | Med: ₹{leakageData.mediumRiskLeakage?.toLocaleString()}</p>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20' : 'bg-gradient-to-br from-amber/10 to-amber/5 border-amber/20'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber/20'}`}>
              <AlertTriangle className="w-6 h-6 text-amber" />
            </div>
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>High-Risk Leakage</span>
          </div>
          <p className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>{formatIndianCurrency(leakageData.highRiskLeakage || 0)}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{realKPIs.highRiskCalls} high-risk calls × ₹1,500</p>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20' : 'bg-gradient-to-br from-teal/10 to-teal/5 border-teal/20'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-cyan-500/20' : 'bg-teal/20'}`}>
              <AlertCircle className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`} />
            </div>
            <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cases Identified</span>
          </div>
          <p className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>{realKPIs.highRiskCalls + realKPIs.mediumRiskCalls}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{realKPIs.highRiskCalls} high + {realKPIs.mediumRiskCalls} medium risk</p>
        </Card>
      </div>

      {/* Charts and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City-wise Leakage */}
        <Card className="p-6">
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-navy'}`}>Revenue Leakage by City</h3>
          <BarChart
            data={cityBreakdown()}
            xKey="city"
            dataKeys={['amount']}
          />
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-navy'}`}>Leakage Categories</h3>
          <div className="space-y-4">
            {leakageData.categories.map((category, index) => (
              <motion.div
                key={category.type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-navy'}`}>{category.type}</span>
                  <span className="text-lg font-bold text-danger">{formatCurrency(category.amount)}</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-purple-900/50' : 'bg-gray-200'}`}>
                  <div
                    className="h-2 rounded-full bg-danger"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{category.description}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* SOP Reference - Compensation Limits */}
      <Card className="p-6">
        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-navy'}`}>SOP Compensation Limits (Reference)</h3>
        <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Per BS-SOP-001-R2 & BS-SOP-002-R2 - Unauthorized compensation causes revenue leakage</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDarkMode ? 'bg-purple-900/30' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Scenario</th>
                <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Max Compensation</th>
                <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Authority</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-purple-500/20' : 'divide-gray-200'}`}>
              {sopChecklist.swapStation.steps[3].approvalLimits.map((limit, idx) => (
                <tr key={idx} className={isDarkMode ? 'hover:bg-purple-900/20' : 'hover:bg-gray-50'}>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{limit.scenario}</td>
                  <td className={`px-4 py-3 font-medium ${isDarkMode ? 'text-white' : 'text-navy'}`}>{limit.compensation}</td>
                  <td className="px-4 py-3">
                    <Badge variant={limit.authority.includes('L1') ? 'low' : limit.authority.includes('L2') ? 'medium' : 'high'}>
                      {limit.authority}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Alerts */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-navy mb-2">Recent Revenue Alerts</h3>
        <p className="text-xs text-gray-500 mb-6">Showing all {revenueAlerts.length} high-risk calls with potential revenue impact</p>
        {revenueAlerts.length > 0 ? (
        <div className="space-y-4">
          {revenueAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 rounded-lg border-2 ${
                alert.severity === 'high' 
                  ? 'bg-danger/5 border-danger/30' 
                  : 'bg-amber/5 border-amber/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={alert.severity}>{alert.severity.toUpperCase()}</Badge>
                    <span className="text-xs text-gray-500">{alert.callId}</span>
                    {alert.city && <span className="text-xs text-gray-400">• {alert.city}</span>}
                  </div>
                  <p className="text-sm font-semibold text-navy mb-1">{alert.issue}</p>
                  <p className="text-xs text-gray-600">Agent: {alert.agent}</p>
                  {/* Issue Summary */}
                  <p className="text-xs text-purple-700 mt-2 bg-purple-50 p-2 rounded italic">
                    💡 {alert.issueSummary}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xl font-bold text-danger">₹{alert.potentialLoss.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Potential Loss</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button size="sm" variant="danger" className="flex-1" onClick={() => handleReviewCall(alert)}>Review Call</Button>
                <Button size="sm" variant="outline" className="flex-1">Send Coaching</Button>
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-teal" />
            <p className="font-medium">No high-risk revenue alerts detected!</p>
            <p className="text-sm mt-1">All {calls.length} calls are within acceptable parameters.</p>
          </div>
        )}
      </Card>

      {/* Call Review Slide-in Panel */}
      <AnimatePresence>
        {selectedCall && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setSelectedCall(null)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Panel Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-navy/5 to-teal/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <FileAudio className="w-4 h-4" />
                        <span>{selectedCall.id}</span>
                        <span>•</span>
                        <span>{selectedCall.duration || '5:30'}</span>
                      </div>
                      <h3 className="text-lg font-bold text-navy">{selectedCall.agent}</h3>
                      <p className="text-sm text-gray-600">{selectedCall.city || 'Unknown City'} • {selectedCall.callType || 'Inbound'}</p>
                    </div>
                    <button onClick={() => setSelectedCall(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Audio Player */}
                  <div className="bg-gradient-to-r from-navy/5 to-teal/5 rounded-xl p-4">
                    <audio
                      ref={audioRef}
                      src={getDirectAudioUrl(selectedCall.audioUrl)}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onError={() => { setAudioError('Unable to load audio'); setAudioLoading(false); }}
                      onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
                      onCanPlay={() => setAudioLoading(false)}
                      preload="metadata"
                    />
                    
                    {audioError ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <FileAudio className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-amber-800">Audio Loading Issue</p>
                            <p className="text-xs text-amber-600">{audioError}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setAudioError(null);
                              setAudioLoading(true);
                              if (audioRef.current) {
                                audioRef.current.load();
                              }
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Retry
                          </button>
                          <a 
                            href={selectedCall.audioUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Open in Drive
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={togglePlay}
                          disabled={audioLoading}
                          className="w-14 h-14 bg-teal rounded-full flex items-center justify-center hover:bg-teal/90 transition-colors shadow-lg disabled:opacity-50"
                        >
                          {audioLoading ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          ) : isPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white ml-1" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div 
                            className="h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                            onClick={handleSeek}
                          >
                            <div 
                              className="h-2 bg-teal rounded-full transition-all duration-100"
                              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>{formatTime(currentTime)}</span>
                            <span className="font-medium">{formatTime(duration) || selectedCall.duration || '0:00'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button onClick={() => skipTime(-10)} className="p-2 hover:bg-white rounded-lg transition-colors" title="Rewind 10s">
                            <SkipBack className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={restartAudio} className="p-2 hover:bg-white rounded-lg transition-colors" title="Restart">
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={() => skipTime(10)} className="p-2 hover:bg-white rounded-lg transition-colors" title="Forward 10s">
                            <SkipForward className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={toggleMute} className="p-2 hover:bg-white rounded-lg transition-colors" title={isMuted ? 'Unmute' : 'Mute'}>
                            {isMuted ? <VolumeX className="w-4 h-4 text-gray-600" /> : <Volume2 className="w-4 h-4 text-gray-600" />}
                          </button>
                          <a href={selectedCall.audioUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white rounded-lg transition-colors" title="Download">
                            <Download className="w-4 h-4 text-gray-600" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Call Info Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-navy">{selectedCall.qaScore || selectedCall.sopAdherence}%</p>
                      <p className="text-xs text-gray-500">QA Score</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-navy">{selectedCall.sopAdherence}%</p>
                      <p className="text-xs text-gray-500">SOP</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Badge variant={selectedCall.sentiment} className="text-xs">
                        {selectedCall.sentiment?.toUpperCase() || 'NEUTRAL'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Sentiment</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Badge variant={selectedCall.riskLevel} className="text-xs">
                        {selectedCall.riskLevel?.toUpperCase() || 'HIGH'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Risk</p>
                    </div>
                  </div>

                  {/* Call Details */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Call Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Customer Number</p>
                        <p className="font-medium text-navy">{selectedCall.callingNo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Call Date</p>
                        <p className="font-medium text-navy">{selectedCall.callDate || 'Today'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">City</p>
                        <p className="font-medium text-navy">{selectedCall.city || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-medium text-navy">{selectedCall.duration || '5:30'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Impact */}
                  <div className="bg-danger/5 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-danger mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Revenue Impact Assessment
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Estimated Loss</p>
                        <p className="font-bold text-danger text-lg">₹{selectedCall.riskLevel === 'high' ? '2,500' : '1,000'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Issue Type</p>
                        <p className="font-medium text-navy">{selectedCall.callType || 'SOP Violation'}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {selectedCall.summary && (
                    <div className="bg-teal/5 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-teal" />
                        AI Analysis Summary
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedCall.summary}</p>
                    </div>
                  )}

                  {/* Issues Found */}
                  {selectedCall.issues && selectedCall.issues.length > 0 && (
                    <div className="bg-amber/5 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-amber mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Issues Detected
                      </h4>
                      <ul className="space-y-2">
                        {selectedCall.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-amber">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RevenueLeakage;
