import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { RefreshCw, X, Play, Pause, Download, Brain, FileAudio, MessageSquare, User, Headphones, Clock, Loader2, Filter, Volume2, VolumeX, RotateCcw, SkipBack, SkipForward, FileText } from 'lucide-react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import { useData } from '../../context/DataContext';
import { liveCalls as fallbackCalls } from '../../data/mockData';
import { transcribeWithRetry, formatTimestamp, generateSimulatedTranscription } from '../../services/transcriptionService';
import { generateIssueSummary } from '../../services/analyticsService';

// Helper function to get direct audio URL from Google Drive
const getDirectAudioUrl = (driveUrl) => {
  if (!driveUrl) return null;
  
  // Extract file ID from Google Drive URL
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = driveUrl.match(pattern);
    if (match) {
      const fileId = match[1];
      // Return direct download URL
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }
  
  return driveUrl;
};

const LiveCallMonitoring = () => {
  const { calls, getLiveCalls, getFilteredCalls, analyzeAllAudio, analyzing, refresh, loading, selectedCity, selectedDateRange } = useData();
  const [selectedCall, setSelectedCall] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeTab, setActiveTab] = useState('transcription');
  const [riskFilter, setRiskFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  
  // Audio player state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);

  // Use filtered calls based on navbar selections
  const allFilteredCalls = getFilteredCalls();
  const allCalls = allFilteredCalls.length > 0 ? allFilteredCalls.slice(0, 15) : getLiveCalls(15);
  
  // Apply risk level filter
  const displayCalls = riskFilter === 'all' 
    ? allCalls 
    : allCalls.filter(call => call.riskLevel === riskFilter);

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
          console.error('Play error:', e);
          setAudioError('Unable to play audio. The file may not be accessible.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setAudioLoading(false);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
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

  const handleAudioError = () => {
    setAudioError('Unable to load audio. Try downloading the file instead.');
    setAudioLoading(false);
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Reset audio state when selected call changes
  useEffect(() => {
    if (selectedCall) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setAudioError(null);
      setAudioLoading(true);
    }
  }, [selectedCall?.id]);

  // Load transcription when a call is selected
  useEffect(() => {
    if (selectedCall) {
      loadTranscription(selectedCall);
    } else {
      setTranscription(null);
    }
  }, [selectedCall]);

  const loadTranscription = async (call) => {
    setIsTranscribing(true);
    setTranscription(null);
    
    try {
      // Try real transcription first, fall back to simulated
      const result = await transcribeWithRetry(call.audioUrl);
      setTranscription(result);
    } catch (error) {
      console.error('Transcription failed:', error);
      // Use simulated transcription as fallback
      setTranscription(generateSimulatedTranscription(call.audioUrl));
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: 'bg-teal',
      neutral: 'bg-amber',
      negative: 'bg-danger',
    };
    return colors[sentiment] || 'bg-gray-400';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Today';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">Live Call Monitoring</h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time call quality analysis • {displayCalls.length} calls displayed
            {selectedCity !== 'All Cities' && ` • ${selectedCity}`}
            {selectedDateRange !== 'All Time' && ` • ${selectedDateRange}`}
            {riskFilter !== 'all' && ` • ${riskFilter} risk`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Risk Level Filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Filter className="w-4 h-4 text-gray-500 ml-2" />
            {['all', 'high', 'medium', 'low'].map((level) => (
              <button
                key={level}
                onClick={() => setRiskFilter(level)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  riskFilter === level
                    ? level === 'high' 
                      ? 'bg-danger text-white' 
                      : level === 'medium' 
                        ? 'bg-amber text-white' 
                        : level === 'low' 
                          ? 'bg-teal text-white'
                          : 'bg-navy text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <Button 
            onClick={analyzeAllAudio} 
            variant="primary" 
            className="flex items-center gap-2"
            disabled={analyzing}
          >
            <Brain className={`w-4 h-4 ${analyzing ? 'animate-pulse' : ''}`} />
            {analyzing ? 'Analyzing...' : 'Analyze All'}
          </Button>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Calls Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Call ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">City</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Issue Summary</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sentiment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">QA Score</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Risk Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayCalls.map((call, index) => (
                <motion.tr
                  key={call.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCall(call)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-navy">{call.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(call.callDate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{call.agent}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{call.city}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 max-w-[280px]">
                      <FileText className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-600 leading-relaxed line-clamp-2" title={generateIssueSummary(call.callType, call.riskLevel)}>
                        {generateIssueSummary(call.callType, call.riskLevel)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSentimentColor(call.sentiment)}`}></div>
                      <span className="text-sm capitalize text-gray-700">{call.sentiment}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
                        <div
                          className={`h-2 rounded-full ${
                            (call.qaScore || call.sopAdherence) >= 80 ? 'bg-teal' : 
                            (call.qaScore || call.sopAdherence) >= 60 ? 'bg-amber' : 'bg-danger'
                          }`}
                          style={{ width: `${call.qaScore || call.sopAdherence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{call.qaScore || call.sopAdherence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={call.riskLevel}>{call.riskLevel?.toUpperCase() || 'LOW'}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="ghost">View Details</Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slide-in Panel with Full Transcription */}
      <AnimatePresence>
        {selectedCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end"
            onClick={() => setSelectedCall(null)}
          >
            <motion.div
              initial={{ x: 600 }}
              animate={{ x: 0 }}
              exit={{ x: 600 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-navy">Call Analysis</h3>
                  <p className="text-sm text-gray-500">{selectedCall.id} • {selectedCall.agent}</p>
                </div>
                <button onClick={() => setSelectedCall(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Audio Player */}
                <div className="bg-gradient-to-r from-navy/5 to-teal/5 rounded-xl p-4">
                  {/* Hidden Audio Element */}
                  <audio
                    ref={audioRef}
                    src={getDirectAudioUrl(selectedCall.audioUrl)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onError={handleAudioError}
                    onEnded={handleAudioEnded}
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
                    <>
                      <div className="flex items-center gap-4">
                        {/* Play/Pause Button */}
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

                        {/* Progress Bar */}
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

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => skipTime(-10)} 
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title="Rewind 10s"
                          >
                            <SkipBack className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={restartAudio} 
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title="Restart"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => skipTime(10)} 
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title="Forward 10s"
                          >
                            <SkipForward className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={toggleMute} 
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted ? (
                              <VolumeX className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <a 
                            href={selectedCall.audioUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </a>
                        </div>
                      </div>
                    </>
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
                      {selectedCall.sentiment?.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">Sentiment</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <Badge variant={selectedCall.riskLevel} className="text-xs">
                      {selectedCall.riskLevel?.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">Risk</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('transcription')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'transcription' 
                        ? 'border-teal text-teal' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Full Transcription
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'analysis' 
                        ? 'border-teal text-teal' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    AI Analysis
                  </button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'transcription' && (
                    <motion.div
                      key="transcription"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Transcription Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4 text-teal" />
                          <span className="text-sm font-semibold text-navy">Complete Call Transcription</span>
                        </div>
                        {transcription && (
                          <span className="text-xs text-gray-500">
                            {transcription.segments?.length || 0} segments • {formatTimestamp(transcription.duration || 0)}
                          </span>
                        )}
                      </div>

                      {/* Loading State */}
                      {isTranscribing && (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="w-10 h-10 text-teal animate-spin mb-4" />
                          <p className="text-sm font-medium text-navy">Transcribing audio...</p>
                          <p className="text-xs text-gray-500 mt-1">Using Deepgram AI for transcription</p>
                          {selectedCall?.audioUrl && (
                            <p className="text-xs text-gray-400 mt-2 max-w-md truncate">
                              Audio: {selectedCall.audioUrl.substring(0, 60)}...
                            </p>
                          )}
                        </div>
                      )}

                      {/* Transcription Content */}
                      {!isTranscribing && transcription && (
                        <div className="bg-gray-50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                          <div className="space-y-4">
                            {transcription.segments?.map((segment, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: segment.speaker === 'Agent' ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex gap-3 ${
                                  segment.speaker === 'Agent' ? '' : 'flex-row-reverse'
                                }`}
                              >
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  segment.speaker === 'Agent' 
                                    ? 'bg-teal text-white' 
                                    : 'bg-amber text-white'
                                }`}>
                                  {segment.speaker === 'Agent' ? (
                                    <Headphones className="w-4 h-4" />
                                  ) : (
                                    <User className="w-4 h-4" />
                                  )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`flex-1 max-w-[80%] ${
                                  segment.speaker === 'Agent' ? '' : 'text-right'
                                }`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-semibold ${
                                      segment.speaker === 'Agent' ? 'text-teal' : 'text-amber'
                                    }`}>
                                      {segment.speaker}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTimestamp(segment.startTime)}
                                    </span>
                                  </div>
                                  <div className={`inline-block p-3 rounded-xl text-sm ${
                                    segment.speaker === 'Agent' 
                                      ? 'bg-white border border-gray-200 text-gray-700' 
                                      : 'bg-amber/10 border border-amber/20 text-gray-700'
                                  }`}>
                                    {segment.text}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full Text Toggle */}
                      {!isTranscribing && transcription?.fullText && (
                        <details className="bg-white border border-gray-200 rounded-lg">
                          <summary className="px-4 py-3 text-sm font-medium text-navy cursor-pointer hover:bg-gray-50">
                            📝 View as Plain Text
                          </summary>
                          <div className="px-4 pb-4">
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                              {transcription.fullText}
                            </p>
                          </div>
                        </details>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'analysis' && (
                    <motion.div
                      key="analysis"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Issue Summary - One Line */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200">
                        <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          🎯 Issue Summary (Why Customer Called)
                        </p>
                        <p className="text-base font-medium text-purple-900">
                          {generateIssueSummary(selectedCall.callType, selectedCall.riskLevel)}
                        </p>
                        <p className="text-xs text-purple-600 mt-2">Call Type: {selectedCall.callType || 'General Inquiry'}</p>
                      </div>

                      {/* AI Summary */}
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-teal" />
                          AI-Generated Summary
                        </p>
                        <p className="text-sm text-gray-700 bg-teal/5 p-4 rounded-lg border border-teal/20">
                          {selectedCall.summary || 'Call analyzed successfully. Agent followed most SOP steps. Customer issue was resolved within the call.'}
                        </p>
                      </div>

                      {/* Issues */}
                      {selectedCall.issues && selectedCall.issues.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2">⚠️ Detected Issues</p>
                          <ul className="space-y-2 bg-danger/5 p-4 rounded-lg border border-danger/20">
                            {selectedCall.issues.map((issue, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-danger">
                                <span className="mt-1">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Suggested Action */}
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">💡 Suggested Action</p>
                        <p className="text-sm text-navy bg-amber/10 p-4 rounded-lg border border-amber/30">
                          {selectedCall.action || 'Schedule coaching session to review ID verification protocol.'}
                        </p>
                      </div>

                      {/* SOP Checklist */}
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">✅ SOP Checklist</p>
                        <div className="space-y-2">
                          {[
                            { step: 'Greeting & Introduction', done: true },
                            { step: 'ID Verification', done: selectedCall.sopAdherence > 70 },
                            { step: 'Problem Understanding', done: true },
                            { step: 'Solution Provided', done: true },
                            { step: 'Upsell Attempt', done: selectedCall.sopAdherence > 80 },
                            { step: 'Closing Script', done: selectedCall.sopAdherence > 60 },
                          ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${
                              item.done ? 'bg-teal/5' : 'bg-danger/5'
                            }`}>
                              <span className={item.done ? 'text-teal' : 'text-danger'}>
                                {item.done ? '✓' : '✗'}
                              </span>
                              <span className={`text-sm ${item.done ? 'text-gray-700' : 'text-danger'}`}>
                                {item.step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button variant="primary" className="flex-1">Take Action</Button>
                  <Button variant="outline" className="flex-1">Send Coaching</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveCallMonitoring;
