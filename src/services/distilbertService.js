// DistilBERT Integration via Hugging Face Inference API
// Free tier: 30,000 requests/month
// Models: Sentiment, Classification, NER, QA, Summarization

const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models';

// ============================================
// SENTIMENT ANALYSIS (DistilBERT)
// ============================================
export const analyzeSentiment = async (text) => {
  if (!text || text.length < 5) {
    return { label: 'neutral', confidence: 50, error: 'Text too short' };
  }

  try {
    const response = await fetch(
      `${HF_API_URL}/distilbert-base-uncased-finetuned-sst-2-english`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text.substring(0, 512) }), // Max 512 tokens
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle loading state (model warming up)
    if (result.error && result.error.includes('loading')) {
      await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20s for model to load
      return analyzeSentiment(text); // Retry
    }
    
    // Result format: [[{ label: "POSITIVE", score: 0.95 }, { label: "NEGATIVE", score: 0.05 }]]
    const predictions = Array.isArray(result[0]) ? result[0] : result;
    const sentiment = predictions?.reduce((a, b) => (a?.score > b?.score ? a : b), predictions[0]);
    
    return {
      label: sentiment?.label?.toLowerCase() === 'positive' ? 'positive' : 
             sentiment?.label?.toLowerCase() === 'negative' ? 'negative' : 'neutral',
      confidence: Math.round((sentiment?.score || 0.5) * 100),
      raw: result,
      model: 'distilbert-base-uncased-finetuned-sst-2-english'
    };
  } catch (error) {
    console.error('DistilBERT sentiment error:', error);
    return { label: 'neutral', confidence: 50, error: error.message };
  }
};

// ============================================
// TEXT CLASSIFICATION (Zero-shot)
// ============================================
export const classifyCallType = async (text) => {
  if (!text || text.length < 10) {
    return { category: 'general inquiry', confidence: 50, error: 'Text too short' };
  }

  try {
    const response = await fetch(
      `${HF_API_URL}/facebook/bart-large-mnli`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text.substring(0, 1000),
          parameters: {
            candidate_labels: [
              'battery range complaint',
              'penalty dispute',
              'swap issue',
              'payment query',
              'technical fault',
              'equipment stolen',
              'subscription inquiry',
              'general information'
            ]
          }
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle loading state
    if (result.error && result.error.includes('loading')) {
      await new Promise(resolve => setTimeout(resolve, 30000));
      return classifyCallType(text);
    }
    
    return {
      category: result.labels?.[0] || 'general inquiry',
      confidence: Math.round((result.scores?.[0] || 0.5) * 100),
      allCategories: result.labels?.slice(0, 3).map((label, i) => ({
        label,
        score: Math.round((result.scores?.[i] || 0) * 100)
      })),
      model: 'facebook/bart-large-mnli'
    };
  } catch (error) {
    console.error('Classification error:', error);
    return { category: 'general inquiry', confidence: 50, error: error.message };
  }
};

// ============================================
// NAMED ENTITY RECOGNITION
// ============================================
export const extractEntities = async (text) => {
  if (!text || text.length < 10) {
    return { persons: [], locations: [], organizations: [], misc: [] };
  }

  try {
    const response = await fetch(
      `${HF_API_URL}/dbmdz/bert-large-cased-finetuned-conll03-english`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text.substring(0, 512) }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Group entities by type
    const entities = {
      persons: [],
      locations: [],
      organizations: [],
      misc: []
    };
    
    if (Array.isArray(result)) {
      result.forEach(entity => {
        const type = entity.entity_group?.toUpperCase() || entity.entity?.toUpperCase();
        const word = entity.word?.replace(/^##/, '') || '';
        
        if (type?.includes('PER')) entities.persons.push(word);
        else if (type?.includes('LOC')) entities.locations.push(word);
        else if (type?.includes('ORG')) entities.organizations.push(word);
        else if (word) entities.misc.push(word);
      });
    }
    
    // Deduplicate
    entities.persons = [...new Set(entities.persons)];
    entities.locations = [...new Set(entities.locations)];
    entities.organizations = [...new Set(entities.organizations)];
    entities.misc = [...new Set(entities.misc)];
    
    return { ...entities, model: 'bert-large-cased-finetuned-conll03-english' };
  } catch (error) {
    console.error('NER error:', error);
    return { persons: [], locations: [], organizations: [], misc: [], error: error.message };
  }
};

// ============================================
// QUESTION ANSWERING (For chatbot)
// ============================================
export const answerQuestion = async (question, context) => {
  if (!question || !context) {
    return { answer: 'Please provide both question and context', confidence: 0 };
  }

  try {
    const response = await fetch(
      `${HF_API_URL}/distilbert-base-cased-distilled-squad`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            question: question,
            context: context.substring(0, 1000)
          }
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      answer: result.answer || 'No answer found',
      confidence: Math.round((result.score || 0) * 100),
      start: result.start,
      end: result.end,
      model: 'distilbert-base-cased-distilled-squad'
    };
  } catch (error) {
    console.error('QA error:', error);
    return { answer: 'Unable to process question', confidence: 0, error: error.message };
  }
};

// ============================================
// TEXT SUMMARIZATION
// ============================================
export const summarizeText = async (text, maxLength = 60) => {
  if (!text || text.length < 50) {
    return { summary: text || '', error: 'Text too short for summarization' };
  }

  try {
    const response = await fetch(
      `${HF_API_URL}/sshleifer/distilbart-cnn-12-6`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text.substring(0, 1024),
          parameters: {
            max_length: maxLength,
            min_length: 15,
            do_sample: false
          }
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle loading state
    if (result.error && result.error.includes('loading')) {
      await new Promise(resolve => setTimeout(resolve, 30000));
      return summarizeText(text, maxLength);
    }
    
    return {
      summary: result[0]?.summary_text || text.substring(0, 100) + '...',
      originalLength: text.length,
      summaryLength: result[0]?.summary_text?.length || 0,
      model: 'distilbart-cnn-12-6'
    };
  } catch (error) {
    console.error('Summarization error:', error);
    return { summary: text.substring(0, 100) + '...', error: error.message };
  }
};

// ============================================
// EMOTION DETECTION (Bonus)
// ============================================
export const detectEmotion = async (text) => {
  if (!text || text.length < 10) {
    return { emotion: 'neutral', confidence: 50 };
  }

  try {
    const response = await fetch(
      `${HF_API_URL}/j-hartmann/emotion-english-distilroberta-base`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text.substring(0, 512) }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    const emotions = Array.isArray(result[0]) ? result[0] : result;
    const topEmotion = emotions?.reduce((a, b) => (a?.score > b?.score ? a : b), emotions[0]);
    
    return {
      emotion: topEmotion?.label || 'neutral',
      confidence: Math.round((topEmotion?.score || 0.5) * 100),
      allEmotions: emotions?.slice(0, 5).map(e => ({
        label: e.label,
        score: Math.round((e.score || 0) * 100)
      })),
      model: 'emotion-english-distilroberta-base'
    };
  } catch (error) {
    console.error('Emotion detection error:', error);
    return { emotion: 'neutral', confidence: 50, error: error.message };
  }
};

// ============================================
// COMPLETE CALL ANALYSIS (All models combined)
// ============================================
export const analyzeCallWithDistilBERT = async (transcription, options = {}) => {
  const text = typeof transcription === 'string' 
    ? transcription 
    : transcription?.segments?.map(s => s.text).join(' ') || 
      transcription?.text || '';
  
  if (!text || text.length < 10) {
    return {
      success: false,
      error: 'Insufficient text for analysis',
      sentiment: { label: 'neutral', confidence: 50 },
      category: { category: 'general inquiry', confidence: 50 },
      summary: { summary: 'No transcription available' },
      entities: { persons: [], locations: [], organizations: [], misc: [] },
      emotion: { emotion: 'neutral', confidence: 50 }
    };
  }
  
  console.log('🤖 Analyzing with DistilBERT...', { textLength: text.length });
  
  try {
    // Run analyses in parallel for speed (but handle failures gracefully)
    const [sentiment, category, emotion] = await Promise.allSettled([
      analyzeSentiment(text),
      classifyCallType(text),
      detectEmotion(text)
    ]);
    
    // Extract results or use defaults
    const sentimentResult = sentiment.status === 'fulfilled' ? sentiment.value : { label: 'neutral', confidence: 50 };
    const categoryResult = category.status === 'fulfilled' ? category.value : { category: 'general inquiry', confidence: 50 };
    const emotionResult = emotion.status === 'fulfilled' ? emotion.value : { emotion: 'neutral', confidence: 50 };
    
    // Generate summary from classification instead of calling another API to save quota
    const summaryText = generateLocalSummary(text, categoryResult.category, sentimentResult.label);
    
    return {
      success: true,
      sentiment: sentimentResult,
      category: categoryResult,
      emotion: emotionResult,
      summary: { summary: summaryText, model: 'local-generation' },
      entities: await extractEntities(text).catch(() => ({ persons: [], locations: [], organizations: [], misc: [] })),
      provider: 'DistilBERT (Hugging Face)',
      analyzedAt: new Date().toISOString(),
      textLength: text.length
    };
  } catch (error) {
    console.error('DistilBERT analysis error:', error);
    return {
      success: false,
      error: error.message,
      sentiment: { label: 'neutral', confidence: 50 },
      category: { category: 'general inquiry', confidence: 50 },
      summary: { summary: 'Analysis failed' },
      entities: { persons: [], locations: [], organizations: [], misc: [] },
      emotion: { emotion: 'neutral', confidence: 50 }
    };
  }
};

// ============================================
// LOCAL SUMMARY GENERATION (Saves API calls)
// ============================================
const generateLocalSummary = (text, category, sentiment) => {
  const categoryDescriptions = {
    'battery range complaint': 'Customer reported battery range issue after swap',
    'penalty dispute': 'Customer disputed penalty charges and requested clarification',
    'swap issue': 'Customer experienced problems with battery swap process',
    'payment query': 'Customer inquired about payment or billing details',
    'technical fault': 'Customer reported technical issues with equipment',
    'equipment stolen': 'Customer reported stolen meter/equipment',
    'subscription inquiry': 'Customer asked about subscription plans',
    'general information': 'Customer requested general information about services'
  };
  
  const sentimentSuffix = {
    'positive': 'Issue was resolved satisfactorily.',
    'negative': 'Customer expressed dissatisfaction.',
    'neutral': 'Standard interaction.'
  };
  
  const description = categoryDescriptions[category] || 'Customer call processed';
  const suffix = sentimentSuffix[sentiment] || '';
  
  return `${description}. ${suffix}`.trim();
};

// ============================================
// BATCH ANALYSIS (Multiple calls)
// ============================================
export const batchAnalyzeWithDistilBERT = async (calls, onProgress) => {
  const results = [];
  const total = calls.length;
  
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    
    try {
      // Create text from call data
      const text = call.transcription?.segments?.map(s => s.text).join(' ') ||
                   call.transcription?.text ||
                   call.description ||
                   `${call.callType || 'General'} call from ${call.agent || 'Agent'}`;
      
      const analysis = await analyzeCallWithDistilBERT(text);
      
      results.push({
        ...call,
        distilbertAnalysis: analysis,
        sentiment: analysis.sentiment?.label || call.sentiment,
        riskLevel: calculateRiskFromAnalysis(analysis)
      });
    } catch (error) {
      console.error(`Failed to analyze call ${call.id}:`, error);
      results.push(call);
    }
    
    // Update progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100)
      });
    }
    
    // Rate limiting: small delay between calls
    if (i < calls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
};

// ============================================
// RISK CALCULATION FROM ANALYSIS
// ============================================
const calculateRiskFromAnalysis = (analysis) => {
  const sentiment = analysis.sentiment?.label || 'neutral';
  const sentimentConfidence = analysis.sentiment?.confidence || 50;
  const emotion = analysis.emotion?.emotion || 'neutral';
  const category = analysis.category?.category || '';
  
  // High risk indicators
  const highRiskCategories = ['equipment stolen', 'penalty dispute', 'technical fault'];
  const highRiskEmotions = ['anger', 'fear', 'disgust'];
  
  if (highRiskCategories.some(c => category.includes(c))) return 'high';
  if (sentiment === 'negative' && sentimentConfidence > 75) return 'high';
  if (highRiskEmotions.includes(emotion)) return 'high';
  
  if (sentiment === 'negative') return 'medium';
  if (emotion === 'sadness') return 'medium';
  
  return 'low';
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
export default {
  analyzeSentiment,
  classifyCallType,
  extractEntities,
  answerQuestion,
  summarizeText,
  detectEmotion,
  analyzeCallWithDistilBERT,
  batchAnalyzeWithDistilBERT
};
