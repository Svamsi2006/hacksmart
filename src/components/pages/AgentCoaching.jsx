import { motion } from 'framer-motion';
import { GraduationCap, MessageSquare, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import { useData } from '../../context/DataContext';
import { agentEvaluationChecklist, sopChecklist, issueToSopMapping } from '../../data/sopData';

const AgentCoaching = () => {
  const { calls } = useData();

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

  const agentsData = generateAgentData();
  
  // Calculate overall stats
  const totalNudges = agentsData.reduce((sum, a) => sum + a.recentNudges.length, 0);
  const improvingAgents = agentsData.filter(a => a.status === 'high-performer' || a.status === 'improving').length;
  const topTheme = agentsData.flatMap(a => a.coachingThemes)[0] || 'SOP Compliance';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy">Agent Coaching Panel</h2>
        <p className="text-sm text-gray-600 mt-1">AI-powered personalized coaching based on SOP v2.0 and real call data</p>
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
            <Card className="p-6 hover:shadow-lg transition-shadow">
              {/* Agent Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-teal to-navy text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {agent.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-navy">{agent.name}</h3>
                  <p className="text-xs text-gray-500">{agent.calls} calls analyzed</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={agent.status}>
                      {agent.status === 'high-performer' ? 'High Performer' :
                       agent.status === 'improving' ? 'Improving' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-teal">{agent.qaScore}%</p>
                  <p className="text-xs text-gray-500">QA Score</p>
                </div>
              </div>

              {/* SOP Adherence */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">SOP Adherence</span>
                  <span className={`text-sm font-bold ${agent.sopScore >= 80 ? 'text-teal' : agent.sopScore >= 60 ? 'text-amber' : 'text-danger'}`}>
                    {agent.sopScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${agent.sopScore >= 80 ? 'bg-teal' : agent.sopScore >= 60 ? 'bg-amber' : 'bg-danger'}`}
                    style={{ width: `${agent.sopScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Coaching Themes */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-amber" />
                  <p className="text-sm font-semibold text-gray-700">Coaching Focus Areas</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agent.coachingThemes.length > 0 ? agent.coachingThemes.map((theme, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-amber/10 text-amber text-xs font-medium rounded-lg"
                    >
                      {theme}
                    </span>
                  )) : (
                    <span className="px-3 py-1.5 bg-teal/10 text-teal text-xs font-medium rounded-lg">
                      ✓ All areas performing well
                    </span>
                  )}
                </div>
              </div>

              {/* Recent Nudges */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-teal" />
                  <p className="text-sm font-semibold text-gray-700">Recent Micro-Coaching</p>
                </div>
                <div className="space-y-2">
                  {agent.recentNudges.map((nudge, idx) => (
                    <div key={idx} className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                      nudge.type === 'success' ? 'bg-teal/10' : 
                      nudge.type === 'warning' ? 'bg-amber/10' : 
                      nudge.type === 'alert' ? 'bg-danger/10' : 'bg-gray-50'
                    }`}>
                      {nudge.type === 'success' ? <CheckCircle className="w-4 h-4 text-teal flex-shrink-0" /> :
                       nudge.type === 'alert' ? <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" /> :
                       <MessageSquare className="w-4 h-4 text-amber flex-shrink-0" />}
                      <div>
                        <p className="text-gray-500 mb-1">{nudge.time}</p>
                        <p className="text-gray-700">{nudge.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button size="sm" variant="primary" className="flex-1">
                  Send Coaching
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  View History
                </Button>
              </div>
            </Card>
          </motion.div>
        )) : (
          <Card className="p-8 col-span-2 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No agent data available. Load calls from Google Sheets to see coaching insights.</p>
          </Card>
        )}
      </div>

      {/* Coaching Insights - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-teal/5 border-teal/20">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-teal" />
            <p className="text-sm font-semibold text-gray-600">Agents Performing Well</p>
          </div>
          <p className="text-3xl font-bold text-navy mb-2">{improvingAgents}/{agentsData.length}</p>
          <p className="text-xs text-gray-600">Agents with QA score above 70% threshold</p>
        </Card>

        <Card className="p-6 bg-amber/5 border-amber/20">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-amber" />
            <p className="text-sm font-semibold text-gray-600">Coaching Nudges</p>
          </div>
          <p className="text-3xl font-bold text-navy mb-2">{totalNudges}</p>
          <p className="text-xs text-gray-600">Real-time micro-coaching messages generated from call analysis</p>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-6 h-6 text-blue-500" />
            <p className="text-sm font-semibold text-gray-600">Top Theme</p>
          </div>
          <p className="text-3xl font-bold text-navy mb-2">{topTheme}</p>
          <p className="text-xs text-gray-600">Most common coaching focus area based on SOP compliance</p>
        </Card>
      </div>

      {/* SOP Agent Evaluation Checklist */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-navy mb-4">SOP Agent Evaluation Checklist</h3>
        <p className="text-sm text-gray-500 mb-4">Based on Battery Smart SOP v2.0 Standards</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentEvaluationChecklist.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-navy">{item.item}</p>
                <p className="text-xs text-gray-500">Max: {item.maxPoints} points</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber/10 rounded-lg">
          <p className="text-sm font-medium text-amber">Target Thresholds</p>
          <p className="text-xs text-gray-600 mt-1">QA Score: ≥85% | SOP Adherence: ≥80% | TAT: &lt;4 minutes</p>
        </div>
      </Card>

      {/* Timeline View - Real Data */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-navy mb-6">Recent Coaching Activity</h3>
        <div className="space-y-4">
          {calls.slice(0, 4).map((call, idx) => {
            const isHighRisk = call.riskLevel === 'high';
            const isLowQa = (call.qaScore || 0) < 80;
            const coachingType = isHighRisk ? 'Risk Management' : isLowQa ? 'QA Improvement' : 'Positive Reinforcement';
            const dotColor = isHighRisk ? 'bg-danger' : isLowQa ? 'bg-amber' : 'bg-teal';
            
            return (
              <div key={idx} className="flex items-start gap-4">
                <div className={`w-2 h-2 ${dotColor} rounded-full mt-2`}></div>
                <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">{call.date || 'Today'}</p>
                  <p className="text-sm font-semibold text-navy">{call.agent} - {coachingType}</p>
                  <p className="text-xs text-gray-600 mt-1">
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
            <div className="text-center py-8 text-gray-500">
              <p>No coaching activity yet. Load calls to generate coaching timeline.</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default AgentCoaching;
