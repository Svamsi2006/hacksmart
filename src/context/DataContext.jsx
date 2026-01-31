// Data Context for managing real call data from Google Sheets
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  fetchGoogleSheetsData, 
  transformCallData,
  SHEET_URL
} from '../services/googleSheetsService';
import { batchAnalyzeAudios } from '../services/audioAnalysisService';
import { permanentCallData, getAnalyticsSummary } from '../data/permanentCallData';

// Generate analytics from call data
const generateAnalytics = (calls) => {
  const totalCalls = calls.length;
  const avgQaScore = totalCalls > 0 
    ? Math.round(calls.reduce((sum, c) => sum + (c.qaScore || 0), 0) / totalCalls)
    : 0;
  const avgSopAdherence = totalCalls > 0
    ? Math.round(calls.reduce((sum, c) => sum + (c.sopAdherence || 0), 0) / totalCalls)
    : 0;
  
  const sentimentBreakdown = {
    positive: calls.filter(c => c.sentiment === 'positive').length,
    neutral: calls.filter(c => c.sentiment === 'neutral').length,
    negative: calls.filter(c => c.sentiment === 'negative').length,
  };
  
  const riskBreakdown = {
    high: calls.filter(c => c.riskLevel === 'high').length,
    medium: calls.filter(c => c.riskLevel === 'medium').length,
    low: calls.filter(c => c.riskLevel === 'low').length,
  };
  
  // Agent leaderboard
  const agentStats = {};
  calls.forEach(call => {
    if (!agentStats[call.agent]) {
      agentStats[call.agent] = { name: call.agent, calls: 0, totalScore: 0 };
    }
    agentStats[call.agent].calls++;
    agentStats[call.agent].totalScore += call.qaScore || 0;
  });
  
  const agentLeaderboard = Object.values(agentStats)
    .map(a => ({ ...a, avgScore: Math.round(a.totalScore / a.calls) }))
    .sort((a, b) => b.avgScore - a.avgScore);
  
  return {
    totalCalls,
    avgQaScore,
    avgSopAdherence,
    sentimentBreakdown,
    riskBreakdown,
    agentLeaderboard,
  };
};

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    // Return safe defaults instead of throwing during initial render
    return {
      calls: permanentCallData,
      analytics: generateAnalytics(permanentCallData),
      loading: false,
      analyzing: false,
      progress: { current: 0, total: 0, percentage: 0 },
      error: null,
      lastUpdated: new Date(),
      dataSource: 'live',
      fetchFromGoogleSheets: () => {},
      analyzeAllAudio: () => {},
      getHighRiskCalls: () => permanentCallData.filter(c => c.riskLevel === 'high'),
    };
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Initialize with permanent call data
  const [calls, setCalls] = useState(permanentCallData);
  const [analytics, setAnalytics] = useState(() => generateAnalytics(permanentCallData));
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sheetUrl, setSheetUrl] = useState(SHEET_URL);
  const [dataSource, setDataSource] = useState('live'); // 'demo' or 'live'

  // Initialize analytics on load
  useEffect(() => {
    // Data is already loaded from permanentCallData
    setAnalytics(generateAnalytics(permanentCallData));
  }, []);

  // Generate demo data for immediate display
  const loadDemoData = () => {
    const demoData = generateDemoData();
    setCalls(demoData);
    setAnalytics(generateAnalytics(demoData));
    setDataSource('demo');
    setLoading(false);
    setLastUpdated(new Date());
  };

  // Fetch real data from Google Sheets
  const fetchFromGoogleSheets = useCallback(async (url = sheetUrl) => {
    setLoading(true);
    setError(null);
    
    try {
      const rawData = await fetchGoogleSheetsData(url);
      const transformedData = transformCallData(rawData);
      setCalls(transformedData);
      setAnalytics(generateAnalytics(transformedData));
      setDataSource('live');
      setLastUpdated(new Date());
      setSheetUrl(url);
      return transformedData;
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}. Make sure the sheet is publicly accessible.`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [sheetUrl]);

  // Analyze all audio files
  const analyzeAllAudio = useCallback(async () => {
    if (calls.length === 0) return;
    
    setAnalyzing(true);
    setProgress({ current: 0, total: calls.length, percentage: 0 });
    
    try {
      const analyzedCalls = await batchAnalyzeAudios(calls, setProgress);
      setCalls(analyzedCalls);
      setAnalytics(generateAnalytics(analyzedCalls));
      setLastUpdated(new Date());
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  }, [calls]);

  // Refresh data
  const refresh = useCallback(async () => {
    if (dataSource === 'live') {
      await fetchFromGoogleSheets();
    } else {
      loadDemoData();
    }
  }, [dataSource, fetchFromGoogleSheets]);

  // Get calls by filter
  const getFilteredCalls = useCallback((filters = {}) => {
    return calls.filter(call => {
      if (filters.city && filters.city !== 'All Cities' && call.city !== filters.city) return false;
      if (filters.riskLevel && call.riskLevel !== filters.riskLevel) return false;
      if (filters.sentiment && call.sentiment !== filters.sentiment) return false;
      if (filters.agent && call.agent !== filters.agent) return false;
      return true;
    });
  }, [calls]);

  // Get live (recent) calls
  const getLiveCalls = useCallback((limit = 10) => {
    return calls.slice(0, limit);
  }, [calls]);

  // Get high risk calls
  const getHighRiskCalls = useCallback(() => {
    return calls.filter(call => call.riskLevel === 'high');
  }, [calls]);

  // Get agent leaderboard
  const getAgentLeaderboard = useCallback(() => {
    return analytics?.agentLeaderboard || [];
  }, [analytics]);

  const value = {
    // State
    calls,
    analytics,
    loading,
    analyzing,
    progress,
    error,
    lastUpdated,
    sheetUrl,
    dataSource,
    
    // Actions
    fetchFromGoogleSheets,
    analyzeAllAudio,
    refresh,
    loadDemoData,
    setSheetUrl,
    
    // Getters
    getFilteredCalls,
    getLiveCalls,
    getHighRiskCalls,
    getAgentLeaderboard,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Generate demo data for immediate display
const generateDemoData = () => {
  const cities = ['Delhi', 'Bangalore', 'Pune', 'Hyderabad'];
  const agents = [
    'Priya Sharma', 'Rahul Kumar', 'Anjali Patel', 'Vikram Singh',
    'Neha Gupta', 'Amit Verma', 'Sneha Reddy', 'Karan Mehta'
  ];
  const sentiments = ['positive', 'neutral', 'negative'];
  const callTypes = ['Battery Issue', 'Payment Query', 'Station Issue', 'Plan Upgrade', 'General Inquiry'];

  const calls = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const sentiment = sentiments[Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : 2];
    const sopAdherence = Math.floor(Math.random() * 45) + 55;
    const qaScore = Math.floor(sopAdherence * (sentiment === 'positive' ? 1.1 : sentiment === 'negative' ? 0.85 : 1));

    calls.push({
      id: `CALL-${8000 + i}`,
      agent,
      city,
      callDate: new Date(now - Math.random() * 86400000 * 7).toISOString(),
      duration: `${Math.floor(Math.random() * 10) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      audioUrl: `https://storage.batterysmart.com/recordings/call-${8000 + i}.mp3`,
      customerPhone: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      callType: callTypes[Math.floor(Math.random() * callTypes.length)],
      status: 'Completed',
      sentiment,
      sopAdherence,
      riskLevel: sopAdherence < 60 || sentiment === 'negative' ? 'high' : sopAdherence < 80 ? 'medium' : 'low',
      qaScore: Math.min(100, qaScore),
      summary: generateSummary(sentiment, sopAdherence),
      issues: generateIssues(sopAdherence, sentiment),
    });
  }

  return calls.sort((a, b) => new Date(b.callDate) - new Date(a.callDate));
};

const generateSummary = (sentiment, sopAdherence) => {
  if (sentiment === 'positive' && sopAdherence >= 85) {
    return 'Excellent call. Customer satisfied, all SOP steps followed correctly.';
  }
  if (sentiment === 'negative') {
    return 'Customer expressed frustration. Multiple SOP violations detected. Immediate coaching recommended.';
  }
  if (sopAdherence < 70) {
    return 'Several SOP steps skipped. Agent needs additional training on compliance.';
  }
  return 'Standard call with acceptable SOP adherence. Minor improvements possible.';
};

const generateIssues = (sopAdherence, sentiment) => {
  const issues = [];
  if (sopAdherence < 70) issues.push('ID verification skipped');
  if (sopAdherence < 80) issues.push('Upsell opportunity missed');
  if (sentiment === 'negative') issues.push('Customer frustration detected');
  if (sopAdherence < 60) issues.push('Resolution mismatch');
  return issues;
};

export default DataContext;
