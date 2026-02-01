import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useMemo } from 'react';
import { AlertTriangle, Clock, Brain, Zap, X, Play, Pause, Download, Volume2, VolumeX, SkipBack, SkipForward, RotateCcw, Loader2, MessageSquare, User, Headphones, FileAudio, Mail, FileText, Copy, CheckCircle } from 'lucide-react';
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
  const [reportModal, setReportModal] = useState(null); // For showing report popup
  const [copied, setCopied] = useState(false);
  
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

    return highRiskCalls.slice(0, 8).map((call, idx) => {
      // Generate meaningful reason based on call type
      const callReason = generateIssueSummary(call.callType, call.riskLevel);
      
      return {
        id: call.id,
        callId: call.id,
        agent: call.agent,
        priority: call.sentiment === 'negative' ? 'critical' : 'high',
        sopScore: call.sopAdherence,
        timestamp: new Date(call.callDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        summary: call.summary || 'AI detected compliance issues during this call. Immediate review recommended.',
        reason: callReason,
        callType: call.callType,
        sentiment: call.sentiment || 'neutral',
        // Include full call data for review panel
        fullCallData: call
      };
    });
  };

  const alerts = generateAlerts();

  // Generate detailed report for a call
  const generateDetailedReport = (alert) => {
    const call = alert.fullCallData || alert;
    const sopChecklist = [
      { step: 'Greeting & Introduction', done: true },
      { step: 'ID Verification', done: (call.sopAdherence || 75) > 70 },
      { step: 'Problem Understanding', done: true },
      { step: 'Solution Provided', done: true },
      { step: 'Upsell Attempt', done: (call.sopAdherence || 75) > 80 },
      { step: 'Closing Script', done: (call.sopAdherence || 75) > 60 },
    ];

    return {
      callId: call.id || alert.callId,
      agent: call.agent || alert.agent,
      city: call.city || 'N/A',
      callingNo: call.callingNo || 'N/A',
      callDate: call.callDate || new Date().toLocaleDateString(),
      duration: call.duration || '5:30',
      callType: call.callType || alert.callType || 'General Inquiry',
      riskLevel: call.riskLevel || (alert.priority === 'critical' ? 'high' : 'medium'),
      sopAdherence: call.sopAdherence || alert.sopScore || 75,
      qaScore: call.qaScore || call.sopAdherence || 75,
      sentiment: call.sentiment || alert.sentiment || 'neutral',
      reason: alert.reason,
      summary: call.summary || alert.summary,
      issues: call.issues || ['Low SOP adherence detected'],
      suggestedAction: call.sopAdherence < 70 
        ? 'Schedule immediate 1-on-1 coaching session with supervisor'
        : call.sopAdherence < 80 
          ? 'Review SOP guidelines with agent during next team meeting'
          : 'Positive feedback - continue current practices',
      sopChecklist,
      audioUrl: call.audioUrl || 'N/A',
      priority: alert.priority
    };
  };

  const handleViewReport = (alert) => {
    const report = generateDetailedReport(alert);
    setReportModal(report);
  };

  const copyReportToClipboard = async () => {
    if (!reportModal) return;
    
    const sopText = reportModal.sopChecklist
      .map(item => `${item.done ? '✅' : '❌'} ${item.step}`)
      .join('\n');
    
    const reportText = `
═══════════════════════════════════════════════════
🔋 SMART-AUDIT AI - CALL ANALYSIS REPORT
═══════════════════════════════════════════════════

📋 CALL DETAILS
───────────────────────────────────────
• Call ID: ${reportModal.callId}
• Agent Name: ${reportModal.agent}
• Customer Phone: ${reportModal.callingNo}
• City: ${reportModal.city}
• Call Date: ${reportModal.callDate}
• Duration: ${reportModal.duration}
• Risk Level: ${reportModal.riskLevel.toUpperCase()}
• Priority: ${reportModal.priority.toUpperCase()}

═══════════════════════════════════════════════════
🎯 REASON FOR ALERT
═══════════════════════════════════════════════════
${reportModal.reason}
Call Type: ${reportModal.callType}

═══════════════════════════════════════════════════
📊 QUALITY METRICS
═══════════════════════════════════════════════════
• QA Score: ${reportModal.qaScore}%
• SOP Adherence: ${reportModal.sopAdherence}%
• Customer Sentiment: ${reportModal.sentiment.toUpperCase()}

═══════════════════════════════════════════════════
🤖 AI-GENERATED ANALYSIS
═══════════════════════════════════════════════════
${reportModal.summary}

═══════════════════════════════════════════════════
⚠️ DETECTED ISSUES
═══════════════════════════════════════════════════
${reportModal.issues.map(issue => `• ${issue}`).join('\n')}

═══════════════════════════════════════════════════
💡 SUGGESTED ACTION
═══════════════════════════════════════════════════
${reportModal.suggestedAction}

═══════════════════════════════════════════════════
✅ SOP CHECKLIST
═══════════════════════════════════════════════════
${sopText}

═══════════════════════════════════════════════════
🔊 AUDIO RECORDING
═══════════════════════════════════════════════════
${reportModal.audioUrl}

───────────────────────────────────────
Generated by Smart-Audit AI
Battery Smart Intelligence Platform
Date: ${new Date().toLocaleString()}
`.trim();

    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

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
                <p className="text-xs font-semibold text-gray-600 mb-2">🎯 Reason for Alert</p>
                <p className="text-sm text-gray-700 bg-gradient-to-r from-danger/10 to-amber/10 p-3 rounded-lg border-l-4 border-danger">
                  {alert.reason}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {alert.callType && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      📞 {alert.callType}
                    </span>
                  )}
                  <Badge variant={alert.sentiment}>{alert.sentiment?.toUpperCase() || 'NEUTRAL'}</Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={alert.priority === 'critical' ? 'danger' : 'primary'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleReviewCall(alert)}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Review Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewReport(alert)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Report
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendSupervisorAlertEmail(alert, alert.fullCallData)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Mail
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

      {/* Report Modal */}
      <AnimatePresence>
        {reportModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9998]"
              onClick={() => setReportModal(null)}
            />
            
            {/* Report Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-[9999] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-navy to-navy/90 p-4 md:p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Call Analysis Report</h2>
                    <p className="text-sm text-white/70">Call ID: {reportModal.callId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={copyReportToClipboard}
                  >
                    {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <button
                    onClick={() => setReportModal(null)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Report Content - Chat Style */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 space-y-4">
                {/* Priority Badge */}
                <div className="flex justify-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    reportModal.priority === 'critical' 
                      ? 'bg-danger/20 text-danger' 
                      : 'bg-amber/20 text-amber'
                  }`}>
                    ⚠️ {reportModal.priority.toUpperCase()} PRIORITY ALERT
                  </span>
                </div>

                {/* Call Details Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-navy/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-navy" />
                    </div>
                    <span className="font-semibold text-navy">📋 Call Details</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Call ID</p>
                      <p className="font-medium">{reportModal.callId}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Agent</p>
                      <p className="font-medium">{reportModal.agent}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="font-medium">{reportModal.callingNo}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">City</p>
                      <p className="font-medium">{reportModal.city}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">{reportModal.callDate}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">{reportModal.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Reason for Alert */}
                <div className="bg-gradient-to-r from-danger/10 to-amber/10 rounded-xl p-4 border-l-4 border-danger">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <span className="font-semibold text-gray-800">Reason for Alert</span>
                  </div>
                  <p className="text-gray-700 font-medium">{reportModal.reason}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/50 rounded-full text-xs font-medium text-gray-600">
                    📞 {reportModal.callType}
                  </span>
                </div>

                {/* Quality Metrics */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📊</span>
                    <span className="font-semibold text-navy">Quality Metrics</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-2xl font-bold ${
                        reportModal.qaScore >= 80 ? 'text-teal' : reportModal.qaScore >= 60 ? 'text-amber' : 'text-danger'
                      }`}>
                        {reportModal.qaScore}%
                      </div>
                      <p className="text-xs text-gray-500">QA Score</p>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${
                        reportModal.sopAdherence >= 80 ? 'text-teal' : reportModal.sopAdherence >= 60 ? 'text-amber' : 'text-danger'
                      }`}>
                        {reportModal.sopAdherence}%
                      </div>
                      <p className="text-xs text-gray-500">SOP Adherence</p>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${
                        reportModal.sentiment === 'positive' ? 'text-teal' : reportModal.sentiment === 'negative' ? 'text-danger' : 'text-amber'
                      }`}>
                        {reportModal.sentiment === 'positive' ? '😊' : reportModal.sentiment === 'negative' ? '😠' : '😐'}
                      </div>
                      <p className="text-xs text-gray-500">{reportModal.sentiment.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-teal/10 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-teal" />
                    </div>
                    <span className="font-semibold text-navy">🤖 AI-Generated Analysis</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{reportModal.summary}</p>
                </div>

                {/* Issues Detected */}
                <div className="bg-danger/5 rounded-xl p-4 border border-danger/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                    <span className="font-semibold text-danger">⚠️ Issues Detected</span>
                  </div>
                  <ul className="space-y-2">
                    {reportModal.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-danger mt-0.5">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Action */}
                <div className="bg-teal/5 rounded-xl p-4 border border-teal/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💡</span>
                    <span className="font-semibold text-teal">Suggested Action</span>
                  </div>
                  <p className="text-gray-700">{reportModal.suggestedAction}</p>
                </div>

                {/* SOP Checklist */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">✅</span>
                    <span className="font-semibold text-navy">SOP Checklist</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {reportModal.sopChecklist.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          item.done ? 'bg-teal/10' : 'bg-danger/10'
                        }`}
                      >
                        <span className={item.done ? 'text-teal' : 'text-danger'}>
                          {item.done ? '✅' : '❌'}
                        </span>
                        <span className={`text-sm ${item.done ? 'text-gray-700' : 'text-danger'}`}>
                          {item.step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audio Link */}
                {reportModal.audioUrl && reportModal.audioUrl !== 'N/A' && (
                  <div className="bg-navy/5 rounded-xl p-4 border border-navy/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Headphones className="w-5 h-5 text-navy" />
                      <span className="font-semibold text-navy">🔊 Audio Recording</span>
                    </div>
                    <a 
                      href={reportModal.audioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-teal hover:underline break-all"
                    >
                      {reportModal.audioUrl}
                    </a>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 pt-4 border-t">
                  <p>Generated by Smart-Audit AI • Battery Smart Intelligence Platform</p>
                  <p>Report generated on {new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-white border-t flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    sendSupervisorAlertEmail({ ...reportModal, fullCallData: reportModal }, reportModal);
                    setReportModal(null);
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send via Email
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setReportModal(null)}
                >
                  Close Report
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SupervisorAlerts;
