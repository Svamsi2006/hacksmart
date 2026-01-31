// Mock data for Smart-Audit AI Dashboard

export const kpiData = {
  totalCalls: 12480,
  avgQAScore: 78.6,
  highRiskCalls: 214,
  revenueSaved: 340000,
  trend: {
    calls: 8.4,
    qaScore: 2.3,
    risk: -5.2,
    revenue: 12.6
  }
};

export const dailyTrend = [
  { date: 'Jan 17', score: 76.2 },
  { date: 'Jan 18', score: 77.8 },
  { date: 'Jan 19', score: 75.4 },
  { date: 'Jan 20', score: 78.1 },
  { date: 'Jan 21', score: 79.3 },
  { date: 'Jan 22', score: 77.6 },
  { date: 'Jan 23', score: 78.9 },
  { date: 'Jan 24', score: 80.2 },
  { date: 'Jan 25', score: 78.4 },
  { date: 'Jan 26', score: 79.7 },
  { date: 'Jan 27', score: 77.9 },
  { date: 'Jan 28', score: 78.6 },
  { date: 'Jan 29', score: 79.2 },
  { date: 'Jan 30', score: 78.6 },
];

export const callQuality = [
  { category: 'Good', count: 8900, color: '#10B981' },
  { category: 'At-Risk', count: 2800, color: '#F59E0B' },
  { category: 'Critical', count: 780, color: '#EF4444' },
];

export const sentimentData = [
  { name: 'Positive', value: 62, color: '#10B981' },
  { name: 'Neutral', value: 28, color: '#F59E0B' },
  { name: 'Negative', value: 10, color: '#EF4444' },
];

export const liveCalls = [
  {
    id: 'CALL-8473',
    agent: 'Priya Sharma',
    city: 'Delhi',
    sentiment: 'positive',
    sopAdherence: 92,
    riskLevel: 'low',
    summary: 'Customer inquiry about battery swap. Agent followed all SOP steps correctly.',
    issues: [],
    action: 'No action needed'
  },
  {
    id: 'CALL-8474',
    agent: 'Rahul Kumar',
    city: 'Bangalore',
    sentiment: 'neutral',
    sopAdherence: 78,
    riskLevel: 'medium',
    summary: 'Payment issue resolution. Skipped verification step.',
    issues: ['ID verification skipped', 'Payment plan not explained clearly'],
    action: 'Send micro-coaching on verification protocol'
  },
  {
    id: 'CALL-8475',
    agent: 'Anjali Patel',
    city: 'Pune',
    sentiment: 'negative',
    sopAdherence: 54,
    riskLevel: 'high',
    summary: 'Angry customer. Multiple SOP violations detected.',
    issues: ['No empathy shown', 'Incorrect pricing info', 'Failed to escalate'],
    action: 'Immediate supervisor intervention required'
  },
  {
    id: 'CALL-8476',
    agent: 'Vikram Singh',
    city: 'Delhi',
    sentiment: 'positive',
    sopAdherence: 95,
    riskLevel: 'low',
    summary: 'Battery upgrade upsell successful. Excellent adherence.',
    issues: [],
    action: 'No action needed'
  },
  {
    id: 'CALL-8477',
    agent: 'Neha Gupta',
    city: 'Hyderabad',
    sentiment: 'neutral',
    sopAdherence: 82,
    riskLevel: 'low',
    summary: 'Station location query. Good resolution.',
    issues: [],
    action: 'No action needed'
  },
  {
    id: 'CALL-8478',
    agent: 'Amit Verma',
    city: 'Bangalore',
    sentiment: 'negative',
    sopAdherence: 61,
    riskLevel: 'high',
    summary: 'Service complaint. Missed upsell opportunity.',
    issues: ['Did not offer upgrade', 'Resolution mismatch'],
    action: 'Revenue recovery coaching needed'
  },
  {
    id: 'CALL-8479',
    agent: 'Sneha Reddy',
    city: 'Delhi',
    sentiment: 'positive',
    sopAdherence: 88,
    riskLevel: 'low',
    summary: 'Plan change request handled well.',
    issues: [],
    action: 'No action needed'
  },
  {
    id: 'CALL-8480',
    agent: 'Karan Mehta',
    city: 'Pune',
    sentiment: 'neutral',
    sopAdherence: 75,
    riskLevel: 'medium',
    summary: 'Technical issue. Average handling.',
    issues: ['Long hold time', 'Partial resolution'],
    action: 'Monitor next 3 calls'
  },
];

export const agentLeaderboard = [
  { name: 'Rahul Kumar', qaScore: 94.2, city: 'Bangalore', calls: 156, avatar: 'RK' },
  { name: 'Priya Sharma', qaScore: 92.8, city: 'Delhi', calls: 189, avatar: 'PS' },
  { name: 'Vikram Singh', qaScore: 91.5, city: 'Delhi', calls: 142, avatar: 'VS' },
  { name: 'Sneha Reddy', qaScore: 89.7, city: 'Hyderabad', calls: 178, avatar: 'SR' },
  { name: 'Anjali Patel', qaScore: 87.3, city: 'Pune', calls: 134, avatar: 'AP' },
  { name: 'Neha Gupta', qaScore: 85.9, city: 'Hyderabad', calls: 167, avatar: 'NG' },
  { name: 'Karan Mehta', qaScore: 83.4, city: 'Pune', calls: 145, avatar: 'KM' },
  { name: 'Amit Verma', qaScore: 81.2, city: 'Bangalore', calls: 128, avatar: 'AV' },
];

export const sopHeatmap = [
  { step: 'Greeting', issues: 12 },
  { step: 'ID Verification', issues: 45 },
  { step: 'Problem Understanding', issues: 23 },
  { step: 'Solution Offering', issues: 67 },
  { step: 'Upsell Attempt', issues: 89 },
  { step: 'Resolution Confirmation', issues: 34 },
  { step: 'Closing', issues: 18 },
];

export const revenueLeakage = {
  total: 342000,
  byCity: [
    { city: 'Delhi', amount: 85000, cases: 34 },
    { city: 'Bangalore', amount: 98000, cases: 42 },
    { city: 'Pune', amount: 67000, cases: 28 },
    { city: 'Hyderabad', amount: 92000, cases: 38 },
  ],
  categories: [
    { type: 'Missed Upsells', amount: 156000, percentage: 45.6 },
    { type: 'Incorrect Plans', amount: 98000, percentage: 28.7 },
    { type: 'Payment Errors', amount: 88000, percentage: 25.7 },
  ]
};

export const revenueAlerts = [
  {
    id: 'REV-001',
    agent: 'Amit Verma',
    issue: 'Missed battery upgrade suggestion',
    callId: 'CALL-8234',
    potentialLoss: 2500,
    severity: 'high'
  },
  {
    id: 'REV-002',
    agent: 'Karan Mehta',
    issue: 'Incorrect pricing communicated',
    callId: 'CALL-8156',
    potentialLoss: 1800,
    severity: 'medium'
  },
  {
    id: 'REV-003',
    agent: 'Anjali Patel',
    issue: 'Did not mention premium plan benefits',
    callId: 'CALL-8189',
    potentialLoss: 3200,
    severity: 'high'
  },
];

export const agentsCoaching = [
  {
    name: 'Amit Verma',
    avatar: 'AV',
    qaScore: 81.2,
    status: 'needs-attention',
    coachingThemes: ['Upselling techniques', 'Pricing accuracy', 'Active listening'],
    recentNudges: [
      { time: '10:30 AM', message: 'Remember to verify customer eligibility for upgrades' },
      { time: '2:15 PM', message: 'Great job on that last call! Keep it up.' },
    ]
  },
  {
    name: 'Karan Mehta',
    avatar: 'KM',
    qaScore: 83.4,
    status: 'improving',
    coachingThemes: ['Hold time reduction', 'Technical troubleshooting', 'First call resolution'],
    recentNudges: [
      { time: '9:45 AM', message: 'Your response time has improved by 15% this week!' },
    ]
  },
  {
    name: 'Anjali Patel',
    avatar: 'AP',
    qaScore: 87.3,
    status: 'improving',
    coachingThemes: ['Empathy building', 'Escalation handling', 'Follow-up protocols'],
    recentNudges: [
      { time: '11:20 AM', message: 'Remember to show empathy in angry customer scenarios' },
      { time: '3:30 PM', message: 'Excellent escalation handling on CALL-8475!' },
    ]
  },
  {
    name: 'Rahul Kumar',
    avatar: 'RK',
    qaScore: 94.2,
    status: 'high-performer',
    coachingThemes: ['Leadership skills', 'Mentoring peers', 'Advanced de-escalation'],
    recentNudges: [
      { time: '1:00 PM', message: 'Top performer of the day! 🌟' },
    ]
  },
];

export const cityInsights = [
  {
    city: 'Delhi',
    avgQAScore: 82.4,
    escalationRate: 4.2,
    topIssues: ['Battery swap timing', 'Station availability', 'Payment queries'],
    callVolume: 3240,
    companyAvg: 78.6,
    coords: { x: 48, y: 35 }
  },
  {
    city: 'Bangalore',
    avgQAScore: 79.8,
    escalationRate: 5.8,
    topIssues: ['Technical issues', 'App problems', 'Billing disputes'],
    callVolume: 4180,
    companyAvg: 78.6,
    coords: { x: 52, y: 65 }
  },
  {
    city: 'Pune',
    avgQAScore: 76.2,
    escalationRate: 6.1,
    topIssues: ['Service delays', 'Battery quality', 'Location issues'],
    callVolume: 2890,
    companyAvg: 78.6,
    coords: { x: 48, y: 58 }
  },
  {
    city: 'Hyderabad',
    avgQAScore: 77.9,
    escalationRate: 5.3,
    topIssues: ['Plan upgrades', 'Pricing queries', 'Station access'],
    callVolume: 3170,
    companyAvg: 78.6,
    coords: { x: 54, y: 60 }
  },
];

export const supervisorAlerts = [
  {
    id: 'ALERT-001',
    priority: 'critical',
    callId: 'CALL-8475',
    agent: 'Anjali Patel',
    timestamp: '2:34 PM',
    summary: 'Angry customer with multiple SOP violations. No empathy shown, incorrect pricing provided.',
    reason: 'Compliance risk + Customer satisfaction threat',
    sentiment: 'negative',
    sopScore: 54
  },
  {
    id: 'ALERT-002',
    priority: 'critical',
    callId: 'CALL-8478',
    agent: 'Amit Verma',
    timestamp: '2:28 PM',
    summary: 'Service complaint with missed ₹3,200 upsell opportunity. Resolution mismatch detected.',
    reason: 'Revenue leakage + Poor resolution quality',
    sentiment: 'negative',
    sopScore: 61
  },
  {
    id: 'ALERT-003',
    priority: 'high',
    callId: 'CALL-8474',
    agent: 'Rahul Kumar',
    timestamp: '2:15 PM',
    summary: 'Payment issue with skipped ID verification step. Security protocol violation.',
    reason: 'Compliance risk',
    sentiment: 'neutral',
    sopScore: 78
  },
  {
    id: 'ALERT-004',
    priority: 'high',
    callId: 'CALL-8412',
    agent: 'Karan Mehta',
    timestamp: '1:52 PM',
    summary: 'Technical escalation with 8-minute hold time. Customer expressed frustration.',
    reason: 'Long hold + Escalation needed',
    sentiment: 'neutral',
    sopScore: 72
  },
  {
    id: 'ALERT-005',
    priority: 'medium',
    callId: 'CALL-8389',
    agent: 'Neha Gupta',
    timestamp: '1:20 PM',
    summary: 'Plan change request with incomplete documentation. Follow-up required.',
    reason: 'Documentation incomplete',
    sentiment: 'neutral',
    sopScore: 81
  },
];
