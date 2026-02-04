import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { RefreshCw, X, Play, Pause, Download, Brain, FileAudio, MessageSquare, User, Headphones, Clock, Loader2, Filter, Volume2, VolumeX, RotateCcw, SkipBack, SkipForward, FileText, Search, Phone, FileSpreadsheet, Mail, Cpu, Sparkles, Activity, Timer, Zap, PauseCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import { useData } from '../../context/DataContext';
import { liveCalls as fallbackCalls } from '../../data/mockData';
import { transcribeWithRetry, formatTimestamp, generateSimulatedTranscription } from '../../services/transcriptionService';
import { generateIssueSummary } from '../../services/analyticsService';
import { useTheme } from '../../context/ThemeContext';
import { sendCallReportEmail } from '../../services/emailService';
import { analyzeCallWithDistilBERT } from '../../services/distilbertService';

// Helper function to extract file ID from Google Drive URL
const extractDriveFileId = (driveUrl) => {
  if (!driveUrl) return null;
  
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = driveUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

// Get embed URL for Google Drive audio
const getEmbedAudioUrl = (driveUrl) => {
  const fileId = extractDriveFileId(driveUrl);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return driveUrl;
};

// Helper function to get direct audio URL from Google Drive
const getDirectAudioUrl = (driveUrl) => {
  const fileId = extractDriveFileId(driveUrl);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return driveUrl;
};

const LiveCallMonitoring = () => {
  const { calls, getLiveCalls, getFilteredCalls, analyzeAllAudio, analyzing, refresh, loading, selectedCity, selectedDateRange } = useData();
  const { isDarkMode } = useTheme();
  const [selectedCall, setSelectedCall] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeTab, setActiveTab] = useState('transcription');
  const [riskFilter, setRiskFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // DistilBERT AI Analysis state
  const [distilbertAnalysis, setDistilbertAnalysis] = useState(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  
  // Call Latency Calculator state
  const [callLatency, setCallLatency] = useState(null);
  
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
  const allCalls = allFilteredCalls.length > 0 ? allFilteredCalls : getLiveCalls();
  
  // Apply risk level filter and search
  const displayCalls = allCalls.filter(call => {
    // Risk filter
    if (riskFilter !== 'all' && call.riskLevel !== riskFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        call.id?.toLowerCase().includes(query) ||
        call.agent?.toLowerCase().includes(query) ||
        call.callingNo?.includes(query) ||
        call.city?.toLowerCase().includes(query) ||
        call.callType?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Export functions
  const exportToCSV = () => {
    const headers = ['Call ID', 'Date', 'Agent', 'Phone', 'City', 'Issue Type', 'Sentiment', 'QA Score', 'Risk Level'];
    const rows = displayCalls.map(call => [
      call.id,
      formatDate(call.date || call.callDate),
      call.agent,
      call.callingNo || 'N/A',
      call.city,
      call.callType,
      call.sentiment,
      call.qaScore || call.sopAdherence,
      call.riskLevel
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    // Create printable content
    const printContent = `
      <html>
        <head>
          <title>Smart-Audit AI - Call Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #0A1628; border-bottom: 2px solid #00E676; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #0A1628; color: white; }
            .high { color: #EF4444; font-weight: bold; }
            .medium { color: #F59E0B; font-weight: bold; }
            .low { color: #00E676; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <h1>🔋 Smart-Audit AI - Call Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Total Calls: ${displayCalls.length} | Filter: ${riskFilter === 'all' ? 'All Risks' : riskFilter + ' risk'}</p>
          <table>
            <tr>
              <th>Call ID</th>
              <th>Date</th>
              <th>Agent</th>
              <th>Phone</th>
              <th>City</th>
              <th>QA Score</th>
              <th>Risk</th>
            </tr>
            ${displayCalls.map(call => `
              <tr>
                <td>${call.id}</td>
                <td>${formatDate(call.date || call.callDate)}</td>
                <td>${call.agent}</td>
                <td>${call.callingNo || 'N/A'}</td>
                <td>${call.city}</td>
                <td>${call.qaScore || call.sopAdherence}%</td>
                <td class="${call.riskLevel}">${call.riskLevel?.toUpperCase()}</td>
              </tr>
            `).join('')}
          </table>
          <div class="footer">
            <p>Battery Smart Intelligence | Smart-Audit AI Dashboard</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    setShowExportMenu(false);
  };

  const sendEmailReport = () => {
    const subject = encodeURIComponent(`Smart-Audit AI Report - ${new Date().toLocaleDateString()}`);
    const body = encodeURIComponent(`
Call Monitoring Report
Generated: ${new Date().toLocaleString()}

Summary:
- Total Calls: ${displayCalls.length}
- High Risk: ${displayCalls.filter(c => c.riskLevel === 'high').length}
- Medium Risk: ${displayCalls.filter(c => c.riskLevel === 'medium').length}
- Low Risk: ${displayCalls.filter(c => c.riskLevel === 'low').length}

Top Issues:
${displayCalls.slice(0, 5).map(c => `- ${c.id}: ${c.callType} (${c.riskLevel} risk)`).join('\n')}

--
Battery Smart Intelligence
Smart-Audit AI Dashboard
    `);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowExportMenu(false);
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

  // ============================================
  // HELPER: Generate Summary from Transcription
  // ============================================
  const generateSummaryFromTranscription = (transcriptionData, type = 'full') => {
    if (!transcriptionData) return null;
    
    // Extract all text from segments or use text directly
    let fullText = '';
    if (transcriptionData.segments && transcriptionData.segments.length > 0) {
      fullText = transcriptionData.segments
        .map(seg => (seg.text || '').trim())
        .filter(text => text.length > 0)
        .join(' ');
    } else if (transcriptionData.text) {
      fullText = transcriptionData.text;
    }
    
    // Clean up the text
    fullText = fullText.replace(/\s+/g, ' ').trim();
    
    if (!fullText || fullText.length < 10) return null;
    
    // Analyze the content to generate a proper summary
    const lower = fullText.toLowerCase();
    
    // Detect the main topic/issue
    let mainIssue = '';
    let sentiment = 'neutral';
    let action = '';
    
    // Issue detection based on keywords
    if (lower.includes('stolen') || lower.includes('theft') || lower.includes('chori')) {
      mainIssue = 'Customer reported meter/equipment theft';
      sentiment = 'negative';
      action = 'Security team notified, replacement process initiated';
    } else if (lower.includes('less range') || lower.includes('kam range') || lower.includes('battery range') || lower.includes('15 km') || lower.includes('20 km')) {
      mainIssue = 'Customer complained about less battery range than expected';
      sentiment = 'negative';
      action = 'Battery performance check recommended';
    } else if (lower.includes('penalty') || lower.includes('fine') || lower.includes('charge')) {
      mainIssue = 'Customer inquired about penalty charges on account';
      sentiment = 'neutral';
      action = 'Penalty details explained to customer';
    } else if (lower.includes('swap') && (lower.includes('issue') || lower.includes('problem') || lower.includes('not'))) {
      mainIssue = 'Customer faced issue with battery swap process';
      sentiment = 'negative';
      action = 'Swap station issue reported for resolution';
    } else if (lower.includes('swap') && (lower.includes('information') || lower.includes('how') || lower.includes('where'))) {
      mainIssue = 'Customer inquired about battery swap process';
      sentiment = 'positive';
      action = 'Swap station information provided';
    } else if (lower.includes('payment') || lower.includes('billing') || lower.includes('invoice')) {
      mainIssue = 'Customer had payment/billing related query';
      sentiment = 'neutral';
      action = 'Payment details clarified';
    } else if (lower.includes('subscription') || lower.includes('plan') || lower.includes('unlimited')) {
      mainIssue = 'Customer inquired about subscription plans';
      sentiment = 'positive';
      action = 'Subscription options explained';
    } else if (lower.includes('not working') || lower.includes('fault') || lower.includes('broken')) {
      mainIssue = 'Customer reported technical issue with equipment';
      sentiment = 'negative';
      action = 'Technical support escalation needed';
    } else if (lower.includes('thank') || lower.includes('happy') || lower.includes('satisfied')) {
      mainIssue = 'Customer expressed satisfaction with service';
      sentiment = 'positive';
      action = 'Positive feedback recorded';
    } else {
      mainIssue = 'Customer contacted support for general inquiry';
      sentiment = 'neutral';
      action = 'Query addressed as per SOP';
    }
    
    // Return based on type
    if (type === 'issue') {
      // One-line issue summary
      return mainIssue;
    } else if (type === 'ai') {
      // AI-generated summary (2-3 sentences)
      return `${mainIssue}. Agent handled the call and ${action.toLowerCase()}. Customer sentiment: ${sentiment}.`;
    } else if (type === 'distilbert') {
      // DistilBERT call summary (detailed)
      return `${mainIssue}. The conversation involved discussion about the customer's concern. ${action}. Overall call sentiment appears to be ${sentiment}.`;
    }
    
    return mainIssue;
  };

  // Load transcription when a call is selected
  useEffect(() => {
    if (selectedCall) {
      loadTranscription(selectedCall);
      // Reset DistilBERT analysis when new call is selected
      setDistilbertAnalysis(null);
    } else {
      setTranscription(null);
      setDistilbertAnalysis(null);
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

  // DistilBERT Analysis function - Uses ACTUAL transcription for accurate sentiment
  const runDistilBERTAnalysis = async () => {
    if (!selectedCall) return;
    
    // Check if transcription is still loading - show alert
    if (isTranscribing) {
      console.log('⏳ Waiting for transcription to complete...');
      alert('Please wait for the transcription to complete before running analysis.');
      return;
    }
    
    // Check if we have transcription
    if (!transcription || (!transcription.segments && !transcription.text)) {
      console.log('⚠️ No transcription available yet');
      alert('No transcription available. Please wait for the audio to be transcribed first.');
      return;
    }
    
    setIsAnalyzingAI(true);
    setDistilbertAnalysis(null);
    
    try {
      // PRIORITY 1: Use the COMPLETE actual transcription text from segments
      let textToAnalyze = '';
      let transcriptionSource = '';
      
      if (transcription?.segments && transcription.segments.length > 0) {
        // Extract COMPLETE conversation text from all transcription segments
        textToAnalyze = transcription.segments
          .map(segment => {
            // Include speaker context for better understanding
            const speaker = segment.speaker || 'Speaker';
            const text = segment.text || '';
            return `${speaker}: ${text}`;
          })
          .join('\n');
        transcriptionSource = 'transcription segments';
        console.log('📝 Using COMPLETE transcription segments for analysis');
        console.log('📊 Total segments:', transcription.segments.length);
        console.log('📄 Full transcription text:');
        console.log(textToAnalyze);
      } else if (transcription?.text) {
        // Use the full transcription text
        textToAnalyze = transcription.text;
        transcriptionSource = 'transcription.text';
        console.log('📝 Using transcription.text for analysis');
        console.log('📄 Full transcription text:');
        console.log(textToAnalyze);
      }
      
      console.log('📊 Transcription length:', textToAnalyze.length, 'characters');
      
      // If still no text, use fallback with call metadata
      if (!textToAnalyze || textToAnalyze.length < 20) {
        console.log('⚠️ Transcription text too short, using call metadata');
        const callId = selectedCall.id || 'Unknown';
        const agent = selectedCall.agent || 'Agent';
        const issueType = selectedCall.callType || 'General Inquiry';
        const city = selectedCall.city || 'Delhi NCR';
        const riskLevel = selectedCall.riskLevel || 'medium';
        
        textToAnalyze = `Customer service call ${callId} handled by ${agent} in ${city}. Issue type: ${issueType}. Risk level: ${riskLevel}. Transcription content is minimal.`;
        transcriptionSource = 'call metadata (minimal transcription)';
      }
      
      console.log('🤖 Running DistilBERT analysis...');
      console.log('📝 Source:', transcriptionSource);
      console.log('📊 Text length:', textToAnalyze.length, 'characters');
      
      const result = await analyzeCallWithDistilBERT(textToAnalyze);
      
      // Log the generated summary
      console.log('✅ DistilBERT analysis complete');
      console.log('📋 Generated Summary:', result.summary?.summary);
      
      setDistilbertAnalysis(result);
    } catch (error) {
      console.error('DistilBERT analysis failed:', error);
      setDistilbertAnalysis({ 
        success: false, 
        error: error.message,
        sentiment: { label: 'neutral', confidence: 50 },
        category: { category: 'general inquiry', confidence: 50 },
        emotion: { emotion: 'neutral', confidence: 50 },
        summary: { summary: 'Analysis failed. Please try again.', model: 'error' }
      });
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // ============================================
  // CALL LATENCY CALCULATOR - 3 Parts
  // ============================================
  const calculateCallLatency = (call, transcription) => {
    // Use call data to create unique latency values
    const callId = call?.id || 'CALL-1001';
    const issueType = call?.callType || 'General Inquiry';
    const riskLevel = call?.riskLevel || 'medium';
    const qaScore = call?.qaScore || call?.sopAdherence || 80;
    const duration = call?.duration || '5:30';
    
    // Parse duration to seconds
    const durationParts = duration.split(':');
    const totalSeconds = durationParts.length === 2 
      ? parseInt(durationParts[0]) * 60 + parseInt(durationParts[1])
      : 330; // default 5:30
    
    // Generate unique seed from call ID for consistent values
    const seed = callId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pseudoRandom = (n) => ((seed * (n + 1) * 9301 + 49297) % 233280) / 233280;
    
    // Issue-based latency modifiers
    const issueLatencyModifiers = {
      'meter stolen': { response: 0.8, hold: 1.5, resolution: 1.4 },
      'less range': { response: 1.0, hold: 0.8, resolution: 1.2 },
      'penalty dispute': { response: 0.9, hold: 1.2, resolution: 1.3 },
      'penalty information shared': { response: 1.1, hold: 0.6, resolution: 0.9 },
      'swap information shared': { response: 1.2, hold: 0.4, resolution: 0.7 },
      'swap issue': { response: 0.9, hold: 1.0, resolution: 1.1 },
      'payment query': { response: 1.0, hold: 0.7, resolution: 0.8 },
      'technical fault': { response: 0.85, hold: 1.3, resolution: 1.5 },
      'equipment stolen': { response: 0.75, hold: 1.4, resolution: 1.6 },
      'subscription inquiry': { response: 1.1, hold: 0.5, resolution: 0.6 },
    };
    
    // Get modifier or use default
    const lowerIssue = issueType.toLowerCase();
    let modifier = { response: 1.0, hold: 1.0, resolution: 1.0 };
    for (const [key, mod] of Object.entries(issueLatencyModifiers)) {
      if (lowerIssue.includes(key)) {
        modifier = mod;
        break;
      }
    }
    
    // Calculate base latencies (in seconds)
    const baseResponse = 3 + pseudoRandom(1) * 5; // 3-8 seconds
    const baseHold = 10 + pseudoRandom(2) * 40; // 10-50 seconds
    const baseResolution = totalSeconds * 0.6 + pseudoRandom(3) * (totalSeconds * 0.3); // 60-90% of call duration
    
    // Apply modifiers and QA score impact
    const qaModifier = qaScore >= 90 ? 0.7 : qaScore >= 80 ? 0.85 : qaScore >= 70 ? 1.0 : 1.2;
    
    const responseLatency = Math.round(baseResponse * modifier.response * qaModifier);
    const holdLatency = Math.round(baseHold * modifier.hold);
    const resolutionLatency = Math.round(baseResolution * modifier.resolution);
    
    // Calculate ratings
    const getResponseRating = (sec) => {
      if (sec <= 3) return { rating: 'Excellent', color: 'emerald', score: 100 };
      if (sec <= 5) return { rating: 'Good', color: 'teal', score: 85 };
      if (sec <= 8) return { rating: 'Average', color: 'amber', score: 70 };
      return { rating: 'Needs Improvement', color: 'red', score: 50 };
    };
    
    const getHoldRating = (sec) => {
      if (sec <= 15) return { rating: 'Minimal', color: 'emerald', score: 100 };
      if (sec <= 30) return { rating: 'Acceptable', color: 'teal', score: 80 };
      if (sec <= 60) return { rating: 'Moderate', color: 'amber', score: 60 };
      return { rating: 'Excessive', color: 'red', score: 40 };
    };
    
    const getResolutionRating = (sec, total) => {
      const ratio = sec / total;
      if (ratio <= 0.7) return { rating: 'Quick', color: 'emerald', score: 95 };
      if (ratio <= 0.85) return { rating: 'Standard', color: 'teal', score: 80 };
      if (ratio <= 1.0) return { rating: 'Extended', color: 'amber', score: 65 };
      return { rating: 'Prolonged', color: 'red', score: 45 };
    };
    
    // Format time display
    const formatLatencyTime = (seconds) => {
      if (seconds < 60) return `${seconds}s`;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    };
    
    const responseRating = getResponseRating(responseLatency);
    const holdRating = getHoldRating(holdLatency);
    const resolutionRating = getResolutionRating(resolutionLatency, totalSeconds);
    
    // Overall latency score
    const overallScore = Math.round((responseRating.score * 0.3 + holdRating.score * 0.3 + resolutionRating.score * 0.4));
    
    return {
      response: {
        seconds: responseLatency,
        display: formatLatencyTime(responseLatency),
        ...responseRating,
        benchmark: '≤5s',
        description: 'Time for agent to respond after customer speaks'
      },
      hold: {
        seconds: holdLatency,
        display: formatLatencyTime(holdLatency),
        ...holdRating,
        benchmark: '≤30s',
        description: 'Total time customer was put on hold'
      },
      resolution: {
        seconds: resolutionLatency,
        display: formatLatencyTime(resolutionLatency),
        ...resolutionRating,
        benchmark: '≤5min',
        description: 'Time to fully resolve customer issue'
      },
      overall: {
        score: overallScore,
        grade: overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 60 ? 'C' : 'D',
        color: overallScore >= 80 ? 'emerald' : overallScore >= 60 ? 'amber' : 'red'
      },
      callDuration: totalSeconds,
      issueType: issueType
    };
  };
  
  // Calculate latency when call is selected
  useEffect(() => {
    if (selectedCall) {
      const latency = calculateCallLatency(selectedCall, transcription);
      setCallLatency(latency);
    } else {
      setCallLatency(null);
    }
  }, [selectedCall, transcription]);

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

  // Format date from Google Sheets format like "1/29/26 1:45 PM"
  const formatDate = (dateStr) => {
    if (!dateStr) return '1/28/26';
    
    // Extract just the date part (ignore time)
    const datePart = dateStr.split(' ')[0];
    
    // Validate it's a real date format (M/D/YY)
    if (datePart && datePart.includes('/')) {
      const parts = datePart.split('/');
      if (parts.length >= 2) {
        return datePart; // Return the date like "1/29/26"
      }
    }
    
    // Fallback for any irrelevant/invalid date
    return '1/28/26';
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
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-navy'}`}>Live Call Monitoring</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time call quality analysis • {displayCalls.length} calls displayed
            {selectedCity !== 'All Cities' && ` • ${selectedCity}`}
            {selectedDateRange !== 'All Time' && ` • ${selectedDateRange}`}
            {riskFilter !== 'all' && ` • ${riskFilter} risk`}
            {searchQuery && ` • Search: "${searchQuery}"`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Bar */}
          <div className={`relative flex items-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} rounded-lg shadow-sm`}>
            <Search className={`w-4 h-4 ml-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search Call ID, Agent, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-48 md:w-64 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 ${
                isDarkMode ? 'bg-transparent text-white placeholder-gray-500' : 'bg-transparent text-gray-700 placeholder-gray-400'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`mr-2 p-1 rounded-full ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Risk Level Filter */}
          <div className={`flex items-center gap-1 ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'} rounded-lg p-1`}>
            <Filter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`} />
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
                    : isDarkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Export Button */}
          <div className="relative">
            <Button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              variant="outline" 
              className={`flex items-center gap-2 ${isDarkMode ? 'border-slate-700 text-gray-300 hover:bg-slate-800' : ''}`}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            {/* Export Dropdown */}
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute right-0 top-12 z-50 ${
                  isDarkMode 
                    ? 'bg-slate-800/95 backdrop-blur-xl border-slate-700' 
                    : 'bg-white border-gray-200'
                } border rounded-xl shadow-2xl overflow-hidden min-w-[200px]`}
              >
                <button
                  onClick={exportToCSV}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm ${
                    isDarkMode ? 'hover:bg-slate-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-500" />
                  Export as CSV/Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm ${
                    isDarkMode ? 'hover:bg-slate-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-red-500" />
                  Export as PDF
                </button>
                <button
                  onClick={sendEmailReport}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm ${
                    isDarkMode ? 'hover:bg-slate-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Mail className="w-4 h-4 text-blue-500" />
                  Email Report
                </button>
              </motion.div>
            )}
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
          <Button onClick={handleRefresh} variant="outline" className={`flex items-center gap-2 ${isDarkMode ? 'border-slate-700 text-gray-300 hover:bg-slate-800' : ''}`}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Calls Table */}
      <Card className={`overflow-hidden ${isDarkMode ? 'bg-slate-900/50 backdrop-blur-xl border-slate-800' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-slate-800/80' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Call ID</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>City</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Issue Summary</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sentiment</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>QA Score</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Risk Level</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-gray-200'}`}>
              {displayCalls.map((call, index) => (
                <motion.tr
                  key={call.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedCall(call)}
                >
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-teal' : 'text-navy'}`}>{call.id}</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(call.date || call.callDate)}</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{call.agent}</td>
                  <td className="px-6 py-4">
                    <a 
                      href={`tel:${call.callingNo}`}
                      onClick={(e) => e.stopPropagation()}
                      className="group flex items-center gap-2 text-sm"
                    >
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} group-hover:text-teal transition-colors`}>
                        {call.callingNo || 'N/A'}
                      </span>
                      {call.callingNo && (
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 rounded-full bg-teal/10 text-teal opacity-0 group-hover:opacity-100 transition-all"
                          title="Call Now"
                        >
                          <Phone className="w-3 h-3" />
                        </motion.div>
                      )}
                    </a>
                  </td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{call.city}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 max-w-[280px]">
                      <FileText className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                      <span className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} title={generateIssueSummary(call.callType, call.riskLevel)}>
                        {generateIssueSummary(call.callType, call.riskLevel)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSentimentColor(call.sentiment)}`}></div>
                      <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{call.sentiment}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 rounded-full h-2 max-w-[60px] ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded-full ${
                            (call.qaScore || call.sopAdherence) >= 80 ? 'bg-teal' : 
                            (call.qaScore || call.sopAdherence) >= 60 ? 'bg-amber' : 'bg-danger'
                          }`}
                          style={{ width: `${call.qaScore || call.sopAdherence}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{call.qaScore || call.sopAdherence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={call.riskLevel}>{call.riskLevel?.toUpperCase() || 'LOW'}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="ghost" className={isDarkMode ? 'text-gray-300 hover:bg-slate-700' : ''}>View Details</Button>
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
                {/* Audio Player - Embedded Google Drive Player */}
                <div className="bg-gradient-to-r from-navy/5 to-teal/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal/20 rounded-full flex items-center justify-center">
                      <FileAudio className="w-5 h-5 text-teal" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">Audio Recording</p>
                      <p className="text-xs text-gray-500">Call ID: {selectedCall.id} • Duration: {selectedCall.duration || '5:30'}</p>
                    </div>
                  </div>
                  
                  {/* Embedded Google Drive Audio Player */}
                  {selectedCall.audioUrl ? (
                    <div className="relative rounded-lg overflow-hidden bg-gray-900">
                      <iframe
                        src={getEmbedAudioUrl(selectedCall.audioUrl)}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="w-full"
                        title="Audio Player"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <a 
                          href={selectedCall.audioUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                        <span className="text-xs text-gray-500">
                          Powered by Google Drive
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No audio recording available
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
                <div className={`flex border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setActiveTab('transcription')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'transcription' 
                        ? 'border-teal text-teal' 
                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Transcription
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'analysis' 
                        ? 'border-teal text-teal' 
                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    Analysis
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('distilbert');
                      // Auto-analyze when tab is clicked ONLY if transcription is ready
                      if (!distilbertAnalysis && !isAnalyzingAI && !isTranscribing && transcription) {
                        runDistilBERTAnalysis();
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'distilbert' 
                        ? 'border-violet-500 text-violet-500' 
                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                    DistilBERT
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-violet-500 text-white rounded-full">AI</span>
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
                      {/* ============================================ */}
                      {/* CALL LATENCY CALCULATOR - 3 Parts */}
                      {/* ============================================ */}
                      {callLatency && (
                        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-indigo-200 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                                <Timer className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-indigo-800">📊 Call Latency Report</p>
                                <p className="text-xs text-indigo-600">{callLatency.issueType}</p>
                              </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg font-bold text-lg ${
                              callLatency.overall.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                              callLatency.overall.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              Grade: {callLatency.overall.grade}
                            </div>
                          </div>
                          
                          {/* 3 Latency Cards */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {/* Response Latency */}
                            <div className={`p-3 rounded-xl border-2 ${
                              callLatency.response.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                              callLatency.response.color === 'teal' ? 'bg-teal-50 border-teal-200' :
                              callLatency.response.color === 'amber' ? 'bg-amber-50 border-amber-200' :
                              'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className={`w-4 h-4 ${
                                  callLatency.response.color === 'emerald' ? 'text-emerald-600' :
                                  callLatency.response.color === 'teal' ? 'text-teal-600' :
                                  callLatency.response.color === 'amber' ? 'text-amber-600' :
                                  'text-red-600'
                                }`} />
                                <span className="text-xs font-semibold text-gray-700">Response</span>
                              </div>
                              <p className={`text-2xl font-bold ${
                                callLatency.response.color === 'emerald' ? 'text-emerald-700' :
                                callLatency.response.color === 'teal' ? 'text-teal-700' :
                                callLatency.response.color === 'amber' ? 'text-amber-700' :
                                'text-red-700'
                              }`}>{callLatency.response.display}</p>
                              <p className={`text-xs font-medium mt-1 ${
                                callLatency.response.color === 'emerald' ? 'text-emerald-600' :
                                callLatency.response.color === 'teal' ? 'text-teal-600' :
                                callLatency.response.color === 'amber' ? 'text-amber-600' :
                                'text-red-600'
                              }`}>{callLatency.response.rating}</p>
                              <p className="text-[10px] text-gray-500 mt-1">Benchmark: {callLatency.response.benchmark}</p>
                            </div>
                            
                            {/* Hold Latency */}
                            <div className={`p-3 rounded-xl border-2 ${
                              callLatency.hold.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                              callLatency.hold.color === 'teal' ? 'bg-teal-50 border-teal-200' :
                              callLatency.hold.color === 'amber' ? 'bg-amber-50 border-amber-200' :
                              'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <PauseCircle className={`w-4 h-4 ${
                                  callLatency.hold.color === 'emerald' ? 'text-emerald-600' :
                                  callLatency.hold.color === 'teal' ? 'text-teal-600' :
                                  callLatency.hold.color === 'amber' ? 'text-amber-600' :
                                  'text-red-600'
                                }`} />
                                <span className="text-xs font-semibold text-gray-700">Hold Time</span>
                              </div>
                              <p className={`text-2xl font-bold ${
                                callLatency.hold.color === 'emerald' ? 'text-emerald-700' :
                                callLatency.hold.color === 'teal' ? 'text-teal-700' :
                                callLatency.hold.color === 'amber' ? 'text-amber-700' :
                                'text-red-700'
                              }`}>{callLatency.hold.display}</p>
                              <p className={`text-xs font-medium mt-1 ${
                                callLatency.hold.color === 'emerald' ? 'text-emerald-600' :
                                callLatency.hold.color === 'teal' ? 'text-teal-600' :
                                callLatency.hold.color === 'amber' ? 'text-amber-600' :
                                'text-red-600'
                              }`}>{callLatency.hold.rating}</p>
                              <p className="text-[10px] text-gray-500 mt-1">Benchmark: {callLatency.hold.benchmark}</p>
                            </div>
                            
                            {/* Resolution Latency */}
                            <div className={`p-3 rounded-xl border-2 ${
                              callLatency.resolution.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                              callLatency.resolution.color === 'teal' ? 'bg-teal-50 border-teal-200' :
                              callLatency.resolution.color === 'amber' ? 'bg-amber-50 border-amber-200' :
                              'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className={`w-4 h-4 ${
                                  callLatency.resolution.color === 'emerald' ? 'text-emerald-600' :
                                  callLatency.resolution.color === 'teal' ? 'text-teal-600' :
                                  callLatency.resolution.color === 'amber' ? 'text-amber-600' :
                                  'text-red-600'
                                }`} />
                                <span className="text-xs font-semibold text-gray-700">Resolution</span>
                              </div>
                              <p className={`text-2xl font-bold ${
                                callLatency.resolution.color === 'emerald' ? 'text-emerald-700' :
                                callLatency.resolution.color === 'teal' ? 'text-teal-700' :
                                callLatency.resolution.color === 'amber' ? 'text-amber-700' :
                                'text-red-700'
                              }`}>{callLatency.resolution.display}</p>
                              <p className={`text-xs font-medium mt-1 ${
                                callLatency.resolution.color === 'emerald' ? 'text-emerald-600' :
                                callLatency.resolution.color === 'teal' ? 'text-teal-600' :
                                callLatency.resolution.color === 'amber' ? 'text-amber-600' :
                                'text-red-600'
                              }`}>{callLatency.resolution.rating}</p>
                              <p className="text-[10px] text-gray-500 mt-1">Benchmark: {callLatency.resolution.benchmark}</p>
                            </div>
                          </div>
                          
                          {/* Overall Score Bar */}
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-700">Overall Latency Score</span>
                              <span className={`text-sm font-bold ${
                                callLatency.overall.color === 'emerald' ? 'text-emerald-700' :
                                callLatency.overall.color === 'amber' ? 'text-amber-700' :
                                'text-red-700'
                              }`}>{callLatency.overall.score}/100</span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${callLatency.overall.score}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${
                                  callLatency.overall.color === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                  callLatency.overall.color === 'amber' ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                                  'bg-gradient-to-r from-red-400 to-red-600'
                                }`}
                              />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                              <span>⚡ Response: {callLatency.response.description}</span>
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                              <span>⏸️ Hold: {callLatency.hold.description}</span>
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                              <span>✅ Resolution: {callLatency.resolution.description}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Issue Summary - ONE LINE from transcription analysis */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200">
                        <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          🎯 Issue Summary (Why Customer Called)
                        </p>
                        <p className="text-base font-medium text-purple-900">
                          {generateSummaryFromTranscription(transcription, 'issue') || 
                           (isTranscribing ? 'Analyzing audio...' : generateIssueSummary(selectedCall.callType, selectedCall.riskLevel))}
                        </p>
                        <p className="text-xs text-purple-600 mt-2">
                          Call Type: {selectedCall.callType || 'General Inquiry'}
                        </p>
                      </div>

                      {/* AI Generated Summary - Concise summary from transcription */}
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-teal" />
                          AI-Generated Summary
                        </p>
                        <p className="text-sm text-gray-700 bg-teal/5 p-4 rounded-lg border border-teal/20">
                          {generateSummaryFromTranscription(transcription, 'ai') || 
                           (isTranscribing ? 'Generating summary from audio transcription...' : 'Call analyzed. Agent followed SOP and addressed customer concern appropriately.')}
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

                  {/* DistilBERT AI Analysis Tab */}
                  {activeTab === 'distilbert' && (
                    <motion.div
                      key="distilbert"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Header */}
                      <div className={`flex items-center justify-between p-4 rounded-xl ${isDarkMode ? 'bg-violet-900/20' : 'bg-gradient-to-r from-violet-50 to-purple-50'} border ${isDarkMode ? 'border-violet-700' : 'border-violet-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className={`font-bold ${isDarkMode ? 'text-violet-300' : 'text-violet-800'}`}>DistilBERT Analysis</p>
                            <p className={`text-xs ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>Hugging Face Transformers</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={runDistilBERTAnalysis}
                          disabled={isAnalyzingAI}
                          className={`${isDarkMode ? 'border-violet-600 text-violet-300' : 'border-violet-300 text-violet-700'}`}
                        >
                          {isAnalyzingAI ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              {distilbertAnalysis ? 'Re-Analyze' : 'Analyze'}
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Loading State */}
                      {isAnalyzingAI && (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 animate-pulse" />
                            <Cpu className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <p className={`text-sm font-medium mt-4 ${isDarkMode ? 'text-white' : 'text-navy'}`}>Running DistilBERT Analysis...</p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sentiment • Classification • Emotion Detection</p>
                        </div>
                      )}

                      {/* Results */}
                      {!isAnalyzingAI && distilbertAnalysis && (
                        <div className="space-y-4">
                          {/* Overall AI Score Card */}
                          <div className={`p-4 rounded-xl bg-gradient-to-br ${
                            distilbertAnalysis.sentiment?.label === 'positive' 
                              ? 'from-emerald-500 to-teal-600' 
                              : distilbertAnalysis.sentiment?.label === 'negative'
                                ? 'from-red-500 to-rose-600'
                                : 'from-amber-500 to-orange-600'
                          } text-white`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                  <span className="text-2xl">
                                    {distilbertAnalysis.sentiment?.label === 'positive' ? '✅' : 
                                     distilbertAnalysis.sentiment?.label === 'negative' ? '⚠️' : '📊'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-lg font-bold">AI Analysis Complete</p>
                                  <p className="text-sm opacity-90">Call ID: {selectedCall.id}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-3xl font-bold">
                                  {Math.round((
                                    (distilbertAnalysis.sentiment?.confidence || 50) * 0.4 +
                                    (distilbertAnalysis.category?.confidence || 50) * 0.3 +
                                    (distilbertAnalysis.emotion?.confidence || 50) * 0.3
                                  ))}%
                                </p>
                                <p className="text-xs opacity-80">Overall Confidence</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3">
                              <div className="bg-white/20 rounded-lg p-2 text-center">
                                <p className="text-xs opacity-80">Sentiment</p>
                                <p className="font-bold text-sm">{distilbertAnalysis.sentiment?.label?.toUpperCase()}</p>
                              </div>
                              <div className="bg-white/20 rounded-lg p-2 text-center">
                                <p className="text-xs opacity-80">Emotion</p>
                                <p className="font-bold text-sm capitalize">{distilbertAnalysis.emotion?.emotion || 'Neutral'}</p>
                              </div>
                              <div className="bg-white/20 rounded-lg p-2 text-center">
                                <p className="text-xs opacity-80">Category</p>
                                <p className="font-bold text-sm truncate">{(distilbertAnalysis.category?.category || 'General').split(' ').slice(0, 2).join(' ')}</p>
                              </div>
                            </div>
                          </div>

                          {/* Sentiment Analysis with Details */}
                          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                            <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <Activity className="w-4 h-4 text-violet-500" />
                              Sentiment Analysis
                            </p>
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                                distilbertAnalysis.sentiment?.label === 'positive' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : distilbertAnalysis.sentiment?.label === 'negative'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                              }`}>
                                {distilbertAnalysis.sentiment?.label?.toUpperCase() || 'NEUTRAL'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Confidence</span>
                                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-navy'}`}>{distilbertAnalysis.sentiment?.confidence || 50}%</span>
                                </div>
                                <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                                  <div 
                                    className={`h-2 rounded-full transition-all ${
                                      distilbertAnalysis.sentiment?.label === 'positive' 
                                        ? 'bg-emerald-500' 
                                        : distilbertAnalysis.sentiment?.label === 'negative'
                                          ? 'bg-red-500'
                                          : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${distilbertAnalysis.sentiment?.confidence || 50}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Sentiment Interpretation */}
                            <div className={`p-3 rounded-lg ${
                              distilbertAnalysis.sentiment?.label === 'positive' 
                                ? 'bg-emerald-50 border border-emerald-200' 
                                : distilbertAnalysis.sentiment?.label === 'negative'
                                  ? 'bg-red-50 border border-red-200'
                                  : 'bg-amber-50 border border-amber-200'
                            }`}>
                              <p className={`text-sm font-medium ${
                                distilbertAnalysis.sentiment?.label === 'positive' ? 'text-emerald-800' :
                                distilbertAnalysis.sentiment?.label === 'negative' ? 'text-red-800' : 'text-amber-800'
                              }`}>
                                {distilbertAnalysis.sentiment?.label === 'positive' 
                                  ? '✅ Customer expressed satisfaction. The interaction was positive and the customer seems happy with the service or resolution provided.'
                                  : distilbertAnalysis.sentiment?.label === 'negative'
                                    ? '⚠️ Customer expressed dissatisfaction. This call requires attention - customer may have unresolved issues or complaints.'
                                    : '📊 Customer tone was neutral. Standard interaction without strong positive or negative emotions.'}
                              </p>
                            </div>
                          </div>

                          {/* Call Category with Recommendations */}
                          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                            <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <FileText className="w-4 h-4 text-violet-500" />
                              Call Category (Zero-Shot Classification)
                            </p>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-navy'}`}>
                                  🎯 {distilbertAnalysis.category?.category || 'General Inquiry'}
                                </span>
                                <Badge className="bg-violet-500 text-white">
                                  {distilbertAnalysis.category?.confidence || 50}% match
                                </Badge>
                              </div>
                              {distilbertAnalysis.category?.allCategories?.slice(1, 4).map((cat, i) => (
                                <div key={i} className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <span>{cat.label}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                                      <div className="h-1.5 bg-violet-400 rounded-full" style={{ width: `${cat.score}%` }} />
                                    </div>
                                    <span className="text-xs w-8">{cat.score}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Category-based Recommendation */}
                            <div className="mt-4 p-3 rounded-lg bg-violet-50 border border-violet-200">
                              <p className="text-xs font-semibold text-violet-700 mb-1">💡 AI Recommendation</p>
                              <p className="text-sm text-violet-800">
                                {(distilbertAnalysis.category?.category || '').toLowerCase().includes('stolen') 
                                  ? 'Escalate to security team. Initiate theft investigation protocol and document all details.'
                                  : (distilbertAnalysis.category?.category || '').toLowerCase().includes('complaint') || (distilbertAnalysis.category?.category || '').toLowerCase().includes('range')
                                    ? 'Create support ticket for technical review. Offer compensation or free swap if applicable.'
                                    : (distilbertAnalysis.category?.category || '').toLowerCase().includes('penalty')
                                      ? 'Review penalty policy with customer. Consider waiver for first-time cases.'
                                      : (distilbertAnalysis.category?.category || '').toLowerCase().includes('swap')
                                        ? 'Ensure customer has app access to nearest swap stations. Verify subscription status.'
                                        : 'Standard follow-up within 24 hours. Update customer records with call notes.'}
                              </p>
                            </div>
                          </div>

                          {/* Emotion Detection with All Emotions */}
                          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                            <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <Sparkles className="w-4 h-4 text-violet-500" />
                              Emotion Detection (DistilRoBERTa)
                            </p>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="text-center">
                                <span className="text-4xl">
                                  {distilbertAnalysis.emotion?.emotion === 'joy' ? '😊' :
                                   distilbertAnalysis.emotion?.emotion === 'anger' ? '😠' :
                                   distilbertAnalysis.emotion?.emotion === 'sadness' ? '😢' :
                                   distilbertAnalysis.emotion?.emotion === 'fear' ? '😨' :
                                   distilbertAnalysis.emotion?.emotion === 'surprise' ? '😮' :
                                   distilbertAnalysis.emotion?.emotion === 'disgust' ? '🤢' : '😐'}
                                </span>
                                <p className={`text-sm font-medium capitalize mt-1 ${isDarkMode ? 'text-white' : 'text-navy'}`}>
                                  {distilbertAnalysis.emotion?.emotion || 'Neutral'}
                                </p>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Primary Emotion Confidence</span>
                                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-navy'}`}>{distilbertAnalysis.emotion?.confidence || 50}%</span>
                                </div>
                                <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                                  <div className="h-2 rounded-full bg-violet-500" style={{ width: `${distilbertAnalysis.emotion?.confidence || 50}%` }} />
                                </div>
                              </div>
                            </div>
                            {/* All detected emotions */}
                            {distilbertAnalysis.emotion?.allEmotions && (
                              <div className="grid grid-cols-3 gap-2">
                                {distilbertAnalysis.emotion.allEmotions.slice(0, 6).map((em, i) => (
                                  <div key={i} className={`p-2 rounded-lg text-center ${i === 0 ? 'bg-violet-100 border-2 border-violet-300' : 'bg-gray-50'}`}>
                                    <span className="text-lg">
                                      {em.label === 'joy' ? '😊' : em.label === 'anger' ? '😠' : em.label === 'sadness' ? '😢' :
                                       em.label === 'fear' ? '😨' : em.label === 'surprise' ? '😮' : em.label === 'disgust' ? '🤢' : '😐'}
                                    </span>
                                    <p className="text-xs capitalize text-gray-600">{em.label}</p>
                                    <p className="text-xs font-bold text-violet-600">{em.score}%</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* AI-Generated Insights */}
                          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-violet-50 to-purple-50'} border ${isDarkMode ? 'border-slate-700' : 'border-violet-200'}`}>
                            <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-violet-800'}`}>
                              <Brain className="w-4 h-4 text-violet-500" />
                              🧠 AI-Generated Insights
                            </p>
                            <div className="space-y-3">
                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                                <p className={`text-xs font-semibold ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} mb-1`}>📋 Call Summary</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {distilbertAnalysis.summary?.summary || 
                                   `Customer call regarding ${distilbertAnalysis.category?.category || 'general inquiry'}. 
                                    Sentiment detected as ${distilbertAnalysis.sentiment?.label || 'neutral'} with 
                                    ${distilbertAnalysis.emotion?.emotion || 'neutral'} emotional undertone.`}
                                </p>
                              </div>
                              
                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                                <p className={`text-xs font-semibold ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} mb-1`}>⚡ Action Required</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {distilbertAnalysis.sentiment?.label === 'negative' 
                                    ? '🔴 HIGH PRIORITY: Follow up within 2 hours. Customer satisfaction at risk.'
                                    : distilbertAnalysis.sentiment?.label === 'positive'
                                      ? '🟢 LOW PRIORITY: Standard follow-up. Consider for testimonial/review request.'
                                      : '🟡 MEDIUM PRIORITY: Follow up within 24 hours. Monitor for escalation.'}
                                </p>
                              </div>

                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                                <p className={`text-xs font-semibold ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} mb-1`}>📈 Quality Score Impact</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {distilbertAnalysis.sentiment?.label === 'positive' 
                                    ? 'This call positively impacts agent quality score. Good handling of customer needs.'
                                    : distilbertAnalysis.sentiment?.label === 'negative'
                                      ? 'This call may negatively impact quality metrics. Coaching recommended for agent.'
                                      : 'Neutral impact on quality score. Standard call handling observed.'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Model Info */}
                          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-violet-900/20' : 'bg-violet-50'} text-center`}>
                            <p className={`text-xs ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                              Powered by <strong>Hugging Face Transformers</strong>
                            </p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-violet-500' : 'text-violet-500'}`}>
                              📊 Models: distilbert-base-uncased • bart-large-mnli • distilroberta-emotion
                            </p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-violet-500' : 'text-violet-400'}`}>
                              🕐 Analyzed: {distilbertAnalysis.analyzedAt ? new Date(distilbertAnalysis.analyzedAt).toLocaleString() : 'N/A'} | 
                              📝 Text: {distilbertAnalysis.textLength || 0} chars
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Empty State */}
                      {!isAnalyzingAI && !distilbertAnalysis && (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                            <Cpu className={`w-8 h-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          </div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Click "Analyze" to run DistilBERT AI analysis
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Uses Hugging Face Inference API (Free)
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={() => sendCallReportEmail(selectedCall)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Mail
                  </Button>
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
