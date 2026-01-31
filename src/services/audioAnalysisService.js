// Audio Analysis Service
// Simulates AI-powered audio analysis for call recordings
// In production, this would connect to Azure Speech Services, OpenAI Whisper, or similar

// Simulated AI analysis for demo purposes
// In production, replace with actual API calls to:
// - Azure Speech Services (Speech-to-Text)
// - OpenAI Whisper (Transcription)
// - Custom sentiment analysis model
// - SOP compliance checking model

export const analyzeAudio = async (audioUrl, callId) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate realistic analysis results
  const sentiment = getRandomSentiment();
  const sopAdherence = getRandomSOPScore();
  const qaScore = calculateQAScore(sentiment, sopAdherence);
  
  return {
    callId,
    audioUrl,
    transcription: generateSampleTranscription(sentiment),
    sentiment,
    sentimentScore: getSentimentScore(sentiment),
    sopAdherence,
    sopDetails: generateSOPDetails(sopAdherence),
    qaScore,
    riskLevel: getRiskLevel(qaScore, sentiment),
    issues: generateIssues(sopAdherence, sentiment),
    summary: generateSummary(sentiment, sopAdherence),
    coachingRecommendations: generateCoaching(sopAdherence),
    analyzedAt: new Date().toISOString(),
  };
};

// Batch analyze multiple audio files
export const batchAnalyzeAudios = async (calls, onProgress) => {
  const results = [];
  
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    
    if (call.audioUrl) {
      try {
        const analysis = await analyzeAudio(call.audioUrl, call.id);
        results.push({
          ...call,
          ...analysis,
        });
      } catch (error) {
        console.error(`Error analyzing call ${call.id}:`, error);
        results.push(call);
      }
    } else {
      results.push(call);
    }
    
    // Report progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: calls.length,
        percentage: Math.round(((i + 1) / calls.length) * 100),
      });
    }
  }
  
  return results;
};

// Helper functions for generating realistic analysis data

const getRandomSentiment = () => {
  const rand = Math.random();
  if (rand < 0.6) return 'positive';
  if (rand < 0.85) return 'neutral';
  return 'negative';
};

const getSentimentScore = (sentiment) => {
  switch (sentiment) {
    case 'positive': return Math.random() * 0.3 + 0.7; // 0.7-1.0
    case 'neutral': return Math.random() * 0.3 + 0.4; // 0.4-0.7
    case 'negative': return Math.random() * 0.4; // 0-0.4
    default: return 0.5;
  }
};

const getRandomSOPScore = () => {
  // Generate realistic SOP scores with normal distribution
  const base = 75;
  const variance = 20;
  return Math.min(100, Math.max(40, Math.floor(base + (Math.random() - 0.5) * variance * 2)));
};

const calculateQAScore = (sentiment, sopAdherence) => {
  const sentimentWeight = sentiment === 'positive' ? 1.1 : sentiment === 'negative' ? 0.85 : 1;
  return Math.min(100, Math.floor(sopAdherence * sentimentWeight));
};

const getRiskLevel = (qaScore, sentiment) => {
  if (qaScore < 60 || sentiment === 'negative') return 'high';
  if (qaScore < 80) return 'medium';
  return 'low';
};

const generateSOPDetails = (sopAdherence) => {
  const steps = [
    { name: 'Greeting', completed: Math.random() > 0.1 },
    { name: 'ID Verification', completed: Math.random() > (sopAdherence < 70 ? 0.4 : 0.1) },
    { name: 'Problem Understanding', completed: Math.random() > 0.15 },
    { name: 'Solution Offering', completed: Math.random() > (sopAdherence < 80 ? 0.3 : 0.1) },
    { name: 'Upsell Attempt', completed: Math.random() > (sopAdherence < 85 ? 0.5 : 0.2) },
    { name: 'Resolution Confirmation', completed: Math.random() > 0.2 },
    { name: 'Closing', completed: Math.random() > 0.05 },
  ];
  
  return steps;
};

const generateIssues = (sopAdherence, sentiment) => {
  const issues = [];
  
  if (sopAdherence < 70) {
    issues.push('Multiple SOP steps skipped');
  }
  if (sopAdherence < 80) {
    if (Math.random() > 0.5) issues.push('ID verification not completed');
    if (Math.random() > 0.6) issues.push('Upsell opportunity missed');
  }
  if (sentiment === 'negative') {
    issues.push('Customer expressed frustration');
    if (Math.random() > 0.5) issues.push('Escalation may be required');
  }
  if (sopAdherence < 60) {
    issues.push('Resolution mismatch detected');
  }
  
  return issues;
};

const generateSummary = (sentiment, sopAdherence) => {
  const sentimentText = {
    positive: 'Customer was satisfied with the interaction.',
    neutral: 'Customer had a standard inquiry.',
    negative: 'Customer expressed dissatisfaction during the call.',
  };
  
  const sopText = sopAdherence >= 85 
    ? 'Agent followed SOP guidelines effectively.'
    : sopAdherence >= 70
    ? 'Some SOP steps were missed but overall acceptable.'
    : 'Multiple SOP violations detected. Coaching recommended.';
  
  return `${sentimentText[sentiment]} ${sopText}`;
};

const generateCoaching = (sopAdherence) => {
  const recommendations = [];
  
  if (sopAdherence < 85) {
    recommendations.push('Review SOP checklist before calls');
  }
  if (sopAdherence < 75) {
    recommendations.push('Focus on customer verification steps');
    recommendations.push('Practice upselling techniques');
  }
  if (sopAdherence < 60) {
    recommendations.push('Schedule 1-on-1 coaching session');
    recommendations.push('Shadow high-performing agents');
  }
  
  return recommendations.length > 0 ? recommendations : ['Keep up the good work!'];
};

const generateSampleTranscription = (sentiment) => {
  const positive = `
Agent: Good morning! Thank you for calling Battery Smart. How may I help you today?
Customer: Hi, I need to know about battery swap availability.
Agent: Of course! I can help you with that. May I have your registered mobile number for verification?
Customer: Sure, it's 9876543210.
Agent: Thank you. I can see you're registered in Delhi. The nearest swap station is 500m from your location with 5 batteries available.
Customer: That's great! Thank you so much.
Agent: You're welcome! Is there anything else I can help you with? We also have a premium plan that offers priority swaps.
Customer: I'll think about it. Thanks again!
Agent: Thank you for choosing Battery Smart. Have a great day!
  `.trim();

  const neutral = `
Agent: Hello, Battery Smart customer support. How can I assist you?
Customer: I have a question about my billing.
Agent: Sure, let me pull up your account. Can you provide your phone number?
Customer: It's 9876543210.
Agent: I see your account. What's your billing question?
Customer: Why was I charged extra this month?
Agent: Let me check... I see there was an overage charge for additional swaps. 
Customer: Oh, I didn't realize that.
Agent: Would you like me to explain the pricing structure?
Customer: No, that's fine. Thanks.
Agent: Alright. Have a good day.
  `.trim();

  const negative = `
Agent: Hello, Battery Smart.
Customer: I've been waiting for 20 minutes! This is ridiculous!
Agent: I apologize for the wait. How can I help?
Customer: My battery swap failed and I'm stuck!
Agent: Let me check... Can you tell me your location?
Customer: I'm at the MG Road station. This is the third time this month!
Agent: I understand your frustration. Let me see what's happening.
Customer: I want to cancel my subscription!
Agent: Let me connect you with our retention team.
Customer: Fine, but this better be resolved quickly!
  `.trim();

  return sentiment === 'positive' ? positive : sentiment === 'negative' ? negative : neutral;
};

// Export analysis to downloadable format
export const exportAnalysisReport = (analyses) => {
  return analyses.map(a => ({
    'Call ID': a.callId,
    'Agent': a.agent,
    'City': a.city,
    'Date': a.callDate,
    'Duration': a.duration,
    'Sentiment': a.sentiment,
    'SOP Adherence': `${a.sopAdherence}%`,
    'QA Score': a.qaScore,
    'Risk Level': a.riskLevel,
    'Issues': a.issues?.join('; ') || 'None',
    'Summary': a.summary,
    'Coaching': a.coachingRecommendations?.join('; ') || 'N/A',
  }));
};
