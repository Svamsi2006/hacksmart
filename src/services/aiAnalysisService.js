// AI Analysis Service - Grok + Gemini with Fallback
// Uses xAI Grok as primary, Google Gemini as fallback

const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Analyze transcript using Grok API (xAI)
 */
export const analyzeWithGrok = async (transcript, callContext = {}) => {
  try {
    const prompt = buildAnalysisPrompt(transcript, callContext);
    
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: `You are an expert call center QA analyst for Battery Smart, an EV battery swapping company in India. 
Analyze call transcripts and provide detailed quality assessments.
Always respond in valid JSON format with the exact structure requested.
Be fair but thorough in your analysis. Focus on customer satisfaction and SOP adherence.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error:', response.status, errorText);
      throw new Error(`Grok API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from Grok');
    }

    return parseAIResponse(content, 'grok');
    
  } catch (error) {
    console.error('Grok analysis failed:', error);
    throw error;
  }
};

/**
 * Analyze transcript using Gemini API (Google)
 */
export const analyzeWithGemini = async (transcript, callContext = {}) => {
  try {
    const prompt = buildAnalysisPrompt(transcript, callContext);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert call center QA analyst for Battery Smart, an EV battery swapping company in India.
Analyze call transcripts and provide detailed quality assessments.
Always respond in valid JSON format with the exact structure requested.
Be fair but thorough in your analysis.

${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('Empty response from Gemini');
    }

    return parseAIResponse(content, 'gemini');
    
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    throw error;
  }
};

/**
 * Main analysis function with fallback
 * Tries Grok first, falls back to Gemini if Grok fails
 */
export const analyzeTranscript = async (transcript, callContext = {}) => {
  // Try Grok first
  try {
    console.log('🤖 Analyzing with Grok (xAI)...');
    const result = await analyzeWithGrok(transcript, callContext);
    result.aiProvider = 'grok';
    console.log('✅ Grok analysis successful');
    return result;
  } catch (grokError) {
    console.warn('⚠️ Grok failed, trying Gemini fallback...', grokError.message);
    
    // Fallback to Gemini
    try {
      console.log('🤖 Analyzing with Gemini...');
      const result = await analyzeWithGemini(transcript, callContext);
      result.aiProvider = 'gemini';
      console.log('✅ Gemini analysis successful');
      return result;
    } catch (geminiError) {
      console.error('❌ Both AI providers failed:', geminiError.message);
      
      // Return fallback analysis
      return generateFallbackAnalysis(transcript);
    }
  }
};

/**
 * Analyze with Gemini first, Grok as fallback (alternate mode)
 */
export const analyzeTranscriptGeminiFirst = async (transcript, callContext = {}) => {
  // Try Gemini first
  try {
    console.log('🤖 Analyzing with Gemini...');
    const result = await analyzeWithGemini(transcript, callContext);
    result.aiProvider = 'gemini';
    console.log('✅ Gemini analysis successful');
    return result;
  } catch (geminiError) {
    console.warn('⚠️ Gemini failed, trying Grok fallback...', geminiError.message);
    
    // Fallback to Grok
    try {
      console.log('🤖 Analyzing with Grok (xAI)...');
      const result = await analyzeWithGrok(transcript, callContext);
      result.aiProvider = 'grok';
      console.log('✅ Grok analysis successful');
      return result;
    } catch (grokError) {
      console.error('❌ Both AI providers failed:', grokError.message);
      
      // Return fallback analysis
      return generateFallbackAnalysis(transcript);
    }
  }
};

/**
 * Build the analysis prompt
 */
const buildAnalysisPrompt = (transcript, callContext) => {
  const contextInfo = callContext.agent ? `Agent: ${callContext.agent}` : '';
  const issueInfo = callContext.issueType ? `Issue Type: ${callContext.issueType}` : '';
  
  return `Analyze this customer service call transcript from Battery Smart (EV battery swapping company in India).

${contextInfo}
${issueInfo}

TRANSCRIPT:
${transcript}

Provide a comprehensive analysis in the following JSON format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "sentimentScore": 0.0-1.0,
  "sopAdherence": 0-100,
  "qaScore": 0-100,
  "riskLevel": "low" | "medium" | "high",
  "summary": "One sentence summary of the call",
  "issues": ["List of any issues or problems identified"],
  "sopDetails": [
    {"name": "Greeting", "completed": true/false},
    {"name": "Customer Verification", "completed": true/false},
    {"name": "Problem Understanding", "completed": true/false},
    {"name": "Solution Provided", "completed": true/false},
    {"name": "Resolution Confirmation", "completed": true/false},
    {"name": "Closing", "completed": true/false}
  ],
  "coachingRecommendations": ["List of coaching suggestions for the agent"],
  "keyMoments": ["Important moments or quotes from the call"],
  "customerSatisfaction": "satisfied" | "neutral" | "dissatisfied",
  "escalationNeeded": true/false,
  "revenueImpact": "positive" | "neutral" | "negative"
}

Respond ONLY with the JSON object, no additional text.`;
};

/**
 * Parse AI response and extract JSON
 */
const parseAIResponse = (content, provider) => {
  try {
    // Try to extract JSON from the response
    let jsonStr = content;
    
    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Clean up the string
    jsonStr = jsonStr.trim();
    
    // Parse JSON
    const parsed = JSON.parse(jsonStr);
    
    // Ensure all required fields exist
    return {
      sentiment: parsed.sentiment || 'neutral',
      sentimentScore: parsed.sentimentScore || 0.5,
      sopAdherence: parsed.sopAdherence || 75,
      qaScore: parsed.qaScore || 75,
      riskLevel: parsed.riskLevel || 'medium',
      summary: parsed.summary || 'Call analyzed successfully.',
      issues: parsed.issues || [],
      sopDetails: parsed.sopDetails || generateDefaultSOPDetails(),
      coachingRecommendations: parsed.coachingRecommendations || [],
      keyMoments: parsed.keyMoments || [],
      customerSatisfaction: parsed.customerSatisfaction || 'neutral',
      escalationNeeded: parsed.escalationNeeded || false,
      revenueImpact: parsed.revenueImpact || 'neutral',
      analyzedAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error(`Failed to parse ${provider} response:`, error);
    console.log('Raw content:', content);
    
    // Return a basic analysis based on keyword detection
    return generateKeywordBasedAnalysis(content);
  }
};

/**
 * Generate keyword-based analysis when JSON parsing fails
 */
const generateKeywordBasedAnalysis = (text) => {
  const lowerText = text.toLowerCase();
  
  // Detect sentiment from keywords
  const positiveWords = ['satisfied', 'happy', 'thank', 'great', 'excellent', 'resolved', 'helpful'];
  const negativeWords = ['angry', 'frustrated', 'complaint', 'issue', 'problem', 'dissatisfied', 'escalate'];
  
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
  
  let sentiment = 'neutral';
  let sentimentScore = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    sentimentScore = 0.7 + (positiveCount * 0.05);
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    sentimentScore = 0.3 - (negativeCount * 0.05);
  }
  
  return {
    sentiment,
    sentimentScore: Math.max(0, Math.min(1, sentimentScore)),
    sopAdherence: 75,
    qaScore: 75,
    riskLevel: sentiment === 'negative' ? 'high' : 'medium',
    summary: 'Call analyzed using keyword detection.',
    issues: negativeCount > 0 ? ['Potential customer dissatisfaction detected'] : [],
    sopDetails: generateDefaultSOPDetails(),
    coachingRecommendations: ['Review call handling procedures'],
    keyMoments: [],
    customerSatisfaction: sentiment === 'positive' ? 'satisfied' : sentiment === 'negative' ? 'dissatisfied' : 'neutral',
    escalationNeeded: negativeCount >= 2,
    revenueImpact: 'neutral',
    analyzedAt: new Date().toISOString(),
  };
};

/**
 * Generate fallback analysis when both AIs fail
 */
const generateFallbackAnalysis = (transcript) => {
  const wordCount = transcript.split(/\s+/).length;
  const hasNegativeIndicators = /angry|frustrated|complaint|cancel|refund|terrible|worst/i.test(transcript);
  const hasPositiveIndicators = /thank|great|excellent|helpful|appreciate|wonderful/i.test(transcript);
  
  let sentiment = 'neutral';
  let qaScore = 75;
  
  if (hasPositiveIndicators && !hasNegativeIndicators) {
    sentiment = 'positive';
    qaScore = 85;
  } else if (hasNegativeIndicators) {
    sentiment = 'negative';
    qaScore = 60;
  }
  
  return {
    sentiment,
    sentimentScore: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.3 : 0.5,
    sopAdherence: qaScore,
    qaScore,
    riskLevel: sentiment === 'negative' ? 'high' : 'low',
    summary: `Call with ${wordCount} words analyzed. ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} customer interaction.`,
    issues: hasNegativeIndicators ? ['Customer frustration detected'] : [],
    sopDetails: generateDefaultSOPDetails(),
    coachingRecommendations: qaScore < 70 ? ['Review call handling best practices'] : ['Keep up the good work!'],
    keyMoments: [],
    customerSatisfaction: sentiment === 'positive' ? 'satisfied' : sentiment === 'negative' ? 'dissatisfied' : 'neutral',
    escalationNeeded: hasNegativeIndicators,
    revenueImpact: 'neutral',
    analyzedAt: new Date().toISOString(),
    aiProvider: 'fallback',
  };
};

/**
 * Generate default SOP details
 */
const generateDefaultSOPDetails = () => [
  { name: 'Greeting', completed: true },
  { name: 'Customer Verification', completed: true },
  { name: 'Problem Understanding', completed: true },
  { name: 'Solution Provided', completed: true },
  { name: 'Resolution Confirmation', completed: true },
  { name: 'Closing', completed: true },
];

/**
 * Test AI connectivity
 */
export const testAIConnections = async () => {
  const results = {
    grok: { available: false, error: null },
    gemini: { available: false, error: null },
  };
  
  // Test Grok
  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: 'Say "OK" if you can hear me.' }],
        max_tokens: 10
      }),
    });
    
    if (response.ok) {
      results.grok.available = true;
    } else {
      results.grok.error = `HTTP ${response.status}`;
    }
  } catch (error) {
    results.grok.error = error.message;
  }
  
  // Test Gemini
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "OK" if you can hear me.' }] }],
        generationConfig: { maxOutputTokens: 10 }
      }),
    });
    
    if (response.ok) {
      results.gemini.available = true;
    } else {
      results.gemini.error = `HTTP ${response.status}`;
    }
  } catch (error) {
    results.gemini.error = error.message;
  }
  
  return results;
};

export default {
  analyzeTranscript,
  analyzeTranscriptGeminiFirst,
  analyzeWithGrok,
  analyzeWithGemini,
  testAIConnections,
};
