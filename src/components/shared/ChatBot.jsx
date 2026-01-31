import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { calculateRealKPIs, generateIssueSummary } from '../../services/analyticsService';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hi! I'm Smart-Audit AI Assistant. I can help you understand the dashboard data, explain metrics, and answer questions about calls, agents, and revenue. What would you like to know?",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { calls } = useData();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Calculate real-time stats for chatbot responses
  const getStats = () => {
    const kpis = calculateRealKPIs(calls);
    const highRiskCalls = calls.filter(c => c.riskLevel === 'high');
    const agents = [...new Set(calls.map(c => c.agent))];
    const cities = [...new Set(calls.map(c => c.city))];
    const callTypes = {};
    calls.forEach(c => {
      callTypes[c.callType] = (callTypes[c.callType] || 0) + 1;
    });
    const topIssue = Object.entries(callTypes).sort((a, b) => b[1] - a[1])[0];
    
    return { kpis, highRiskCalls, agents, cities, callTypes, topIssue };
  };

  // AI-like response generator based on dashboard data
  const generateResponse = (query) => {
    const q = query.toLowerCase();
    const stats = getStats();
    const { kpis, highRiskCalls, agents, cities, callTypes, topIssue } = stats;

    // Overview questions
    if (q.includes('overview') || q.includes('summary') || q.includes('dashboard')) {
      return `📊 **Dashboard Overview:**\n\n• **Total Calls:** ${kpis.totalCalls} calls analyzed\n• **QA Score:** ${kpis.avgQAScore}% average\n• **High-Risk:** ${kpis.highRiskCalls} calls flagged\n• **Revenue Saved:** ₹${kpis.revenueSaved.toLocaleString()}\n\nWe have ${agents.length} agents across ${cities.length} cities. The most common issue is "${topIssue?.[0] || 'General'}" with ${topIssue?.[1] || 0} calls.`;
    }

    // Revenue questions
    if (q.includes('revenue') || q.includes('money') || q.includes('saved') || q.includes('leakage')) {
      const highRevenue = kpis.highRiskCalls * 1500;
      const medRevenue = kpis.mediumRiskCalls * 500;
      const lowRevenue = kpis.lowRiskCalls * 100;
      return `💰 **Revenue Analysis:**\n\n• **Total Saved:** ₹${kpis.revenueSaved.toLocaleString()}\n• High-risk prevention: ₹${highRevenue.toLocaleString()} (${kpis.highRiskCalls} calls × ₹1,500)\n• Medium-risk coaching: ₹${medRevenue.toLocaleString()} (${kpis.mediumRiskCalls} calls × ₹500)\n• Low-risk maintenance: ₹${lowRevenue.toLocaleString()} (${kpis.lowRiskCalls} calls × ₹100)\n\nPotential leakage prevented: ₹${Math.round(kpis.revenueSaved * 0.5).toLocaleString()}`;
    }

    // High-risk questions
    if (q.includes('high risk') || q.includes('high-risk') || q.includes('critical') || q.includes('alert')) {
      const alertsList = highRiskCalls.slice(0, 3).map(c => 
        `• ${c.id}: ${c.callType} - Agent ${c.agent} (${c.city})`
      ).join('\n');
      return `🚨 **High-Risk Calls (${kpis.highRiskCalls} total):**\n\n${alertsList || 'No high-risk calls currently.'}\n\nThese require immediate supervisor attention. Visit the Supervisor Alerts page to review and take action.`;
    }

    // Agent questions
    if (q.includes('agent') || q.includes('performance') || q.includes('team')) {
      const topAgents = agents.slice(0, 5).join(', ');
      return `👥 **Agent Performance:**\n\n• **Total Agents:** ${agents.length}\n• **Top Agents:** ${topAgents}\n• **QA Score Average:** ${kpis.avgQAScore}%\n\nVisit the Agent Coaching page for detailed performance metrics and coaching recommendations.`;
    }

    // QA questions
    if (q.includes('qa') || q.includes('quality') || q.includes('score')) {
      return `📈 **QA Analytics:**\n\n• **Average QA Score:** ${kpis.avgQAScore}%\n• **Call Quality Breakdown:**\n  - Good (Low-risk): ${kpis.lowRiskCalls} calls\n  - At-Risk (Medium): ${kpis.mediumRiskCalls} calls\n  - Critical (High): ${kpis.highRiskCalls} calls\n\nScores are calculated based on SOP adherence and risk assessment.`;
    }

    // City questions
    if (q.includes('city') || q.includes('location') || q.includes('delhi') || q.includes('noida')) {
      const cityList = cities.slice(0, 5).join(', ');
      return `🏙️ **City Insights:**\n\n• **Active Cities:** ${cities.length}\n• **Cities:** ${cityList}\n\nEach city has unique call patterns. Filter by city in Live Call Monitoring to analyze specific regions.`;
    }

    // Call type questions
    if (q.includes('call type') || q.includes('issue') || q.includes('problem') || q.includes('complaint')) {
      const typesList = Object.entries(callTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type, count]) => `• ${type}: ${count} calls`)
        .join('\n');
      return `📞 **Common Call Issues:**\n\n${typesList}\n\nMost frequent: "${topIssue?.[0]}" appears in ${Math.round((topIssue?.[1] / kpis.totalCalls) * 100)}% of calls.`;
    }

    // Live monitoring questions
    if (q.includes('live') || q.includes('monitoring') || q.includes('calls')) {
      return `📡 **Live Call Monitoring:**\n\n• **Total Calls:** ${kpis.totalCalls}\n• Currently showing real-time data from Google Sheets\n• Each call has:\n  - Issue Summary (AI-generated)\n  - QA Score & SOP Adherence\n  - Risk Level & Sentiment\n\nClick any call to see full transcription and analysis!`;
    }

    // SOP questions
    if (q.includes('sop') || q.includes('procedure') || q.includes('protocol')) {
      return `📋 **SOP Adherence:**\n\nOur SOP checklist monitors:\n• Greeting & Introduction\n• ID Verification\n• Problem Understanding\n• Solution Provided\n• Upsell Attempt\n• Closing Script\n\nAgents with SOP adherence < 70% are flagged for coaching.`;
    }

    // Help questions
    if (q.includes('help') || q.includes('what can you') || q.includes('how to')) {
      return `🤖 **I can help you with:**\n\n• 📊 Dashboard overview & metrics\n• 💰 Revenue analysis & leakage\n• 🚨 High-risk call alerts\n• 👥 Agent performance\n• 📈 QA score insights\n• 🏙️ City-wise data\n• 📞 Call type analysis\n• 📋 SOP adherence info\n\nJust ask me anything about the dashboard!`;
    }

    // Default response
    return `I understand you're asking about "${query}". Here's what I found:\n\n• **Total Calls:** ${kpis.totalCalls}\n• **QA Score:** ${kpis.avgQAScore}%\n• **High-Risk:** ${kpis.highRiskCalls} alerts\n\nTry asking about:\n- "Show me the overview"\n- "What's the revenue saved?"\n- "How many high-risk calls?"\n- "Agent performance"\n- "Call type breakdown"`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      time: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = generateResponse(input);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response,
        time: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 bg-gradient-to-br from-teal to-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white"
            style={{ boxShadow: '0 4px 20px rgba(0,230,118,0.4)' }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
              1
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-32px)] md:w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-navy to-navy/90 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Smart-Audit Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-teal rounded-full animate-pulse"></span>
                    <span className="text-teal text-xs">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-white" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="h-[360px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.type === 'user' ? 'bg-teal text-white' : 'bg-navy text-white'
                      }`}>
                        {msg.type === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                        msg.type === 'user' 
                          ? 'bg-teal text-white rounded-tr-sm' 
                          : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-teal-100' : 'text-gray-400'}`}>
                          {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                        <div className="flex gap-1">
                          <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about calls, revenue, agents..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-10 h-10 bg-teal rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
