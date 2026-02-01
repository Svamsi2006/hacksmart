import { motion } from 'framer-motion';
import { GraduationCap, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { agentEvaluationChecklist, sopChecklist, issueToSopMapping } from '../../data/sopData';

const AgentCoaching = () => {
  const { calls } = useData();
  const { isDarkMode } = useTheme();

  // Generate agent coaching data from real calls
  const generateAgentData = () => {
    const agentStats = {};
    
    calls.forEach(call => {
      const agent = call.agent || 'Unknown Agent';
      if (!agentStats[agent]) {
        agentStats[agent] = {
          name: agent,
          avatar: agent.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          calls: 0,
          totalQaScore: 0,
          totalSopScore: 0,
          issues: [],
          coachingThemes: new Set(),
          recentCalls: []
        };
      }
      
      agentStats[agent].calls++;
      agentStats[agent].totalQaScore += call.qaScore || 0;
      agentStats[agent].totalSopScore += call.sopAdherence || 0;
      agentStats[agent].recentCalls.push(call);
      
      // Identify coaching themes based on issues
      if ((call.qaScore || 0) < 80) {
        agentStats[agent].coachingThemes.add('QA Improvement');
      }
      if ((call.sopAdherence || 0) < 70) {
        agentStats[agent].coachingThemes.add('SOP Compliance');
      }
      if (call.riskLevel === 'high') {
        agentStats[agent].coachingThemes.add('Risk Management');
      }
      if (call.callType?.includes('Penalty')) {
        agentStats[agent].coachingThemes.add('Penalty Handling');
      }
      if (call.callType?.includes('Swap') || call.callType?.includes('Range')) {
        agentStats[agent].coachingThemes.add('Swap Resolution');
      }
    });
    
    return Object.values(agentStats).map(agent => ({
      ...agent,
      qaScore: agent.calls > 0 ? Math.round(agent.totalQaScore / agent.calls) : 0,
      sopScore: agent.calls > 0 ? Math.round(agent.totalSopScore / agent.calls) : 0,
      coachingThemes: Array.from(agent.coachingThemes).slice(0, 3),
      status: agent.totalQaScore / agent.calls >= 85 ? 'high-performer' 
        : agent.totalQaScore / agent.calls >= 70 ? 'improving' 
        : 'needs-attention',
      recentNudges: generateNudges(agent)
    }));
  };

  // Generate coaching nudges based on agent performance
  const generateNudges = (agent) => {
    const nudges = [];
    const avgQa = agent.calls > 0 ? agent.totalQaScore / agent.calls : 0;
    const avgSop = agent.calls > 0 ? agent.totalSopScore / agent.calls : 0;
    
    if (avgQa < 80) {
      nudges.push({
        time: 'Today',
        message: `Focus on customer verification steps. Current QA: ${Math.round(avgQa)}%`,
        type: 'warning'
      });
    }
    if (avgSop < 70) {
      nudges.push({
        time: 'Today',
        message: 'Review SOP checklist before each call. TAT targets: < 4 min resolution.',
        type: 'alert'
      });
    }
    if (avgQa >= 85) {
      nudges.push({
        time: 'Today',
        message: `Excellent performance! QA Score: ${Math.round(avgQa)}%. Keep it up!`,
        type: 'success'
      });
    }
    
    // Add default nudge if none
    if (nudges.length === 0) {
      nudges.push({
        time: 'Today',
        message: 'Remember to attempt upsell when customer is eligible for plan upgrade.',
        type: 'info'
      });
    }
    
    return nudges.slice(0, 2);
  };

  const allAgentsData = generateAgentData();
  
  // Filter to show only agents who need training (SOP adherence < 80%)
  const agentsData = allAgentsData.filter(agent => {
    // Include if SOP score is below 80 OR QA score is below 80 OR status is needs-attention
    return agent.sopScore < 80 || agent.qaScore < 80 || agent.status === 'needs-attention';
  });
  
  // Calculate overall stats
  const totalAgentsNeedingTraining = agentsData.length;
  const totalNudges = agentsData.reduce((sum, a) => sum + a.recentNudges.length, 0);
  const improvingAgents = allAgentsData.filter(a => a.status === 'high-performer' || a.status === 'improving').length;
  const topTheme = agentsData.flatMap(a => a.coachingThemes)[0] || 'SOP Compliance';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-navy'}`}>Agent Coaching Panel</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI-powered personalized coaching based on SOP v2.0 and real call data</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDarkMode ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-amber/10 border border-amber/30'}`}>
          <Filter className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-amber'}`} />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-cyan-400' : 'text-amber'}`}>
            Showing {agentsData.length} agents needing training (SOP &lt; 80%)
          </span>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agentsData.length > 0 ? agentsData.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 transition-shadow ${isDarkMode ? 'bg-[#0d0f1a]/80 border border-purple-500/20 hover:border-cyan-500/40' : 'hover:shadow-lg'}`}>
              {/* Agent Header */}
              <div className={`flex items-center gap-4 mb-6 pb-6 border-b ${isDarkMode ? 'border-purple-500/20' : 'border-gray-200'}`}>
                <div className={`w-16 h-16 text-white rounded-full flex items-center justify-center text-xl font-bold ${isDarkMode ? 'bg-gradient-to-br from-cyan-500 to-purple-600' : 'bg-gradient-to-br from-teal to-navy'}`}>
                  {agent.avatar}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-navy'}`}>{agent.name}</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{agent.calls} calls analyzed</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={agent.status}>
                      {agent.status === 'high-performer' ? 'High Performer' :
                       agent.status === 'improving' ? 'Improving' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`}>{agent.qaScore}%</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>QA Score</p>
                </div>
              </div>

              {/* SOP Adherence */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>SOP Adherence</span>
                  <span className={`text-sm font-bold ${agent.sopScore >= 80 ? (isDarkMode ? 'text-cyan-400' : 'text-teal') : agent.sopScore >= 60 ? 'text-amber' : 'text-danger'}`}>
                    {agent.sopScore}%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-purple-900/50' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-2 rounded-full ${agent.sopScore >= 80 ? (isDarkMode ? 'bg-cyan-400' : 'bg-teal') : agent.sopScore >= 60 ? 'bg-amber' : 'bg-danger'}`}
                    style={{ width: `${agent.sopScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Coaching Themes */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-amber'}`} />
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Coaching Focus Areas</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agent.coachingThemes.length > 0 ? agent.coachingThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg ${isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-amber/10 text-amber'}`}
                    >
                      {theme}
                    </span>
                  )) : (
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-lg ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-teal/10 text-teal'}`}>
                      ✓ All areas performing well
                    </span>
                  )}
                </div>
              </div>

              {/* Recent Nudges */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`} />
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recent Micro-Coaching</p>
                </div>
                <div className="space-y-2">
                  {agent.recentNudges.map((nudge, idx) => (
                    <div key={idx} className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                      nudge.type === 'success' ? (isDarkMode ? 'bg-cyan-500/10' : 'bg-teal/10') : 
                      nudge.type === 'warning' ? (isDarkMode ? 'bg-amber-500/10' : 'bg-amber/10') : 
                      nudge.type === 'alert' ? (isDarkMode ? 'bg-red-500/10' : 'bg-danger/10') : (isDarkMode ? 'bg-purple-900/30' : 'bg-gray-50')
                    }`}>
                      {nudge.type === 'success' ? <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`} /> :
                       nudge.type === 'alert' ? <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" /> :
                       <MessageSquare className="w-4 h-4 text-amber flex-shrink-0" />}
                      <div>
                        <p className={`mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{nudge.time}</p>
                        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{nudge.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button - Removed View History */}
              <Button size="sm" variant="primary" className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500' : ''}`}>
                Send Coaching
              </Button>
            </Card>
          </motion.div>
        )) : (
          <Card className={`p-8 col-span-2 text-center ${isDarkMode ? 'bg-[#0d0f1a]/80 border border-purple-500/20' : ''}`}>
            <GraduationCap className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-purple-500' : 'text-gray-300'}`} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>All agents are performing well! No training needed currently.</p>
          </Card>
        )}
      </div>

      {/* Coaching Insights - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`p-6 ${isDarkMode ? 'bg-[#0d0f1a]/80 border border-cyan-500/20' : 'bg-teal/5 border-teal/20'}`}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`} />
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Agents Performing Well</p>
          </div>
          <p className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>{improvingAgents}/{allAgentsData.length}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Agents with QA score above 70% threshold</p>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-[#0d0f1a]/80 border border-purple-500/20' : 'bg-amber/5 border-amber/20'}`}>
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-amber'}`} />
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Coaching Nudges</p>
          </div>
          <p className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>{totalNudges}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Real-time micro-coaching messages generated from call analysis</p>
        </Card>

        <Card className={`p-6 ${isDarkMode ? 'bg-[#0d0f1a]/80 border border-purple-500/20' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-blue-500'}`} />
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Top Theme</p>
          </div>
          <p className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>{topTheme}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Most common coaching focus area based on SOP compliance</p>
        </Card>
      </div>

      {/* SOP Agent Evaluation Checklist */}
      <Card className={`p-6 ${isDarkMode ? 'bg-[#0d0f1a]/80 border border-purple-500/20' : ''}`}>
        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-navy'}`}>SOP Agent Evaluation Checklist</h3>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Based on Battery Smart SOP v2.0 Standards</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentEvaluationChecklist.map((item, idx) => (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-gray-50'}`}>
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`} />
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-navy'}`}>{item.item}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Max: {item.maxPoints} points</p>
              </div>
            </div>
          ))}
        </div>
        <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-purple-500/10' : 'bg-amber/10'}`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-amber'}`}>Target Thresholds</p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>QA Score: ≥85% | SOP Adherence: ≥80% | TAT: &lt;4 minutes</p>
        </div>
      </Card>

      {/* Timeline View - Real Data */}
      <Card className={`p-6 ${isDarkMode ? 'bg-[#0d0f1a]/80 border border-purple-500/20' : ''}`}>
        <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-navy'}`}>Recent Coaching Activity</h3>
        <div className="space-y-4">
          {calls.slice(0, 4).map((call, idx) => {
            const isHighRisk = call.riskLevel === 'high';
            const isLowQa = (call.qaScore || 0) < 80;
            const coachingType = isHighRisk ? 'Risk Management' : isLowQa ? 'QA Improvement' : 'Positive Reinforcement';
            const dotColor = isHighRisk ? 'bg-danger' : isLowQa ? 'bg-amber' : (isDarkMode ? 'bg-cyan-400' : 'bg-teal');
            
            return (
              <div key={idx} className="flex items-start gap-4">
                <div className={`w-2 h-2 ${dotColor} rounded-full mt-2`}></div>
                <div className={`flex-1 p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{call.date || 'Today'}</p>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-navy'}`}>{call.agent} - {coachingType}</p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isHighRisk 
                      ? `High-risk call flagged - ${call.callType}. Escalation recommended.`
                      : isLowQa 
                        ? `QA Score: ${call.qaScore}%. Focus on SOP compliance.`
                        : `Good performance on ${call.callType}. QA: ${call.qaScore}%`
                    }
                  </p>
                </div>
              </div>
            );
          })}
          {calls.length === 0 && (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <p>No coaching activity yet. Load calls to generate coaching timeline.</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default AgentCoaching;
