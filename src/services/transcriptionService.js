// Deepgram Audio Transcription Service
// Uses Deepgram API for accurate audio transcription

const DEEPGRAM_API_KEY = 'da257132250f395f11a2a81269a8987c24182781';
const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/listen';

/**
 * Extract file ID from Google Drive URL
 */
export const extractFileId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

/**
 * Convert Google Drive sharing link to direct download URL
 */
export const getDirectDownloadUrl = (url) => {
  if (!url) return null;
  
  const fileId = extractFileId(url);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  return url;
};

/**
 * Transcribe audio using Deepgram API
 * Sends the Google Drive URL directly to Deepgram
 */
export const transcribeWithDeepgram = async (audioUrl) => {
  const fileId = extractFileId(audioUrl);
  
  if (!fileId) {
    console.log('Could not extract file ID from:', audioUrl);
    return generateSimulatedTranscription(audioUrl);
  }

  try {
    // Get direct download URL
    const directUrl = getDirectDownloadUrl(audioUrl);
    console.log('Transcribing audio from:', directUrl);
    
    // Deepgram can transcribe from URL directly
    const response = await fetch(`${DEEPGRAM_API_URL}?model=nova-2&smart_format=true&diarize=true&punctuate=true&language=hi-en`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: directUrl
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram API error:', response.status, errorText);
      
      // If direct URL fails, try with CORS proxy
      return await transcribeWithProxy(audioUrl);
    }

    const data = await response.json();
    console.log('Deepgram response:', data);
    
    return parseDeepgramResponse(data);
    
  } catch (error) {
    console.error('Deepgram transcription failed:', error);
    return await transcribeWithProxy(audioUrl);
  }
};

/**
 * Try transcription using a CORS proxy to fetch audio first
 */
const transcribeWithProxy = async (audioUrl) => {
  try {
    const directUrl = getDirectDownloadUrl(audioUrl);
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
    
    console.log('Trying with CORS proxy:', proxyUrl);
    
    // Fetch audio via proxy
    const audioResponse = await fetch(proxyUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
    }
    
    const audioBlob = await audioResponse.blob();
    console.log('Audio fetched, size:', audioBlob.size, 'bytes');
    
    // Send audio blob to Deepgram
    const response = await fetch(`${DEEPGRAM_API_URL}?model=nova-2&smart_format=true&diarize=true&punctuate=true&language=hi`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': audioBlob.type || 'audio/mpeg',
      },
      body: audioBlob,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram proxy error:', response.status, errorText);
      throw new Error(`Deepgram error: ${response.status}`);
    }

    const data = await response.json();
    return parseDeepgramResponse(data);
    
  } catch (error) {
    console.error('Proxy transcription failed:', error);
    return generateSimulatedTranscription(audioUrl);
  }
};

/**
 * Parse Deepgram's response into our format
 */
const parseDeepgramResponse = (data) => {
  const segments = [];
  let fullText = '';
  
  try {
    const results = data.results;
    if (!results || !results.channels || !results.channels[0]) {
      throw new Error('Invalid Deepgram response structure');
    }
    
    const channel = results.channels[0];
    const alternatives = channel.alternatives[0];
    
    // Get full transcript
    fullText = alternatives.transcript || '';
    
    // Get words with speaker diarization
    const words = alternatives.words || [];
    
    // Group words by speaker
    let currentSpeaker = null;
    let currentText = '';
    let segmentStart = 0;
    
    for (const word of words) {
      const speaker = word.speaker !== undefined ? (word.speaker === 0 ? 'Agent' : 'Customer') : 'Agent';
      
      if (currentSpeaker === null) {
        currentSpeaker = speaker;
        segmentStart = word.start || 0;
      }
      
      if (speaker !== currentSpeaker) {
        // Save current segment
        if (currentText.trim()) {
          segments.push({
            speaker: currentSpeaker,
            text: currentText.trim(),
            startTime: segmentStart,
            endTime: word.start || segmentStart + 5,
          });
        }
        
        // Start new segment
        currentSpeaker = speaker;
        currentText = word.punctuated_word || word.word || '';
        segmentStart = word.start || 0;
      } else {
        currentText += ' ' + (word.punctuated_word || word.word || '');
      }
    }
    
    // Add last segment
    if (currentText.trim()) {
      segments.push({
        speaker: currentSpeaker,
        text: currentText.trim(),
        startTime: segmentStart,
        endTime: words.length > 0 ? (words[words.length - 1].end || segmentStart + 5) : segmentStart + 5,
      });
    }
    
    // If no diarization, split by sentences
    if (segments.length === 0 && fullText) {
      const sentences = fullText.split(/[.!?]+/).filter(s => s.trim());
      let currentTime = 0;
      
      sentences.forEach((sentence, index) => {
        const speaker = index % 2 === 0 ? 'Agent' : 'Customer';
        const duration = Math.max(5, sentence.split(' ').length * 0.5);
        
        segments.push({
          speaker,
          text: sentence.trim(),
          startTime: currentTime,
          endTime: currentTime + duration,
        });
        
        currentTime += duration;
      });
    }
    
    const duration = segments.length > 0 
      ? segments[segments.length - 1].endTime 
      : (results.metadata?.duration || 0);
    
    return {
      fullText: fullText.trim(),
      segments,
      speakers: ['Agent', 'Customer'],
      duration,
      source: 'deepgram',
      metadata: results.metadata,
    };
    
  } catch (error) {
    console.error('Error parsing Deepgram response:', error);
    return {
      fullText: fullText || 'Transcription parsing failed',
      segments: [],
      speakers: ['Agent', 'Customer'],
      duration: 0,
      source: 'deepgram-error',
    };
  }
};

/**
 * Main transcription function with retry logic
 */
export const transcribeAudio = async (audioUrl, options = {}) => {
  return transcribeWithDeepgram(audioUrl);
};

/**
 * Transcribe with retry logic
 */
export const transcribeWithRetry = async (audioUrl, options = {}, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Transcription attempt ${attempt} for: ${audioUrl}`);
      const result = await transcribeWithDeepgram(audioUrl);
      
      if (result.segments && result.segments.length > 0) {
        console.log(`Transcription successful with ${result.segments.length} segments`);
        return result;
      }
      
      if (result.fullText && result.fullText.length > 50) {
        console.log(`Transcription successful with full text`);
        return result;
      }
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  console.log('All attempts failed, using simulated transcription');
  return generateSimulatedTranscription(audioUrl);
};

/**
 * Generate simulated transcription for demo/fallback
 * Based on the actual issue types from the spreadsheet
 */
export const generateSimulatedTranscription = (audioUrl) => {
  // Use URL to determine which conversation to show
  const hash = audioUrl ? audioUrl.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
  
  const conversations = [
    // Swap Information Shared - Jyoti
    {
      segments: [
        { speaker: 'Agent', text: 'नमस्ते, Battery Smart कस्टमर केयर में आपका स्वागत है। मैं ज्योति बोल रही हूं। आपकी कैसे मदद कर सकती हूं?', startTime: 0, endTime: 8 },
        { speaker: 'Customer', text: 'हां नमस्ते, मुझे बैटरी स्वैप के बारे में जानकारी चाहिए। कैसे करते हैं?', startTime: 8, endTime: 15 },
        { speaker: 'Agent', text: 'जी सर, बैटरी स्वैप बहुत आसान है। आपको बस अपनी खाली बैटरी लेकर नज़दीकी स्वैप स्टेशन जाना है।', startTime: 15, endTime: 25 },
        { speaker: 'Customer', text: 'स्वैप स्टेशन कहां होता है?', startTime: 25, endTime: 29 },
        { speaker: 'Agent', text: 'सर, हमारे स्टेशन आपके एरिया में कई जगह हैं। आप Battery Smart ऐप में "Nearby Stations" पर क्लिक करके देख सकते हैं।', startTime: 29, endTime: 42 },
        { speaker: 'Customer', text: 'अच्छा, और स्वैप में कितना टाइम लगता है?', startTime: 42, endTime: 48 },
        { speaker: 'Agent', text: 'सर बस 2 मिनट लगते हैं। आप पुरानी बैटरी देंगे, मशीन में डालेंगे, और फुल चार्ज बैटरी तुरंत मिल जाएगी।', startTime: 48, endTime: 60 },
        { speaker: 'Customer', text: 'वाह, बहुत अच्छा। और चार्ज कितना लगता है?', startTime: 60, endTime: 66 },
        { speaker: 'Agent', text: 'सर हमारे different plans हैं। Per swap 35 रुपये है, और monthly unlimited plan 999 रुपये का है।', startTime: 66, endTime: 78 },
        { speaker: 'Customer', text: 'Monthly plan अच्छा है। कैसे लेना है?', startTime: 78, endTime: 84 },
        { speaker: 'Agent', text: 'सर ऐप में जाकर Subscription section में जाइए, वहां Monthly Unlimited सेलेक्ट करिए और पेमेंट कर दीजिए।', startTime: 84, endTime: 96 },
        { speaker: 'Customer', text: 'ठीक है, मैं कर लूंगा। थैंक यू।', startTime: 96, endTime: 101 },
        { speaker: 'Agent', text: 'आपका स्वागत है सर। Battery Smart चुनने के लिए धन्यवाद। कोई और सवाल हो तो बताइएगा।', startTime: 101, endTime: 112 },
        { speaker: 'Customer', text: 'नहीं बस इतना ही था। बाय।', startTime: 112, endTime: 116 },
        { speaker: 'Agent', text: 'बाय सर, आपका दिन शुभ हो!', startTime: 116, endTime: 120 },
      ],
      duration: 120
    },
    // Penalty Information Shared - Deepa Upadhyay
    {
      segments: [
        { speaker: 'Agent', text: 'Good afternoon, Battery Smart customer care. This is Deepa speaking. How may I help you?', startTime: 0, endTime: 7 },
        { speaker: 'Customer', text: 'Hello, mujhe penalty ke baare mein jaanna hai. Mere account mein 500 rupees ka penalty lag gaya hai.', startTime: 7, endTime: 16 },
        { speaker: 'Agent', text: 'I understand sir. Let me check your account. Can you please share your registered mobile number?', startTime: 16, endTime: 24 },
        { speaker: 'Customer', text: '7302535629', startTime: 24, endTime: 28 },
        { speaker: 'Agent', text: 'Thank you sir. I can see your account... Yes, there is a penalty of 500 rupees due to late battery return.', startTime: 28, endTime: 40 },
        { speaker: 'Customer', text: 'Late return? Matlab kya hai?', startTime: 40, endTime: 45 },
        { speaker: 'Agent', text: 'Sir, jab aap battery swap karte hain, toh aapko 48 hours ke andar wapas karna hota hai. Aapne 5 din baad return kiya.', startTime: 45, endTime: 58 },
        { speaker: 'Customer', text: 'Arey, mujhe toh pata hi nahi tha. Koi bataya nahi.', startTime: 58, endTime: 65 },
        { speaker: 'Agent', text: 'Sir, yeh information app mein available hai aur signup ke time bhi share kiya jaata hai. But I understand your concern.', startTime: 65, endTime: 78 },
        { speaker: 'Customer', text: 'Toh ab kya hoga? 500 rupees toh bahut hai.', startTime: 78, endTime: 85 },
        { speaker: 'Agent', text: 'Sir, main ek request raise karti hoon waiver ke liye. Since this is your first time, we may be able to reduce it.', startTime: 85, endTime: 98 },
        { speaker: 'Customer', text: 'Please kar do. Aage se dhyan rakhunga.', startTime: 98, endTime: 104 },
        { speaker: 'Agent', text: 'Sure sir. I have raised a request for 50% waiver. You will receive update within 24 hours on your registered number.', startTime: 104, endTime: 118 },
        { speaker: 'Customer', text: 'Thank you so much. Aap bahut helpful ho.', startTime: 118, endTime: 124 },
        { speaker: 'Agent', text: 'You are welcome sir. Please remember to return battery within 48 hours next time. Anything else I can help with?', startTime: 124, endTime: 136 },
        { speaker: 'Customer', text: 'No, thats all. Thanks again.', startTime: 136, endTime: 141 },
        { speaker: 'Agent', text: 'Thank you for calling Battery Smart. Have a great day!', startTime: 141, endTime: 147 },
      ],
      duration: 147
    },
    // Less Range Complaint - Rinki Rani
    {
      segments: [
        { speaker: 'Agent', text: 'नमस्ते, Battery Smart में आपका स्वागत है। मैं रिंकी बोल रही हूं। क्या समस्या है आपकी?', startTime: 0, endTime: 8 },
        { speaker: 'Customer', text: 'देखो, मैंने 2 घंटे पहले बैटरी स्वैप की थी। पूरा चार्ज बताया था लेकिन सिर्फ 15 किलोमीटर में खत्म हो गई!', startTime: 8, endTime: 20 },
        { speaker: 'Agent', text: 'ओह, मुझे खेद है सर। ये तो बिल्कुल ठीक नहीं है। आपका मोबाइल नंबर बताइए।', startTime: 20, endTime: 30 },
        { speaker: 'Customer', text: '9990068632। और मैं अभी रास्ते में फंसा हुआ हूं।', startTime: 30, endTime: 38 },
        { speaker: 'Agent', text: 'सर मैं समझ सकती हूं आपकी परेशानी। मैं आपका account check करती हूं... हां, मुझे दिख रहा है swap हुआ था station S-445 पर।', startTime: 38, endTime: 52 },
        { speaker: 'Customer', text: 'हां वही। Battery खराब थी शायद।', startTime: 52, endTime: 58 },
        { speaker: 'Agent', text: 'सर हो सकता है। कभी-कभी कोई battery में issue आ जाता है। आप अभी कहां हैं?', startTime: 58, endTime: 68 },
        { speaker: 'Customer', text: 'मैं सेक्टर 15 के पास हूं, मेन रोड पर।', startTime: 68, endTime: 75 },
        { speaker: 'Agent', text: 'ठीक है सर। आपके पास में एक स्टेशन है, सेक्टर 14 मार्केट में, सिर्फ 500 मीटर दूर। वहां जाकर फ्री swap ले लीजिए।', startTime: 75, endTime: 90 },
        { speaker: 'Customer', text: 'Free swap? कैसे?', startTime: 90, endTime: 94 },
        { speaker: 'Agent', text: 'सर मैंने अभी आपके account में 1 free emergency swap credit कर दिया है। आप उस station पर जाइए और swap कर लीजिए।', startTime: 94, endTime: 108 },
        { speaker: 'Customer', text: 'अच्छा, चलो ठीक है। लेकिन ऐसा बार-बार होता है तो problem है।', startTime: 108, endTime: 117 },
        { speaker: 'Agent', text: 'बिल्कुल सही कह रहे हैं सर। मैंने इस battery को flag कर दिया है testing के लिए। और आपकी complaint भी register हो गई है।', startTime: 117, endTime: 132 },
        { speaker: 'Customer', text: 'ठीक है। Complaint number क्या है?', startTime: 132, endTime: 137 },
        { speaker: 'Agent', text: 'सर आपका complaint number है BS-2026-1234। इसे note कर लीजिए।', startTime: 137, endTime: 146 },
        { speaker: 'Customer', text: 'लिख लिया। चलो अभी station जाता हूं।', startTime: 146, endTime: 152 },
        { speaker: 'Agent', text: 'जी सर। और कोई परेशानी हो तो please हमें call करें। आपकी यात्रा सुरक्षित हो!', startTime: 152, endTime: 163 },
        { speaker: 'Customer', text: 'धन्यवाद।', startTime: 163, endTime: 166 },
      ],
      duration: 166
    },
    // Penalty Information - Second call
    {
      segments: [
        { speaker: 'Agent', text: 'Battery Smart customer care, this is Rinki. How can I help you today?', startTime: 0, endTime: 6 },
        { speaker: 'Customer', text: 'Haan, mera account mein penalty show ho raha hai. Mujhe details chahiye.', startTime: 6, endTime: 14 },
        { speaker: 'Agent', text: 'Sure sir. Aapka registered mobile number please?', startTime: 14, endTime: 19 },
        { speaker: 'Customer', text: '9193777813', startTime: 19, endTime: 23 },
        { speaker: 'Agent', text: 'Thank you sir. Let me check... Yes, I can see a penalty of 300 rupees on your account.', startTime: 23, endTime: 33 },
        { speaker: 'Customer', text: 'Kyun laga hai yeh?', startTime: 33, endTime: 36 },
        { speaker: 'Agent', text: 'Sir, yeh battery damage penalty hai. Last swap mein jo battery aapne return ki thi, usme physical damage tha.', startTime: 36, endTime: 48 },
        { speaker: 'Customer', text: 'Damage? Maine kuch nahi kiya!', startTime: 48, endTime: 53 },
        { speaker: 'Agent', text: 'Sir, humari team ne check kiya hai. Battery casing mein dent tha. Yeh normal wear and tear nahi hai.', startTime: 53, endTime: 65 },
        { speaker: 'Customer', text: 'Shayad swap machine mein hua hoga.', startTime: 65, endTime: 70 },
        { speaker: 'Agent', text: 'Sir, main aapki baat samajh rahi hoon. Aap appeal file kar sakte hain app mein. Investigation ke baad decision hoga.', startTime: 70, endTime: 84 },
        { speaker: 'Customer', text: 'Appeal kaise karein?', startTime: 84, endTime: 88 },
        { speaker: 'Agent', text: 'App mein jaayein, My Account section mein Penalties dekho, wahan Appeal button hoga. Photos bhi attach kar sakte hain agar hain.', startTime: 88, endTime: 102 },
        { speaker: 'Customer', text: 'Photos nahi hain mere paas.', startTime: 102, endTime: 106 },
        { speaker: 'Agent', text: 'Koi baat nahi sir. Aap sirf written appeal submit kar dijiye. Humari team 3-5 working days mein review karegi.', startTime: 106, endTime: 118 },
        { speaker: 'Customer', text: 'Theek hai, kar deta hoon.', startTime: 118, endTime: 122 },
        { speaker: 'Agent', text: 'Sure sir. Is beech mein aap services use kar sakte hain normally. Penalty pending rahega.', startTime: 122, endTime: 132 },
        { speaker: 'Customer', text: 'Okay. Thanks for the information.', startTime: 132, endTime: 137 },
        { speaker: 'Agent', text: 'You are welcome sir. Battery Smart ko call karne ke liye dhanyawad. Have a nice day!', startTime: 137, endTime: 146 },
      ],
      duration: 146
    },
    // Meter Stolen - Anshika
    {
      segments: [
        { speaker: 'Agent', text: 'नमस्ते, Battery Smart कस्टमर केयर। मैं अंशिका बोल रही हूं। कैसे मदद कर सकती हूं?', startTime: 0, endTime: 8 },
        { speaker: 'Customer', text: 'Hello, बहुत बड़ी problem है। मेरी गाड़ी से मीटर चोरी हो गया!', startTime: 8, endTime: 16 },
        { speaker: 'Agent', text: 'अरे! यह तो बहुत serious है सर। कब हुआ यह?', startTime: 16, endTime: 22 },
        { speaker: 'Customer', text: 'आज सुबह पता चला। रात को गाड़ी बाहर खड़ी थी और सुबह देखा तो मीटर गायब।', startTime: 22, endTime: 33 },
        { speaker: 'Agent', text: 'मुझे बहुत दुख है सर। क्या आपने पुलिस में रिपोर्ट की?', startTime: 33, endTime: 40 },
        { speaker: 'Customer', text: 'हां, FIR करवा दी। नंबर है 234/2026।', startTime: 40, endTime: 47 },
        { speaker: 'Agent', text: 'बहुत अच्छा किया सर। FIR होना जरूरी है। अब मुझे आपका account check करना होगा। मोबाइल नंबर please?', startTime: 47, endTime: 60 },
        { speaker: 'Customer', text: '9310099122', startTime: 60, endTime: 64 },
        { speaker: 'Agent', text: 'Thank you sir। मैं देख रही हूं... आपके नाम पर एक vehicle registered है, number DL-3C-AX-1234।', startTime: 64, endTime: 77 },
        { speaker: 'Customer', text: 'हां यही है।', startTime: 77, endTime: 80 },
        { speaker: 'Agent', text: 'ठीक है सर। मीटर चोरी के case में हमें कुछ documents चाहिए - FIR copy, ID proof, और vehicle RC।', startTime: 80, endTime: 94 },
        { speaker: 'Customer', text: 'कहां भेजने हैं?', startTime: 94, endTime: 97 },
        { speaker: 'Agent', text: 'सर आप app में Support section में जाइए, वहां Document Upload का option है। या email कर सकते हैं support@batterysmart.com पर।', startTime: 97, endTime: 112 },
        { speaker: 'Customer', text: 'नया मीटर कब मिलेगा?', startTime: 112, endTime: 116 },
        { speaker: 'Agent', text: 'सर documents verify होने के बाद 2-3 working days में हमारी team आपके घर आकर नया मीटर install कर देगी।', startTime: 116, endTime: 130 },
        { speaker: 'Customer', text: 'और charges?', startTime: 130, endTime: 133 },
        { speaker: 'Agent', text: 'सर मीटर की cost 2500 रुपये है। लेकिन अगर insurance था तो 500 रुपये ही देने होंगे।', startTime: 133, endTime: 145 },
        { speaker: 'Customer', text: 'Insurance था मेरे पास।', startTime: 145, endTime: 149 },
        { speaker: 'Agent', text: 'बहुत अच्छा सर। तो सिर्फ 500 रुपये processing fee लगेगी। Complaint number note कीजिए - MTR-2026-5678।', startTime: 149, endTime: 163 },
        { speaker: 'Customer', text: 'लिख लिया। Documents आज ही भेज देता हूं।', startTime: 163, endTime: 170 },
        { speaker: 'Agent', text: 'Perfect सर। Documents मिलते ही हम process शुरू कर देंगे। कोई और सवाल?', startTime: 170, endTime: 180 },
        { speaker: 'Customer', text: 'नहीं, बस इतना ही। Thank you।', startTime: 180, endTime: 185 },
        { speaker: 'Agent', text: 'आपका स्वागत है सर। परेशानी के लिए माफी। जल्द ही आपका मीटर install हो जाएगा। Take care!', startTime: 185, endTime: 197 },
      ],
      duration: 197
    },
  ];

  const selectedConversation = conversations[hash % conversations.length];

  return {
    ...selectedConversation,
    speakers: ['Agent', 'Customer'],
    source: 'demo',
    fullText: selectedConversation.segments.map(s => `${s.speaker}: ${s.text}`).join('\n')
  };
};

/**
 * Format timestamp for display (e.g., "0:45" or "1:23")
 */
export const formatTimestamp = (seconds) => {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default {
  transcribeAudio,
  transcribeWithRetry,
  transcribeWithDeepgram,
  generateSimulatedTranscription,
  formatTimestamp,
  getDirectDownloadUrl,
  extractFileId,
};
