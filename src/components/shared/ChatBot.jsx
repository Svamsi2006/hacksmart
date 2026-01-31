import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { calculateRealKPIs, generateIssueSummary } from '../../services/analyticsService';

// Grok + Gemini API keys for AI responses (from environment variables)
const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hi! I'm Smart-Audit AI Assistant powered by Grok & Gemini. Ask me about any data - agents, phone numbers, calls, revenue, or say 'help' for all options!",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { calls } = useData();
  const { isDarkMode } = useTheme();

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

    // Phone number questions - search by agent name
    if (q.includes('phone') || q.includes('number') || q.includes('contact') || q.includes('call')) {
      // Extract name from query
      const words = q.split(/\s+/);
      const nameKeywords = words.filter(w => !['phone', 'number', 'of', 'for', 'the', 'what', 'is', 'contact', 'call', 'no', 'give', 'me', 'show', 'get', "'s", 'whats'].includes(w));
      
      if (nameKeywords.length > 0) {
        const searchName = nameKeywords.join(' ');
        const matchingCalls = calls.filter(call => 
          call.agent?.toLowerCase().includes(searchName) ||
          call.callingNo?.includes(searchName)
        );
        
        if (matchingCalls.length > 0) {
          const uniqueNumbers = [...new Set(matchingCalls.map(c => c.callingNo).filter(Boolean))];
          const agentName = matchingCalls[0].agent;
          const callDetails = matchingCalls.slice(0, 3).map(c => 
            `• ${c.callingNo} - ${c.city} (${c.callType})`
          ).join('\n');
          
          return `📞 **Contact Info for ${agentName}:**\n\n${callDetails}\n\n**Total Calls:** ${matchingCalls.length} calls from this agent\n**Cities:** ${[...new Set(matchingCalls.map(c => c.city))].join(', ')}`;
        }
      }
      
      // If no specific name, show general phone data
      const phoneData = calls.filter(c => c.callingNo).slice(0, 5);
      if (phoneData.length > 0) {
        const phoneList = phoneData.map(c => `• ${c.agent}: ${c.callingNo} (${c.city})`).join('\n');
        return `📞 **Recent Call Numbers:**\n\n${phoneList}\n\nAsk for a specific agent like "phone number of Divya" to get their contact info.`;
      }
    }

    // Agent-specific data questions
    const agentNames = [...new Set(calls.map(c => c.agent?.toLowerCase()).filter(Boolean))];
    const matchedAgent = agentNames.find(name => q.includes(name));
    
    if (matchedAgent) {
      const agentCalls = calls.filter(c => c.agent?.toLowerCase() === matchedAgent);
      const agent = agentCalls[0];
      const avgQA = Math.round(agentCalls.reduce((sum, c) => sum + (c.qaScore || 0), 0) / agentCalls.length);
      const phoneNumbers = [...new Set(agentCalls.map(c => c.callingNo).filter(Boolean))];
      const agentCities = [...new Set(agentCalls.map(c => c.city).filter(Boolean))];
      
      return `👤 **Agent: ${agent.agent}**\n\n• **Total Calls:** ${agentCalls.length}\n• **Average QA Score:** ${avgQA}%\n• **Phone Numbers:** ${phoneNumbers.slice(0, 3).join(', ') || 'N/A'}\n• **Cities:** ${agentCities.join(', ')}\n• **Call Types:** ${[...new Set(agentCalls.map(c => c.callType))].slice(0, 3).join(', ')}\n\n📞 To call: ${phoneNumbers[0] || 'No number available'}`;
    }

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
      return `🤖 **I can help you with:**\n\n• 📞 **Phone numbers** - "phone no of Divya"\n• 👤 **Agent info** - "tell me about Jyoti"\n• 📊 Dashboard overview & metrics\n• 💰 Revenue analysis & leakage\n• 🚨 High-risk call alerts\n• 📈 QA score insights\n• 🏙️ City-wise data\n• 📋 SOP adherence info\n\nPowered by **Grok + Gemini AI** - just ask me anything!`;
    }

    // Default - return null to trigger AI response
    return null;
  };

  // AI-powered response using Grok/Gemini
  const getAIResponse = async (query) => {
    const stats = getStats();
    const { kpis, agents, cities, topIssue } = stats;
    
    const context = `You are Smart-Audit AI, a helpful assistant for Battery Smart's call center QA dashboard.
    
Current Dashboard Data:
- Total Calls: ${kpis.totalCalls}
- Average QA Score: ${kpis.avgQAScore}%
- High-Risk Calls: ${kpis.highRiskCalls}
- Revenue Saved: ₹${kpis.revenueSaved.toLocaleString()}
- Active Agents: ${agents.length} (${agents.slice(0, 5).join(', ')})
- Cities: ${cities.join(', ')}
- Top Issue: ${topIssue?.[0] || 'General'}

Sample Agent Data:
${calls.slice(0, 5).map(c => `- ${c.agent}: ${c.callingNo || 'N/A'} (${c.city}, ${c.callType})`).join('\n')}

Answer the user's question based on this data. Be helpful, concise, and use emojis.`;

    // Try Grok first
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            { role: 'system', content: context },
            { role: 'user', content: query }
          ],
          max_tokens: 500,
          temperature: 0.7
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return `🤖 **(Grok AI)**\n\n${text}`;
      }
    } catch (e) {
      console.warn('Grok failed, trying Gemini...', e);
    }

    // Fallback to Gemini
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${context}\n\nUser: ${query}` }] }],
          generationConfig: { maxOutputTokens: 500 }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return `🤖 **(Gemini AI)**\n\n${text}`;
      }
    } catch (e) {
      console.error('Gemini also failed:', e);
    }

    // Final fallback
    const { kpis: k } = getStats();
    return `I understand you're asking about "${query}". Here's what I found:\n\n• **Total Calls:** ${k.totalCalls}\n• **QA Score:** ${k.avgQAScore}%\n• **High-Risk:** ${k.highRiskCalls} alerts\n\nTry asking about agents, phone numbers, revenue, or QA scores!`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      time: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    // Try rule-based response first
    const ruleResponse = generateResponse(currentInput);
    
    if (ruleResponse) {
      // Use rule-based response
      setTimeout(() => {
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: ruleResponse,
          time: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);
    } else {
      // Use AI for complex questions
      try {
        const aiResponse = await getAIResponse(currentInput);
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: aiResponse,
          time: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          text: "Sorry, I couldn't process that. Try asking about agents, phone numbers, revenue, or QA scores!",
          time: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
      setIsTyping(false);
    }
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
            className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white ${
              isDarkMode 
                ? 'bg-gradient-to-br from-cyan-500 to-purple-600' 
                : 'bg-gradient-to-br from-teal to-emerald-600'
            }`}
            style={{ boxShadow: isDarkMode ? '0 4px 20px rgba(139,92,246,0.4)' : '0 4px 20px rgba(0,230,118,0.4)' }}
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
            className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-32px)] md:w-[400px] rounded-2xl shadow-2xl overflow-hidden ${
              isDarkMode 
                ? 'bg-[#0d0f1a] border border-purple-500/30' 
                : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-900/80 to-[#0d0f1a]' 
                : 'bg-gradient-to-r from-navy to-navy/90'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-cyan-500/20' : 'bg-teal/20'
                }`}>
                  <Bot className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Smart-Audit Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? 'bg-cyan-400' : 'bg-teal'}`}></span>
                    <span className={`text-xs ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`}>Online</span>
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
                <div className={`h-[360px] overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-[#0a0c15]' : 'bg-gray-50'}`}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.type === 'user' 
                          ? (isDarkMode ? 'bg-cyan-500 text-white' : 'bg-teal text-white')
                          : (isDarkMode ? 'bg-purple-600 text-white' : 'bg-navy text-white')
                      }`}>
                        {msg.type === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                        msg.type === 'user' 
                          ? (isDarkMode ? 'bg-cyan-500 text-white rounded-tr-sm' : 'bg-teal text-white rounded-tr-sm')
                          : (isDarkMode ? 'bg-purple-900/50 border border-purple-500/30 text-gray-200 rounded-tl-sm' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm')
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.type === 'user' ? (isDarkMode ? 'text-cyan-100' : 'text-teal-100') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
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
                      <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center ${isDarkMode ? 'bg-purple-600' : 'bg-navy'}`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className={`p-3 rounded-2xl rounded-tl-sm ${isDarkMode ? 'bg-purple-900/50 border border-purple-500/30' : 'bg-white border border-gray-200 shadow-sm'}`}>
                        <div className="flex gap-1">
                          <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                            className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-cyan-400' : 'bg-gray-400'}`}
                          />
                          <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                            className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-gray-400'}`}
                          />
                          <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                            className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-cyan-400' : 'bg-gray-400'}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`p-4 border-t ${isDarkMode ? 'border-purple-500/30 bg-[#0d0f1a]' : 'border-gray-200 bg-white'}`}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about phone numbers, agents..."
                      className={`flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 ${
                        isDarkMode 
                          ? 'bg-purple-900/30 border-purple-500/30 text-white placeholder-gray-500 focus:ring-cyan-500' 
                          : 'border-gray-300 focus:ring-teal focus:border-transparent'
                      }`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-teal'
                      }`}
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
