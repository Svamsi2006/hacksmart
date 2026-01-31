import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Phone, TrendingUp, AlertTriangle, DollarSign, RefreshCw, Cloud, Database, Key, CheckCircle, XCircle } from 'lucide-react';
import KPICard from '../shared/KPICard';
import Card from '../shared/Card';
import Button from '../shared/Button';
import LineChart from '../charts/LineChart';
import BarChart from '../charts/BarChart';
import DonutChart from '../charts/DonutChart';
import { useData } from '../../context/DataContext';
import { kpiData as fallbackKpi, dailyTrend as fallbackTrend, callQuality as fallbackQuality, sentimentData as fallbackSentiment } from '../../data/mockData';
import { 
  calculateRealKPIs, 
  calculateDailyTrend, 
  calculateCallQuality, 
  calculateSentimentData, 
  generateRealInsights,
  formatIndianCurrency 
} from '../../services/analyticsService';

const Overview = ({ setActivePage }) => {
  const { 
    analytics, 
    calls,
    loading, 
    analyzing,
    dataSource, 
    lastUpdated, 
    analyzeAllAudio,
    fetchFromGoogleSheets,
    getHighRiskCalls
  } = useData();

  // API Key state
  const [apiKey, setApiKey] = useState(localStorage.getItem('deepgram_api_key') || '');
  const [apiKeyStatus, setApiKeyStatus] = useState(localStorage.getItem('deepgram_api_key') ? 'saved' : 'empty');
  const [showApiInput, setShowApiInput] = useState(!localStorage.getItem('deepgram_api_key'));

  // Handle API key submission
  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('deepgram_api_key', apiKey.trim());
      setApiKeyStatus('saved');
      setShowApiInput(false);
      // Update the transcription service dynamically
      window.DEEPGRAM_API_KEY = apiKey.trim();
    }
  };

  const handleApiKeyReset = () => {
    setShowApiInput(true);
    setApiKeyStatus('empty');
  };

  // Calculate REAL analytics from actual call data
  const realKPIs = useMemo(() => calculateRealKPIs(calls), [calls]);
  const dailyTrend = useMemo(() => calculateDailyTrend(calls), [calls]);
  const callQuality = useMemo(() => calculateCallQuality(calls), [calls]);
  const sentimentData = useMemo(() => calculateSentimentData(calls), [calls]);
  
  // Use real analytics if available, otherwise fallback
  const kpiData = calls.length > 0 ? realKPIs : fallbackKpi;
  const chartData = calls.length > 0 
    ? { dailyTrend, callQuality, sentimentData } 
    : { dailyTrend: fallbackTrend, callQuality: fallbackQuality, sentimentData: fallbackSentiment };
  const highRiskCalls = getHighRiskCalls();

  // Navigate to Supervisor Alerts when clicking high-risk
  const handleHighRiskClick = () => {
    if (setActivePage) {
      setActivePage('supervisor-alerts');
    }
  };

  // Generate accurate insights from real data using analytics service
  const insights = useMemo(() => {
    if (calls.length === 0) {
      return [
        { color: 'teal', title: '78% QA Score Achievement', description: 'Demo mode - Connect to Google Sheets for live data.' },
        { color: 'amber', title: '12 High-Risk Calls Detected', description: 'Demo data displayed.' },
        { color: 'danger', title: '₹3.4L Revenue Saved', description: 'Demo mode - Connect for actual calculations.' },
        { color: 'blue', title: '62% Positive Sentiment', description: 'Demo data - Real analysis requires live connection.' }
      ];
    }
    return generateRealInsights(calls);
  }, [calls]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Deepgram API Key Input - Highlighted Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-3 md:p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-purple-500/30"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Key className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-sm md:text-base text-navy flex items-center gap-2">
                Deepgram API Key
                {apiKeyStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-xs text-teal font-normal">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                )}
              </p>
              <p className="text-[10px] md:text-xs text-gray-600">
                Enter your Deepgram API key for audio transcription
              </p>
            </div>
          </div>
          
          {showApiInput ? (
            <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-md">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Deepgram API Key..."
                className="flex-1 px-3 md:px-4 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleApiKeySubmit}
                className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap text-xs md:text-sm"
              >
                Activate
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-gray-600 bg-white/50 px-2 md:px-3 py-1 rounded">
                ••••••••{apiKey.slice(-4)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleApiKeyReset}
                className="text-purple-600 border-purple-300 text-xs md:text-sm"
              >
                Change
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Data Source Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 rounded-xl ${
          dataSource === 'live' ? 'bg-teal/10 border border-teal/30' : 'bg-amber/10 border border-amber/30'
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3">
          {dataSource === 'live' ? (
            <Cloud className="w-4 h-4 md:w-5 md:h-5 text-teal" />
          ) : (
            <Database className="w-4 h-4 md:w-5 md:h-5 text-amber" />
          )}
          <div>
            <p className="font-semibold text-sm md:text-base text-navy">
              {dataSource === 'live' ? 'Live Data Connected' : 'Demo Data Mode'}
            </p>
            <p className="text-[10px] md:text-xs text-gray-600">
              {lastUpdated ? `Last: ${lastUpdated.toLocaleTimeString()}` : 'Using sample data'}
              {' • '}{calls.length} calls
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={analyzeAllAudio}
            disabled={analyzing || calls.length === 0}
            className="flex-1 sm:flex-none text-xs md:text-sm"
          >
            <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing...' : 'Re-Analyze'}
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => fetchFromGoogleSheets()}
            disabled={loading}
            className="flex-1 sm:flex-none text-xs md:text-sm"
          >
            <Cloud className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Fetch Live
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <KPICard
          title="Total Calls Audited Today"
          value={kpiData.totalCalls || 0}
          icon={Phone}
          trend={kpiData.trend?.calls || 12.5}
          helper="Across all cities"
        />
        <KPICard
          title="Average QA Score"
          value={kpiData.avgQAScore || 0}
          icon={TrendingUp}
          trend={kpiData.trend?.qaScore || 2.3}
          suffix="%"
          helper="Weighted by risk level"
        />
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={handleHighRiskClick}
          className="cursor-pointer"
        >
          <KPICard
            title="High-Risk Calls Flagged"
            value={kpiData.highRiskCalls || 0}
            icon={AlertTriangle}
            trend={kpiData.trend?.risk || -5.2}
            helper="Click to view alerts →"
            className="ring-2 ring-danger/30 hover:ring-danger/50 transition-all"
          />
        </motion.div>
        <KPICard
          title="Estimated Revenue Saved"
          value={formatIndianCurrency(kpiData.revenueSaved || 0)}
          icon={DollarSign}
          trend={kpiData.trend?.revenue || 8.7}
          helper={`High: ₹${(kpiData.highRiskCalls || 0) * 1500} | Med: ₹${(kpiData.mediumRiskCalls || 0) * 500} | Low: ₹${(kpiData.lowRiskCalls || 0) * 100}`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="p-6">
          <LineChart
            data={chartData.dailyTrend || dailyTrend}
            dataKey="score"
            xKey="date"
            title="Daily QA Score Trend (Last 14 Days)"
          />
        </Card>

        {/* Bar Chart */}
        <Card className="p-6">
          <BarChart
            data={chartData.callQuality || callQuality}
            xKey="category"
            title="Call Quality Breakdown"
          />
        </Card>
      </div>

      {/* Donut Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <DonutChart
            data={chartData.sentimentData || sentimentData}
            title="Call Sentiment Distribution"
          />
        </Card>

        {/* Key Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-navy mb-4">Key Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  insight.color === 'teal' ? 'bg-teal/5 border-teal/20' :
                  insight.color === 'amber' ? 'bg-amber/5 border-amber/20' :
                  insight.color === 'danger' ? 'bg-danger/5 border-danger/20' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  insight.color === 'teal' ? 'bg-teal' :
                  insight.color === 'amber' ? 'bg-amber' :
                  insight.color === 'danger' ? 'bg-danger' :
                  'bg-blue-500'
                }`}></div>
                <div>
                  <p className="text-sm font-semibold text-navy">{insight.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Overview;
