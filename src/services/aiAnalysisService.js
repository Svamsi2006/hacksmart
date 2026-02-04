// AI Analysis Service - DistilBERT + Grok + Gemini with Fallback
// Uses DistilBERT (Hugging Face) as primary, Grok and Gemini as fallbacks

import { analyzeCallWithDistilBERT } from './distilbertService';

const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Analyze transcript using DistilBERT (Hugging Face) - PRIMARY
 */
export const analyzeWithDistilBERT = async (transcript, callContext = {}) => {
  try {
    console.log('🤖 Analyzing with DistilBERT (Hugging Face)...');
    const result = await analyzeCallWithDistilBERT(transcript);
    
    if (!result.success) {
      throw new Error(result.error || 'DistilBERT analysis failed');
    }
    
    // Transform DistilBERT result to standard format
    return {
      sentiment: result.sentiment?.label || 'neutral',
      sentimentScore: (result.sentiment?.confidence || 50) / 100,
      sopAdherence: calculateSOPFromDistilBERT(result),
      qaScore: calculateQAFromDistilBERT(result),
      riskLevel: result.category?.category?.includes('stolen') || 
                 result.category?.category?.includes('dispute') ||
                 result.sentiment?.label === 'negative' ? 'high' :
                 result.sentiment?.label === 'neutral' ? 'medium' : 'low',
      summary: result.summary?.summary || 'Call analyzed successfully',
      issues: extractIssuesFromDistilBERT(result),
      emotion: result.emotion?.emotion || 'neutral',
      emotionScore: result.emotion?.confidence || 50,
      category: result.category?.category || 'general inquiry',
      categoryConfidence: result.category?.confidence || 50,
      entities: result.entities || {},
      success: true,
      aiProvider: 'distilbert',
      model: 'DistilBERT (Hugging Face)',
      analyzedAt: result.analyzedAt
    };
  } catch (error) {
    console.error('DistilBERT analysis failed:', error);
    throw error;
  }
};

// Helper functions for DistilBERT analysis
const calculateSOPFromDistilBERT = (result) => {
  let score = 70;
  if (result.sentiment?.label === 'positive') score += 15;
  else if (result.sentiment?.label === 'negative') score -= 10;
  if (result.sentiment?.confidence > 80) score += 5;
  if (result.category?.confidence > 70) score += 10;
  if (result.emotion?.emotion === 'joy') score += 5;
  else if (result.emotion?.emotion === 'anger') score -= 10;
  return Math.min(100, Math.max(0, Math.round(score)));
};

const calculateQAFromDistilBERT = (result) => {
  let score = 75;
  if (result.sentiment?.label === 'positive') score += 10;
  else if (result.sentiment?.label === 'negative') score -= 15;
  if (result.category?.confidence > 80) score += 5;
  if (result.emotion?.emotion === 'joy' || result.emotion?.emotion === 'surprise') score += 5;
  else if (result.emotion?.emotion === 'anger' || result.emotion?.emotion === 'disgust') score -= 10;
  return Math.min(100, Math.max(0, Math.round(score)));
};

const extractIssuesFromDistilBERT = (result) => {
  const issues = [];
  if (result.sentiment?.label === 'negative') {
    issues.push('Customer expressed dissatisfaction');
  }
  if (result.emotion?.emotion === 'anger') {
    issues.push('Customer showed signs of frustration');
  }
  if (result.category?.category?.includes('dispute')) {
    issues.push('Dispute or complaint detected');
  }
  if (result.category?.category?.includes('stolen')) {
    issues.push('Equipment theft reported');
  }
  return issues.length > 0 ? issues : ['No major issues detected'];
};

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
 * Main analysis function with fallback chain
 * Tries DistilBERT first, then Grok, then Gemini
 */
export const analyzeTranscript = async (transcript, callContext = {}) => {
  // Try DistilBERT first (fastest, free)
  try {
    console.log('🤖 Attempting DistilBERT analysis (Hugging Face)...');
    const result = await analyzeWithDistilBERT(transcript, callContext);
    console.log('✅ DistilBERT analysis successful');
    return result;
  } catch (distilbertError) {
    console.warn('⚠️ DistilBERT failed, trying Grok...', distilbertError.message);
    
    // Try Grok second
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
        console.error('❌ All AI providers failed:', geminiError.message);
        
        // Return fallback analysis
        return generateFallbackAnalysis(transcript);
      }
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
  
  // Generate summary DIRECTLY from actual transcript content
  const generateSummaryFromText = (content) => {
    // Clean and prepare the text
    const cleanText = content.replace(/\s+/g, ' ').trim();
    
    // Remove speaker labels and extract actual conversation
    const conversationText = cleanText
      .replace(/^(Agent|Customer|Speaker\s*\d*|Rep|Caller|Support|User)[\s:]+/gim, '')
      .trim();
    
    // Use actual conversation content (up to 350 chars)
    if (conversationText.length > 350) {
      // Find a good breakpoint
      const breakPoint = conversationText.substring(0, 400).lastIndexOf('.');
      return conversationText.substring(0, breakPoint > 200 ? breakPoint + 1 : 350).trim();
    }
    return conversationText;
  };
  
  return {
    sentiment,
    sentimentScore: Math.max(0, Math.min(1, sentimentScore)),
    sopAdherence: 75,
    qaScore: 75,
    riskLevel: sentiment === 'negative' ? 'high' : 'medium',
    summary: generateSummaryFromText(text),
    issues: negativeCount > 0 ? ['Potential customer dissatisfaction detected'] : [],
    sopDetails: generateDefaultSOPDetails(),
    coachingRecommendations: ['Review call handling procedures'],
    keyMoments: [],
    customerSatisfaction: sentiment === 'positive' ? 'satisfied' : sentiment === 'negative' ? 'dissatisfied' : 'neutral',
    escalationNeeded: negativeCount >= 2,
    revenueImpact: 'neutral',
    analyzedAt: new Date().toISOString(),
    originalTranscription: text
  };
};

/**
 * Generate fallback analysis when both AIs fail
 */
const generateFallbackAnalysis = (transcript) => {
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
  
  // Generate summary DIRECTLY from actual transcript content
  const generateSummaryFromTranscript = (text) => {
    // Clean and prepare the text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Remove speaker labels and extract actual conversation
    const conversationText = cleanText
      .replace(/^(Agent|Customer|Speaker\s*\d*|Rep|Caller|Support|User)[\s:]+/gim, '')
      .trim();
    
    // Use actual conversation content (up to 400 chars)
    if (conversationText.length > 400) {
      // Find a good breakpoint at sentence end
      const breakPoint = conversationText.substring(0, 450).lastIndexOf('.');
      return conversationText.substring(0, breakPoint > 200 ? breakPoint + 1 : 400).trim();
    }
    return conversationText;
  };
  
  return {
    sentiment,
    sentimentScore: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.3 : 0.5,
    sopAdherence: qaScore,
    qaScore,
    riskLevel: sentiment === 'negative' ? 'high' : 'low',
    summary: generateSummaryFromTranscript(transcript),
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
