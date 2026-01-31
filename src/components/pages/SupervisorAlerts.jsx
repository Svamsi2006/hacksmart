import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useMemo } from 'react';
import { AlertTriangle, Clock, Brain, Zap, X, Play, Pause, Download, Volume2, VolumeX, SkipBack, SkipForward, RotateCcw, Loader2, MessageSquare, User, Headphones, FileAudio, Mail } from 'lucide-react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import { useData } from '../../context/DataContext';
import { supervisorAlerts as fallbackAlerts } from '../../data/mockData';
import { calculateRealKPIs, formatIndianCurrency, generateIssueSummary } from '../../services/analyticsService';
import { sendSupervisorAlertEmail } from '../../services/emailService';

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

const SupervisorAlerts = () => {
  const { calls, getHighRiskCalls } = useData();
  const [selectedCall, setSelectedCall] = useState(null);
  
  // Calculate real KPIs for accurate Prevention Impact
  const realKPIs = useMemo(() => calculateRealKPIs(calls), [calls]);
  const preventionImpact = useMemo(() => Math.round(realKPIs.revenueSaved * 0.5), [realKPIs]);
  
  // Audio player state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);

  // Generate alerts from high-risk calls
  const generateAlerts = () => {
    const highRiskCalls = getHighRiskCalls();
    
    if (highRiskCalls.length === 0) return fallbackAlerts;

    return highRiskCalls.slice(0, 8).map((call, idx) => ({
      id: call.id,
      callId: call.id,
      agent: call.agent,
      priority: call.sentiment === 'negative' ? 'critical' : 'high',
      sopScore: call.sopAdherence,
      timestamp: new Date(call.callDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      summary: call.summary || 'AI detected compliance issues during this call. Immediate review recommended.',
      reason: call.issues?.[0] || 'Low SOP adherence detected',
      sentiment: call.sentiment || 'neutral',
      // Include full call data for review panel
      fullCallData: call
    }));
  };

  const alerts = generateAlerts();

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
    setSelectedCall(alert.fullCallData || alert);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'border-l-4 border-danger bg-danger/5',
      high: 'border-l-4 border-amber bg-amber/5',
      medium: 'border-l-4 border-blue-500 bg-blue-50',
    };
    return colors[priority] || 'border-l-4 border-gray-300 bg-gray-50';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'critical') {
      return <AlertTriangle className="w-5 h-5 text-danger" />;
    }
    return <AlertTriangle className="w-5 h-5 text-amber" />;
  };

  const criticalCount = alerts.filter(a => a.priority === 'critical').length;
  const highCount = alerts.filter(a => a.priority === 'high').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy">Supervisor Alerts</h2>
          <p className="text-sm text-gray-600 mt-1">
            Critical calls requiring immediate attention • {alerts.length} active alerts
          </p>
        </div>
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="px-4 py-2 bg-danger/10 rounded-lg"
          >
            <p className="text-xs text-gray-600">Critical Alerts</p>
            <p className="text-2xl font-bold text-danger">{criticalCount}</p>
          </motion.div>
          <div className="px-4 py-2 bg-amber/10 rounded-lg">
            <p className="text-xs text-gray-600">High Priority</p>
            <p className="text-2xl font-bold text-amber">{highCount}</p>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 ${getPriorityColor(alert.priority)}`}>
              {/* Alert Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getPriorityIcon(alert.priority)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={alert.priority}>{alert.priority.toUpperCase()}</Badge>
                      <span className="text-xs text-gray-500">{alert.callId}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-navy mb-1">Agent: {alert.agent}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500 mb-1">SOP Score</p>
                  <p className={`text-2xl font-bold ${
                    alert.sopScore >= 80 ? 'text-teal' : alert.sopScore >= 60 ? 'text-amber' : 'text-danger'
                  }`}>
                    {alert.sopScore}%
                  </p>
                </div>
              </div>

              {/* AI Summary */}
              <div className="mb-4 p-4 bg-white rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-teal" />
                  AI Summary
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{alert.summary}</p>
              </div>

              {/* Flag Reason */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Reason for Flag</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.priority === 'critical' 
                      ? 'bg-danger/20 text-danger' 
                      : 'bg-amber/20 text-amber'
                  }`}>
                    {alert.reason}
                  </span>
                  <Badge variant={alert.sentiment}>{alert.sentiment?.toUpperCase() || 'NEUTRAL'}</Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant={alert.priority === 'critical' ? 'danger' : 'primary'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleReviewCall(alert)}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Review Call Now
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendSupervisorAlertEmail(alert, alert.fullCallData)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Send Mail
                </Button>
                <Button variant="ghost" size="sm">
                  Dismiss
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Insights Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-danger/5 border-danger/20">
          <p className="text-sm font-semibold text-gray-600 mb-2">Avg Response Time</p>
          <p className="text-3xl font-bold text-navy mb-2">4.2 min</p>
          <p className="text-xs text-gray-600">For critical alerts today</p>
        </Card>

        <Card className="p-6 bg-amber/5 border-amber/20">
          <p className="text-sm font-semibold text-gray-600 mb-2">Resolution Rate</p>
          <p className="text-3xl font-bold text-navy mb-2">89%</p>
          <p className="text-xs text-gray-600">Alerts resolved within SLA</p>
        </Card>

        <Card className="p-6 bg-teal/5 border-teal/20">
          <p className="text-sm font-semibold text-gray-600 mb-2">Prevention Impact</p>
          <p className="text-3xl font-bold text-navy mb-2">{formatIndianCurrency(preventionImpact)}</p>
          <p className="text-xs text-gray-600">Potential damage prevented today (50% of {formatIndianCurrency(realKPIs.revenueSaved)})</p>
        </Card>
      </div>

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
                        <span>{selectedCall.id || selectedCall.callId}</span>
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
                      <div className="text-center py-2">
                        <p className="text-sm text-amber-600 mb-3">{audioError}</p>
                        <a 
                          href={selectedCall.audioUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Open in Google Drive
                        </a>
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
                    <div className="bg-danger/5 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-danger mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Issues Detected
                      </h4>
                      <ul className="space-y-2">
                        {selectedCall.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-danger">•</span>
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

export default SupervisorAlerts;
