// Battery Smart SOP Data - Extracted from SOP v2.0
// This file contains the operational SOPs for call quality analysis

export const sopChecklist = {
  // SOP 1: Swap Station Failure Resolution
  swapStation: {
    id: 'BS-SOP-001-R2',
    title: 'Swap Station Failure Resolution',
    priority: 'CRITICAL',
    steps: [
      {
        id: 'SS-1',
        title: 'Immediate Data Collection',
        timeLimit: '30 seconds',
        required: true,
        actions: [
          'Ask which station customer is at',
          'Verify station ID in system',
          'Ask what happened when trying to swap',
          'Note the time it happened',
          'Get battery number if applicable',
          'Pull up station dashboard while customer speaks'
        ],
        doNot: ['Put customer on hold to search for information']
      },
      {
        id: 'SS-2',
        title: 'Classify & Act',
        timeLimit: '2-5 minutes',
        required: true,
        decisionMatrix: [
          { issue: 'No batteries available', action: 'Check nearest station with inventory → Direct customer', tat: '< 2 min' },
          { issue: 'Low SOC (60-79%)', action: 'Offer: Accept battery + ₹30 credit OR go to alt station', tat: '< 3 min' },
          { issue: 'Low SOC (< 60%)', action: 'Must escalate to L2 for ₹50 credit approval', tat: '< 5 min' },
          { issue: 'Slot stuck/won\'t open', action: 'Remote unlock attempt → Manual reset guide', tat: '< 5 min' },
          { issue: 'Station offline', action: 'Direct to alt station + log outage', tat: '< 2 min' },
          { issue: 'QR scan fails', action: 'Generate manual swap code', tat: '< 2 min' }
        ]
      },
      {
        id: 'SS-3',
        title: 'Stuck Battery Instructions',
        timeLimit: '5 minutes',
        required: true,
        vehicleInstructions: [
          'Turn vehicle completely OFF',
          'Put kickstand DOWN all the way',
          'Press and HOLD red battery release button for 5 seconds',
          'While holding, pull battery handle UP firmly',
          'If 2 attempts fail: Dispatch team, ETA 20 minutes'
        ]
      },
      {
        id: 'SS-4',
        title: 'Compensation',
        required: true,
        approvalLimits: [
          { scenario: 'No batteries at station', compensation: '₹20 credit OR 10km bonus', authority: 'Auto-approved (L1)' },
          { scenario: 'Low SOC 60-79%', compensation: '₹30 credit', authority: 'Auto-approved (L1)' },
          { scenario: 'Low SOC < 60%', compensation: '₹50 credit', authority: 'L2 approval REQUIRED' },
          { scenario: 'Stuck battery + delay > 15min', compensation: '₹100 credit + 1 free swap', authority: 'L2 approval REQUIRED' },
          { scenario: 'Station offline → trip cancelled', compensation: 'Case-by-case', authority: 'L3 ONLY' }
        ],
        criticalRule: 'Agent CANNOT promise > ₹50 without L2 approval. Violation = written warning.'
      }
    ],
    kpis: [
      { metric: 'Average Resolution Time', target: '< 4 minutes', consequence: 'Daily coaching if missed' },
      { metric: 'First Call Resolution', target: '≥ 85%', consequence: 'Performance review' },
      { metric: 'Incorrect compensation', target: '< 2%', consequence: 'Written warning' },
      { metric: 'Incomplete tickets', target: '< 5%', consequence: 'Ticket returned to agent' }
    ]
  },

  // SOP 2: Payment Failure & Refund Processing
  paymentRefund: {
    id: 'BS-SOP-002-R2',
    title: 'Payment Failure & Refund Processing',
    priority: 'HIGH',
    steps: [
      {
        id: 'PF-1',
        title: 'Verify Payment Status',
        required: true,
        requiredInfo: ['Transaction ID', 'Amount', 'Payment method', 'Date/time'],
        checkSystem: ['Success', 'Failed', 'Pending']
      },
      {
        id: 'PF-2',
        title: 'Classify & Act',
        required: true,
        decisionMatrix: [
          { issue: 'Failed + service blocked', action: 'Retry with alternate method', tat: '< 5 min' },
          { issue: 'Success but service not active', action: 'Manual activation + flag for refund audit', tat: '< 10 min' },
          { issue: 'Double charged', action: 'ESCALATE TO L2 IMMEDIATELY', tat: 'Immediate' },
          { issue: 'Amount incorrect', action: 'ESCALATE TO L2 IMMEDIATELY', tat: 'Immediate' },
          { issue: 'Pending > 24 hours', action: 'Check gateway → Cancel/retry', tat: '< 15 min' }
        ],
        criticalRule: 'L1 agents CANNOT process refunds. ALL refund requests → Escalate to L2.'
      }
    ],
    refundMatrix: [
      { reason: 'Duplicate charge', authority: 'L2 Supervisor', time: '3-5 business days' },
      { reason: 'Ghost swap (not received)', authority: 'L2 Supervisor', time: '3-5 business days' },
      { reason: 'Incorrect billing', authority: 'L2 Supervisor', time: '3-5 business days' },
      { reason: 'Subscription cancel (< 7 days)', authority: 'L2 Supervisor', time: '5-7 business days' },
      { reason: 'Subscription cancel (> 7 days)', authority: 'L3 Manager', time: '7-10 business days' },
      { reason: 'Service quality complaint', authority: 'L3 Manager', time: 'Case-by-case' }
    ],
    doNot: ['Promise immediate refund', 'Promise same-day processing']
  },

  // SOP 3: Safety & Emergency Response
  safetyEmergency: {
    id: 'BS-SOP-003-R2',
    title: 'Safety & Emergency Response',
    priority: 'EMERGENCY',
    note: 'This SOP SUPERSEDES all others when safety is at risk.',
    emergencyTypes: [
      { type: 'LEVEL 1: Fire/Smoke', indicators: 'Flames, smoke, burning smell', responseTime: 'IMMEDIATE (< 60 sec)' },
      { type: 'LEVEL 2: Severe Overheating', indicators: 'Too hot to touch, swelling', responseTime: 'IMMEDIATE (< 2 min)' },
      { type: 'LEVEL 3: Injury/Accident', indicators: 'Person injured', responseTime: 'IMMEDIATE (< 60 sec)' },
      { type: 'LEVEL 4: Battery Leaking', indicators: 'Liquid/gel visible', responseTime: 'URGENT (< 5 min)' }
    ],
    fireScript: 'This is an emergency. Please move away from the battery IMMEDIATELY - at least 10 meters. Do NOT touch it. Do NOT move it. Do NOT pour water on it. Are you safe now?',
    injuryScript: 'I understand you are injured. Have you called an ambulance? [If no] Please call 108 immediately. [If yes] Our manager will call you within 30 minutes. Your ticket number is [ID].',
    doNot: ['Give fire-fighting advice', 'End call before help arrives', 'Discuss liability', 'Promise compensation for injuries']
  }
};

// Escalation Matrix
export const escalationMatrix = [
  { category: 'Station failures', L1: 'Direct to alt station', L2: 'Field tech dispatch', L3: 'Station closure', maxTat: '30 min' },
  { category: 'Payment/Refund', L1: 'Payment retry', L2: 'Refund < ₹500', L3: 'Refund > ₹500', maxTat: '24 hrs' },
  { category: 'Safety emergency', L1: 'Emergency alert', L2: 'Safety dispatch', L3: 'Incident mgmt', maxTat: 'Immediate' },
  { category: 'Compensation', L1: 'Up to ₹50', L2: '₹51-500', L3: '> ₹500', maxTat: 'N/A' },
  { category: 'Churn risk', L1: 'Immediate escalate', L2: 'Retention offer', L3: 'Final decision', maxTat: '4 hrs' }
];

// SOP Compliance Checklist for Agent Evaluation
export const agentEvaluationChecklist = [
  { id: 1, item: 'Greeted customer properly', category: 'Opening', weight: 5 },
  { id: 2, item: 'Verified customer identity', category: 'Security', weight: 15 },
  { id: 3, item: 'Collected all required information', category: 'Data Collection', weight: 10 },
  { id: 4, item: 'Used decision matrix correctly', category: 'Problem Solving', weight: 15 },
  { id: 5, item: 'Provided correct solution within TAT', category: 'Resolution', weight: 20 },
  { id: 6, item: 'Applied correct compensation level', category: 'Compensation', weight: 15 },
  { id: 7, item: 'Documented ticket completely', category: 'Documentation', weight: 10 },
  { id: 8, item: 'Closed call with proper script', category: 'Closing', weight: 5 },
  { id: 9, item: 'Attempted upsell (if applicable)', category: 'Sales', weight: 5 }
];

// Issue Types from Spreadsheet matched to SOPs
export const issueToSopMapping = {
  'Swap Information Shared': 'BS-SOP-001-R2',
  'Penalty Information Shared': 'BS-SOP-002-R2',
  'Less Range : Complaint after 2 hour of Swap': 'BS-SOP-001-R2',
  'Less Range': 'BS-SOP-001-R2',
  'First Swap - Less Range within 2 Hours of Swap': 'BS-SOP-001-R2',
  'Meter Stolen': 'BS-SOP-003-R2',
  'Battery Issue': 'BS-SOP-001-R2',
  'Station Issue': 'BS-SOP-001-R2',
  'Payment Query': 'BS-SOP-002-R2',
  'Refund Request': 'BS-SOP-002-R2',
  'Emergency': 'BS-SOP-003-R2'
};

export default {
  sopChecklist,
  escalationMatrix,
  agentEvaluationChecklist,
  issueToSopMapping
};
