// DistilBERT Integration via Hugging Face Inference API
// Free tier: 30,000 requests/month
// Models: Sentiment, Classification, Emotion Detection

const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models';

// Debug logging
const DEBUG = true;
const log = (...args) => DEBUG && console.log('🔮 [DistilBERT]', ...args);
const logError = (...args) => console.error('❌ [DistilBERT Error]', ...args);

// Check API key on load
if (!HF_API_KEY) {
  console.warn('⚠️ VITE_HUGGINGFACE_API_KEY not found! DistilBERT analysis will use fallback mode.');
}

// ============================================
// HELPER: Make API call with retries
// ============================================
const callHuggingFaceAPI = async (model, payload, retries = 2) => {
  const url = `${HF_API_URL}/${model}`;
  
  log(`Calling ${model}...`);
  
  if (!HF_API_KEY) {
    throw new Error('No API key configured');
  }
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      // Check if model is loading
      if (data.error && data.error.includes('loading')) {
        log(`Model ${model} is loading, waiting 15s...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      
      // Check for other errors
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
      }
      
      log(`${model} response:`, data);
      return data;
      
    } catch (error) {
      logError(`Attempt ${attempt + 1} failed for ${model}:`, error.message);
      if (attempt === retries) throw error;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

// ============================================
// SENTIMENT ANALYSIS (DistilBERT SST-2)
// ============================================
export const analyzeSentiment = async (text) => {
  if (!text || text.length < 5) {
    return { label: 'neutral', confidence: 50, error: 'Text too short', isDefault: true };
  }

  try {
    const result = await callHuggingFaceAPI(
      'distilbert-base-uncased-finetuned-sst-2-english',
      { inputs: text.substring(0, 512) }
    );
    
    // Result: [[{label: "POSITIVE", score: 0.95}, {label: "NEGATIVE", score: 0.05}]]
    const predictions = Array.isArray(result[0]) ? result[0] : result;
    
    if (!predictions || predictions.length === 0) {
      throw new Error('Empty predictions');
    }
    
    // Find highest scoring sentiment
    const sorted = [...predictions].sort((a, b) => b.score - a.score);
    const top = sorted[0];
    
    const label = top.label?.toUpperCase() === 'POSITIVE' ? 'positive' : 
                  top.label?.toUpperCase() === 'NEGATIVE' ? 'negative' : 'neutral';
    
    log(`Sentiment result: ${label} (${Math.round(top.score * 100)}%)`);
    
    return {
      label,
      confidence: Math.round(top.score * 100),
      allResults: sorted.map(p => ({ label: p.label, score: Math.round(p.score * 100) })),
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      isDefault: false
    };
  } catch (error) {
    logError('Sentiment analysis failed:', error.message);
    // Return intelligent fallback based on text content
    return analyzeSentimentFallback(text);
  }
};

// Fallback sentiment analysis using keyword matching
const analyzeSentimentFallback = (text) => {
  const lower = text.toLowerCase();
  
  const positiveWords = ['thank', 'thanks', 'great', 'good', 'excellent', 'happy', 'satisfied', 'helpful', 'resolved', 'appreciate', 'perfect', 'awesome', 'wonderful'];
  const negativeWords = ['angry', 'upset', 'frustrated', 'complaint', 'stolen', 'theft', 'problem', 'issue', 'not working', 'failed', 'terrible', 'worst', 'disappointed', 'furious', 'hate', 'bad', 'poor'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lower.includes(word)) positiveScore += 15;
  });
  
  negativeWords.forEach(word => {
    if (lower.includes(word)) negativeScore += 15;
  });
  
  // Check for specific issue types
  if (lower.includes('stolen') || lower.includes('theft') || lower.includes('meter stolen')) {
    negativeScore += 30;
  }
  if (lower.includes('less range') || lower.includes('battery not') || lower.includes('complaint')) {
    negativeScore += 25;
  }
  if (lower.includes('penalty') || lower.includes('dispute')) {
    negativeScore += 20;
  }
  if (lower.includes('swap information') || lower.includes('subscription inquiry')) {
    positiveScore += 10;
  }
  
  const total = positiveScore + negativeScore;
  let label = 'neutral';
  let confidence = 60;
  
  if (total > 0) {
    if (positiveScore > negativeScore) {
      label = 'positive';
      confidence = Math.min(95, 50 + positiveScore);
    } else if (negativeScore > positiveScore) {
      label = 'negative';
      confidence = Math.min(95, 50 + negativeScore);
    }
  }
  
  log(`Fallback sentiment: ${label} (${confidence}%)`);
  
  return {
    label,
    confidence,
    model: 'keyword-fallback',
    isDefault: true
  };
};

// ============================================
// TEXT CLASSIFICATION (Zero-shot BART-MNLI)
// ============================================
export const classifyCallType = async (text) => {
  if (!text || text.length < 10) {
    return { category: 'general inquiry', confidence: 50, error: 'Text too short', isDefault: true };
  }

  const candidateLabels = [
    'battery range complaint',
    'penalty dispute',
    'swap issue',
    'payment query',
    'technical fault',
    'meter or equipment stolen',
    'subscription inquiry',
    'general information request'
  ];

  try {
    const result = await callHuggingFaceAPI(
      'facebook/bart-large-mnli',
      {
        inputs: text.substring(0, 1000),
        parameters: { candidate_labels: candidateLabels }
      }
    );
    
    if (!result.labels || result.labels.length === 0) {
      throw new Error('No classification results');
    }
    
    log(`Classification: ${result.labels[0]} (${Math.round(result.scores[0] * 100)}%)`);
    
    return {
      category: result.labels[0],
      confidence: Math.round(result.scores[0] * 100),
      allCategories: result.labels.slice(0, 5).map((label, i) => ({
        label,
        score: Math.round(result.scores[i] * 100)
      })),
      model: 'facebook/bart-large-mnli',
      isDefault: false
    };
  } catch (error) {
    logError('Classification failed:', error.message);
    return classifyCallTypeFallback(text);
  }
};

// Fallback classification using keyword matching
const classifyCallTypeFallback = (text) => {
  const lower = text.toLowerCase();
  
  const categories = [
    { keywords: ['stolen', 'theft', 'meter stolen', 'equipment stolen'], category: 'meter or equipment stolen', weight: 0 },
    { keywords: ['less range', 'battery not lasting', 'range complaint', 'only 15 km', 'range issue'], category: 'battery range complaint', weight: 0 },
    { keywords: ['penalty', 'fine', 'charge', 'waiver', 'dispute'], category: 'penalty dispute', weight: 0 },
    { keywords: ['swap', 'station', 'swap issue', 'machine'], category: 'swap issue', weight: 0 },
    { keywords: ['payment', 'billing', 'invoice', 'pay'], category: 'payment query', weight: 0 },
    { keywords: ['technical', 'fault', 'not working', 'broken', 'error'], category: 'technical fault', weight: 0 },
    { keywords: ['subscription', 'plan', 'monthly', 'unlimited'], category: 'subscription inquiry', weight: 0 },
    { keywords: ['information', 'how to', 'what is', 'tell me'], category: 'general information request', weight: 0 }
  ];
  
  categories.forEach(cat => {
    cat.keywords.forEach(keyword => {
      if (lower.includes(keyword)) {
        cat.weight += 20;
      }
    });
  });
  
  // Sort by weight
  categories.sort((a, b) => b.weight - a.weight);
  
  const topCategory = categories[0].weight > 0 ? categories[0] : { category: 'general information request', weight: 40 };
  const confidence = Math.min(90, 50 + topCategory.weight);
  
  log(`Fallback classification: ${topCategory.category} (${confidence}%)`);
  
  return {
    category: topCategory.category,
    confidence,
    allCategories: categories.slice(0, 5).map(c => ({
      label: c.category,
      score: Math.max(10, Math.min(90, 40 + c.weight))
    })),
    model: 'keyword-fallback',
    isDefault: true
  };
};

// ============================================
// EMOTION DETECTION (DistilRoBERTa)
// ============================================
export const detectEmotion = async (text) => {
  if (!text || text.length < 10) {
    return { emotion: 'neutral', confidence: 50, isDefault: true };
  }

  try {
    const result = await callHuggingFaceAPI(
      'j-hartmann/emotion-english-distilroberta-base',
      { inputs: text.substring(0, 512) }
    );
    
    // Result: [[{label: "anger", score: 0.5}, {label: "joy", score: 0.3}, ...]]
    const emotions = Array.isArray(result[0]) ? result[0] : result;
    
    if (!emotions || emotions.length === 0) {
      throw new Error('No emotion results');
    }
    
    const sorted = [...emotions].sort((a, b) => b.score - a.score);
    const topEmotion = sorted[0];
    
    log(`Emotion: ${topEmotion.label} (${Math.round(topEmotion.score * 100)}%)`);
    
    return {
      emotion: topEmotion.label,
      confidence: Math.round(topEmotion.score * 100),
      allEmotions: sorted.map(e => ({
        label: e.label,
        score: Math.round(e.score * 100)
      })),
      model: 'emotion-english-distilroberta-base',
      isDefault: false
    };
  } catch (error) {
    logError('Emotion detection failed:', error.message);
    return detectEmotionFallback(text);
  }
};

// Fallback emotion detection
const detectEmotionFallback = (text) => {
  const lower = text.toLowerCase();
  
  const emotionKeywords = {
    anger: ['angry', 'furious', 'upset', 'frustrated', 'mad', 'annoyed', 'irritated'],
    joy: ['happy', 'great', 'wonderful', 'excellent', 'thank', 'appreciate', 'satisfied'],
    sadness: ['sad', 'disappointed', 'unhappy', 'sorry', 'regret'],
    fear: ['worried', 'scared', 'afraid', 'anxious', 'concerned'],
    surprise: ['surprised', 'shocked', 'unexpected', 'wow', 'amazing'],
    disgust: ['disgusting', 'terrible', 'horrible', 'awful', 'worst']
  };
  
  const scores = {};
  Object.keys(emotionKeywords).forEach(emotion => {
    scores[emotion] = 0;
    emotionKeywords[emotion].forEach(keyword => {
      if (lower.includes(keyword)) {
        scores[emotion] += 25;
      }
    });
  });
  
  // Check issue types for emotion hints
  if (lower.includes('stolen') || lower.includes('theft')) {
    scores.anger = (scores.anger || 0) + 30;
    scores.fear = (scores.fear || 0) + 20;
  }
  if (lower.includes('complaint') || lower.includes('problem')) {
    scores.anger = (scores.anger || 0) + 20;
  }
  if (lower.includes('resolved') || lower.includes('thank')) {
    scores.joy = (scores.joy || 0) + 25;
  }
  
  // Find top emotion
  let topEmotion = 'neutral';
  let topScore = 0;
  
  Object.entries(scores).forEach(([emotion, score]) => {
    if (score > topScore) {
      topEmotion = emotion;
      topScore = score;
    }
  });
  
  const confidence = topScore > 0 ? Math.min(90, 50 + topScore) : 55;
  
  log(`Fallback emotion: ${topEmotion} (${confidence}%)`);
  
  // Build allEmotions array
  const allEmotions = Object.entries(scores)
    .map(([label, score]) => ({ label, score: Math.max(5, Math.min(90, 30 + score)) }))
    .sort((a, b) => b.score - a.score);
  
  if (topEmotion === 'neutral') {
    allEmotions.unshift({ label: 'neutral', score: confidence });
  }
  
  return {
    emotion: topEmotion,
    confidence,
    allEmotions: allEmotions.slice(0, 6),
    model: 'keyword-fallback',
    isDefault: true
  };
};

// ============================================
// GENERATE SUMMARY DIRECTLY FROM TRANSCRIPTION
// ============================================
const generateSmartSummary = (text, sentiment, category, emotion) => {
  // Clean up the transcription text
  const cleanText = text.replace(/\s+/g, ' ').trim().toLowerCase();
  
  console.log('📝 [Summary] Analyzing transcription to generate summary...');
  
  // Detect the main issue/topic from transcription content
  let mainIssue = '';
  let resolution = '';
  
  // Issue detection based on keywords in transcription
  if (cleanText.includes('stolen') || cleanText.includes('theft') || cleanText.includes('chori')) {
    mainIssue = 'Customer reported meter/equipment theft';
    resolution = 'Security team notified and replacement process initiated';
  } else if (cleanText.includes('less range') || cleanText.includes('kam range') || cleanText.includes('battery range') || cleanText.match(/\b(10|15|20|25)\s*km\b/)) {
    mainIssue = 'Customer complained about less battery range than expected';
    resolution = 'Battery performance issue noted for follow-up';
  } else if (cleanText.includes('penalty') || cleanText.includes('fine') || cleanText.includes('extra charge')) {
    mainIssue = 'Customer inquired about penalty charges';
    resolution = 'Penalty details explained to customer';
  } else if (cleanText.includes('swap') && (cleanText.includes('issue') || cleanText.includes('problem') || cleanText.includes('not working'))) {
    mainIssue = 'Customer faced issue with battery swap process';
    resolution = 'Swap station issue reported for resolution';
  } else if (cleanText.includes('swap') && (cleanText.includes('information') || cleanText.includes('how') || cleanText.includes('where') || cleanText.includes('station'))) {
    mainIssue = 'Customer inquired about battery swap process';
    resolution = 'Swap station information provided';
  } else if (cleanText.includes('payment') || cleanText.includes('billing') || cleanText.includes('invoice') || cleanText.includes('paisa')) {
    mainIssue = 'Customer had payment/billing related query';
    resolution = 'Payment details clarified';
  } else if (cleanText.includes('subscription') || cleanText.includes('plan') || cleanText.includes('unlimited')) {
    mainIssue = 'Customer inquired about subscription plans';
    resolution = 'Subscription options explained';
  } else if (cleanText.includes('not working') || cleanText.includes('fault') || cleanText.includes('broken') || cleanText.includes('kharab')) {
    mainIssue = 'Customer reported technical issue with equipment';
    resolution = 'Technical support escalation initiated';
  } else if (category.category && category.category !== 'general inquiry') {
    mainIssue = `Customer called regarding ${category.category}`;
    resolution = 'Query addressed by agent';
  } else {
    mainIssue = 'Customer contacted support for general inquiry';
    resolution = 'Query handled as per standard procedure';
  }
  
  // Build summary based on sentiment and emotion
  let sentimentContext = '';
  if (sentiment.label === 'negative') {
    sentimentContext = 'Customer expressed concern during the call.';
  } else if (sentiment.label === 'positive') {
    sentimentContext = 'Customer was satisfied with the assistance.';
  } else {
    sentimentContext = 'Call handled professionally.';
  }
  
  // Construct final summary
  const finalSummary = `${mainIssue}. ${resolution}. ${sentimentContext}`;
  
  console.log('📝 [Summary] Generated summary:', finalSummary);
  
  return finalSummary;
};

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================
export const analyzeCallWithDistilBERT = async (transcription, options = {}) => {
  // Store the original transcription
  let originalText = '';
  
  if (typeof transcription === 'string') {
    originalText = transcription;
  } else if (transcription?.segments && Array.isArray(transcription.segments)) {
    // Extract text from all segments
    originalText = transcription.segments.map(s => {
      const speaker = s.speaker || 'Speaker';
      const text = s.text || '';
      return `${speaker}: ${text}`;
    }).join('\n');
  } else if (transcription?.text) {
    originalText = transcription.text;
  }
  
  // Clean and prepare the text
  const text = originalText.trim();
  
  console.log('🔮 [DistilBERT] Received transcription for analysis:');
  console.log('📝 Text length:', text.length, 'characters');
  console.log('📄 First 300 chars:', text.substring(0, 300));
  
  if (!text || text.length < 10) {
    console.warn('⚠️ [DistilBERT] Insufficient text for analysis');
    return {
      success: false,
      error: 'Insufficient text for analysis',
      sentiment: { label: 'neutral', confidence: 50, isDefault: true },
      category: { category: 'general inquiry', confidence: 50, isDefault: true },
      emotion: { emotion: 'neutral', confidence: 50, isDefault: true },
      summary: { summary: 'No transcription available for analysis.', model: 'none' },
      originalTranscription: text
    };
  }
  
  log(`Starting analysis on ${text.length} characters...`);
  log(`API Key present: ${!!HF_API_KEY}`);
  
  try {
    // Run all analyses in parallel
    const [sentimentResult, categoryResult, emotionResult] = await Promise.all([
      analyzeSentiment(text),
      classifyCallType(text),
      detectEmotion(text)
    ]);
    
    // Generate summary from the ACTUAL transcription
    console.log('📝 [DistilBERT] Generating summary from transcription...');
    const summaryText = generateSmartSummary(text, sentimentResult, categoryResult, emotionResult);
    
    // Determine if we used real API or fallback
    const usedAPI = !sentimentResult.isDefault || !categoryResult.isDefault || !emotionResult.isDefault;
    
    log('Analysis complete!', {
      sentiment: sentimentResult.label,
      category: categoryResult.category,
      emotion: emotionResult.emotion,
      usedAPI,
      summaryLength: summaryText.length
    });
    
    return {
      success: true,
      sentiment: sentimentResult,
      category: categoryResult,
      emotion: emotionResult,
      summary: { summary: summaryText, model: usedAPI ? 'huggingface' : 'fallback' },
      provider: usedAPI ? 'Hugging Face Inference API' : 'Intelligent Fallback (Keyword Analysis)',
      analyzedAt: new Date().toISOString(),
      textLength: text.length,
      usedAPI,
      originalTranscription: text
    };
  } catch (error) {
    logError('Analysis failed:', error);
    
    // Run fallback analysis using the ACTUAL transcription
    console.log('🔄 [DistilBERT] Using fallback analysis with actual transcription');
    const sentimentResult = analyzeSentimentFallback(text);
    const categoryResult = classifyCallTypeFallback(text);
    const emotionResult = detectEmotionFallback(text);
    const summaryText = generateSmartSummary(text, sentimentResult, categoryResult, emotionResult);
    
    return {
      success: true,
      sentiment: sentimentResult,
      category: categoryResult,
      emotion: emotionResult,
      summary: { summary: summaryText, model: 'fallback' },
      provider: 'Intelligent Fallback (API Error)',
      analyzedAt: new Date().toISOString(),
      textLength: text.length,
      usedAPI: false,
      error: error.message,
      originalTranscription: text
    };
  }
};

// ============================================
// BATCH ANALYSIS
// ============================================
export const batchAnalyzeWithDistilBERT = async (calls, onProgress) => {
  const results = [];
  const total = calls.length;
  
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    
    try {
      const text = call.transcription?.segments?.map(s => s.text).join(' ') ||
                   call.transcription?.text ||
                   call.description ||
                   `${call.callType || 'General'} call from ${call.agent || 'Agent'}`;
      
      const analysis = await analyzeCallWithDistilBERT(text);
      
      results.push({
        ...call,
        distilbertAnalysis: analysis,
        sentiment: analysis.sentiment?.label || call.sentiment,
        riskLevel: analysis.sentiment?.label === 'negative' ? 'high' : 
                   analysis.sentiment?.label === 'positive' ? 'low' : 'medium'
      });
    } catch (error) {
      logError(`Failed to analyze call ${call.id}:`, error);
      results.push(call);
    }
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100)
      });
    }
    
    // Rate limiting
    if (i < calls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return results;
};

export default {
  analyzeSentiment,
  classifyCallType,
  detectEmotion,
  analyzeCallWithDistilBERT,
  batchAnalyzeWithDistilBERT
};
