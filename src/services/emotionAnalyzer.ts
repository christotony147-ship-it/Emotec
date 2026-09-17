import { AnalysisResult, EmotionType, SupervisorAlert, SecondaryEmotion, SentimentType } from '../types';

interface LexiconScore {
  emotion: EmotionType;
  words: string[];
  weight: number;
}

const EMOTION_LEXICON: LexiconScore[] = [
  {
    emotion: 'anger',
    weight: 2.6,
    words: [
      // Direct customer anger profanity & explicit exasperation terms
      'fuck', 'fucking', 'fucked', 'fucks', 'fucker', 'motherfucker', 'what the fuck', 'wtf',
      'hell', 'what the hell', 'hell no', 'to hell with',
      'sucks', 'suck', 'sucked', 'sucking',
      'bullshit', 'shit', 'shitty', 'piece of shit',
      'pissed', 'pissed off',
      'damn', 'dammit',
      'crap', 'crappy',
      'asshole', 'bastard', 'bitch', 'screw this', 'screw you',
      // Core hostility, legal threat & fury signals
      'furious', 'livid', 'rage', 'outraged', 'enraged', 'sue', 'lawyer', 'attorney',
      'scam', 'cheat', 'fraud', 'pathetic', 'unacceptable', 'disgusting', 'garbage',
      'trash', 'terrible', 'worst', 'hate', 'cancel', 'chargeback', 'robbed', 'ripoff',
      'horrible', 'incompetent', 'ridiculous', 'abysmal', 'scammers', 'liars',
      'demand', 'stolen', 'never again', 'screw', 'fire whoever', 'lawsuit', 'crooks'
    ],
  },
  {
    emotion: 'frustration',
    weight: 1.9,
    words: [
      'frustrated', 'frustrating', 'annoying', 'annoyed', 'stuck', 'looping', 'glitch',
      'bug', 'fail', 'failed', 'useless', 'waste of time', 'again and again', 'tired of',
      'third time', 'repeatedly', 'hours', 'why cant', "why can't", 'doesnt work', "doesn't work",
      'unresolved', 'waiting forever', 'broken', 'confusing', 'slow', 'keeps crashing',
      'ignored', 'still waiting', 'no reply', 'nobody answered', 'tried multiple times',
      'sucks', 'suck', 'crap', 'ridiculous', 'unhelpful'
    ],
  },
  {
    emotion: 'sadness',
    weight: 1.6,
    words: [
      'sad', 'heartbroken', 'depressing', 'depressed', 'hurt', 'disappointed', 'disappointing',
      'regret', 'crying', 'ruined', 'lost', 'devastated', 'sorrow', 'hopeless', 'unfortunate',
      'shattered', 'upset', 'let down', 'grief', 'helpless', 'miss', 'pity', 'tragic'
    ],
  },
  {
    emotion: 'anxiety',
    weight: 1.7,
    words: [
      'anxious', 'worried', 'nervous', 'panic', 'scared', 'terrified', 'alarmed', 'urgent',
      'compromised', 'hacked', 'security', 'danger', 'breach', 'unauthorized', 'suspicious',
      'fear', 'stress', 'stressed', 'emergency', 'help immediately', 'vulnerable', 'risk'
    ],
  },
  {
    emotion: 'happiness',
    weight: 1.9,
    words: [
      'love', 'amazing', 'awesome', 'wonderful', 'fantastic', 'great', 'delighted', 'grateful',
      'thank you', 'thanks', 'kudos', 'excellent', 'brilliant', 'thrilled', 'best', 'helpful',
      'resolved', 'pleasure', 'praise', 'super', 'flawless', 'impressed', 'seamless',
      'appreciate', 'kudos', 'lifesaver', 'perfect', 'exceptional', 'enjoyed', 'glad'
    ],
  },
  {
    emotion: 'surprise',
    weight: 1.5,
    words: [
      'surprise', 'surprised', 'shock', 'shocked', 'unexpected', 'wow', 'unbelievable',
      'stunned', 'astounded', 'didnt expect', "didn't expect", 'out of nowhere', 'suddenly',
      'astonishing', 'extraordinary', 'whaat', 'omg', 'whoa'
    ],
  },
  {
    emotion: 'neutral',
    weight: 1.0,
    words: [
      'status', 'inquiry', 'question', 'check', 'information', 'how do i', 'return policy',
      'hours', 'update', 'details', 'account', 'order number', 'tracking', 'invoice',
      'confirm', 'verify', 'timeline', 'address', 'shipping'
    ],
  },
];

const ESCALATION_TRIGGERS = [
  'sue', 'lawyer', 'attorney', 'legal action', 'chargeback', 'cancel subscription',
  'cancel my account', 'fraud', 'scam', 'unacceptable', 'manager', 'supervisor',
  'escalate', 'bbb', 'better business bureau', 'police', 'stolen', 'broken promise',
  'lost money', 'take to court', 'dispute the charge', 'contact my bank',
  'fuck', 'fucking', 'what the fuck', 'what the hell', 'bullshit', 'pissed off', 'piece of shit'
];

export function analyzeEmotionLocally(
  text: string,
  customerName = 'Customer',
  channel: 'chat' | 'email' | 'sms' | 'ticket' | 'social' = 'chat',
  customerTier: 'VIP' | 'Enterprise' | 'Standard' = 'Standard'
): AnalysisResult {
  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();

  const emotionScores: Record<EmotionType, number> = {
    happiness: 0,
    sadness: 0,
    frustration: 0,
    anger: 0,
    neutral: 1, // base baseline
    surprise: 0,
    anxiety: 0,
  };

  const detectedPhrases: string[] = [];

  // Match words from lexicon
  EMOTION_LEXICON.forEach((item) => {
    item.words.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        emotionScores[item.emotion] += matches.length * item.weight * 14;
        if (!detectedPhrases.includes(word) && detectedPhrases.length < 6) {
          detectedPhrases.push(word);
        }
      }
    });
  });

  // Explicit anger profanities & raw exasperation (fuck, hell, sucks, etc.)
  // Customers utilize these expressions when experiencing acute anger; never censored.
  const rawAngerSignals = [
    'fuck', 'fucking', 'fucked', 'what the fuck', 'wtf',
    'hell', 'what the hell',
    'sucks', 'suck', 'sucked',
    'bullshit', 'shit', 'shitty',
    'pissed', 'pissed off',
    'damn', 'dammit',
    'crap', 'asshole'
  ];
  const detectedRawAnger: string[] = [];
  rawAngerSignals.forEach((sig) => {
    const rx = new RegExp(`\\b${sig}\\b`, 'gi');
    const m = lower.match(rx);
    if (m) {
      detectedRawAnger.push(sig);
      emotionScores.anger += m.length * 35;
      emotionScores.frustration += m.length * 18;
      if (!detectedPhrases.includes(sig)) {
        detectedPhrases.unshift(sig);
      }
    }
  });

  // Caps lock analysis (indicates anger or high urgency)
  const words = cleanText.split(/\s+/);
  const capsWords = words.filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w));
  if (capsWords.length >= 2) {
    emotionScores.anger += capsWords.length * 15;
    emotionScores.frustration += capsWords.length * 10;
    detectedPhrases.push('CAPITALIZED EMPHASIS');
  }

  // Multiple punctuation (!!! or ???)
  const exclamations = (cleanText.match(/!{2,}/g) || []).length;
  const questionMarks = (cleanText.match(/\?{2,}/g) || []).length;
  if (exclamations > 0) {
    emotionScores.anger += exclamations * 12;
    emotionScores.frustration += exclamations * 8;
    emotionScores.happiness += exclamations * 6;
  }
  if (questionMarks > 0) {
    emotionScores.frustration += questionMarks * 10;
    emotionScores.surprise += questionMarks * 8;
  }

  // Check escalation triggers
  let hasEscalationTrigger = false;
  const matchedTriggers: string[] = [];
  ESCALATION_TRIGGERS.forEach((trig) => {
    if (lower.includes(trig)) {
      hasEscalationTrigger = true;
      matchedTriggers.push(trig);
      emotionScores.anger += 25;
      emotionScores.frustration += 18;
      if (!detectedPhrases.includes(trig)) {
        detectedPhrases.push(`Trigger: "${trig}"`);
      }
    }
  });

  // Determine primary emotion
  let primaryEmotion: EmotionType = 'neutral';
  let highestScore = -1;

  for (const emo of Object.keys(emotionScores) as EmotionType[]) {
    if (emotionScores[emo] > highestScore) {
      highestScore = emotionScores[emo];
      primaryEmotion = emo;
    }
  }

  // If very low score, default to neutral
  if (highestScore <= 4 && detectedPhrases.length === 0) {
    primaryEmotion = 'neutral';
    emotionScores.neutral = 40;
  }

  // Calculate confidence percentage (68% - 98%)
  const totalScore = Object.values(emotionScores).reduce((a, b) => a + b, 0);
  let confidence = Math.min(
    98,
    Math.max(68, Math.round(55 + (highestScore / (totalScore || 1)) * 38 + (detectedPhrases.length * 3)))
  );

  if ((primaryEmotion as EmotionType) === 'neutral' && detectedPhrases.length === 0) {
    confidence = 82;
  }

  // Sentiment calculation
  let sentiment: SentimentType = 'neutral';
  let sentimentScore = 0;

  if (primaryEmotion === 'happiness') {
    sentiment = 'positive';
    sentimentScore = Math.min(95, 60 + confidence * 0.35);
  } else if (['anger', 'frustration', 'sadness', 'anxiety'].includes(primaryEmotion)) {
    sentiment = 'negative';
    sentimentScore = -Math.min(95, 50 + confidence * 0.45);
  } else if (primaryEmotion === 'surprise') {
    sentiment = emotionScores.happiness > emotionScores.anger ? 'positive' : 'negative';
    sentimentScore = sentiment === 'positive' ? 45 : -40;
  } else {
    sentiment = 'neutral';
    sentimentScore = 0;
  }

  // Intensity
  let intensity: 'mild' | 'moderate' | 'high' | 'critical' = 'mild';
  if (hasEscalationTrigger || capsWords.length >= 3 || (primaryEmotion === 'anger' && confidence > 85)) {
    intensity = 'critical';
  } else if (highestScore > 45 || confidence > 85) {
    intensity = 'high';
  } else if (highestScore > 20 || confidence > 75) {
    intensity = 'moderate';
  }

  // Secondary emotions list
  const secondaryEmotions: SecondaryEmotion[] = (Object.keys(emotionScores) as EmotionType[])
    .filter((e) => e !== primaryEmotion && emotionScores[e] > 5)
    .sort((a, b) => emotionScores[b] - emotionScores[a])
    .slice(0, 3)
    .map((e) => ({
      emotion: e,
      score: Math.min(90, Math.round((emotionScores[e] / (highestScore || 1)) * 85)),
    }));

  // Supervisor Alert generation
  const isSupervisorAlertRequired =
    primaryEmotion === 'anger' ||
    hasEscalationTrigger ||
    (primaryEmotion === 'frustration' && (confidence > 75 || intensity === 'high' || intensity === 'critical' || customerTier === 'Enterprise')) ||
    (primaryEmotion === 'sadness' && intensity === 'critical');

  let alertSeverity: SupervisorAlert['severity'] = 'low';
  let alertReason = '';
  let recommendedAction = '';
  let suggestedResponse = '';
  let department = 'Customer Support Level 1';

  if (isSupervisorAlertRequired) {
    if (
      matchedTriggers.some((t) => ['sue', 'lawyer', 'attorney', 'legal', 'police'].includes(t)) ||
      (intensity === 'critical' && primaryEmotion === 'anger')
    ) {
      alertSeverity = 'critical';
      department = 'Executive Escalations & Legal Risk';
      alertReason = `Severe customer rage with legal / churn risk triggers detected (${matchedTriggers.join(', ') || 'Extremely hostile tone'}).`;
      recommendedAction = 'Immediate phone outreach by Senior Supervisor within 10 minutes. Pause automated correspondence.';
      suggestedResponse = `"Hello ${customerName}, I am a senior team lead reviewing your ticket. I recognize how deeply upsetting this experience has been, and I am personally taking ownership to resolve this for you immediately."`;
    } else if (hasEscalationTrigger || primaryEmotion === 'anger' || intensity === 'high') {
      alertSeverity = 'high';
      department = 'Tier 2 Support Supervisor';
      alertReason = detectedRawAnger.length > 0
        ? `Customer hostility and explicit exasperation detected ("${detectedRawAnger.slice(0, 3).join('", "')}"). High churn risk.`
        : `Elevated customer hostility / churn risk identified with high confidence (${confidence}%).`;
      recommendedAction = detectedRawAnger.length > 0
        ? 'Engage with de-escalation protocol immediately to address and resolve the customer root grievance.'
        : 'Issue priority callback ticket and grant Level 2 agent authority for concession or full refund.';
      suggestedResponse = `"Dear ${customerName}, please accept our sincere apologies for the trouble you experienced. We are prioritizing your case right now with our senior dispatch team."`;
    } else {
      alertSeverity = 'moderate';
      department = 'Customer Retention & Care';
      alertReason = `Customer experiencing prolonged frustration or friction (${detectedPhrases.join(', ') || 'Repeated attempts'}).`;
      recommendedAction = 'Review interaction log, acknowledge delay, and offer expedited resolution within 30 minutes.';
      suggestedResponse = `"Hi ${customerName}, we hear your frustration with this delay, and we want to get this fixed for you right away without any more back-and-forth."`;
    }
  }

  const supervisorAlert: SupervisorAlert = {
    required: isSupervisorAlertRequired,
    severity: alertSeverity,
    reason: alertReason || 'Standard interaction, no supervisor escalation required.',
    recommendedAction: recommendedAction || 'Standard agent response workflow. Maintain friendly and helpful tone.',
    department,
    suggestedResponse:
      suggestedResponse ||
      `"Hi ${customerName}, thank you for reaching out to us! We are happy to assist you today. Please let us know if there is anything else we can do to help."`,
  };

  // Explanation text
  let explanation = '';
  switch (primaryEmotion) {
    case 'anger':
      explanation = detectedRawAnger.length > 0
        ? `Customer demonstrates acute anger and vocal exasperation ("${detectedRawAnger.slice(0, 3).join('", "')}"). Immediate supervisory de-escalation recommended.`
        : `Customer demonstrates acute anger driven by perceived failure or mistreatment. Emphatic language and key escalation signals detected.`;
      break;
    case 'frustration':
      explanation = detectedRawAnger.length > 0
        ? `Customer is experiencing severe friction and vocal exasperation ("${detectedRawAnger.slice(0, 3).join('", "')}"). Priority resolution required.`
        : `Customer is facing barriers or repeated obstacles causing notable irritation and loss of patience.`;
      break;
    case 'happiness':
      explanation = `Customer expresses gratitude, satisfaction, and positive engagement with the service or product.`;
      break;
    case 'sadness':
      explanation = `Customer conveys disappointment, regret, or feeling let down by an outcome or service shortfall.`;
      break;
    case 'anxiety':
      explanation = `Customer exhibits acute stress or worry regarding account safety, urgency, or critical deadlines.`;
      break;
    case 'surprise':
      explanation = `Customer is responding to an unforeseen or striking occurrence, with notable emotional inflection.`;
      break;
    default:
      explanation = `Customer query is predominantly factual and informational without strong emotional polarization.`;
      break;
  }

  return {
    id: 'emo_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
    text: cleanText,
    customerName,
    customerTier,
    channel,
    timestamp: new Date().toISOString(),
    primaryEmotion,
    secondaryEmotions,
    confidence,
    sentiment,
    sentimentScore,
    intensity,
    keyPhrases: detectedPhrases.length > 0 ? detectedPhrases : ['Standard tone', 'Inquiry format'],
    explanation,
    supervisorAlert,
    source: 'nlp-engine',
  };
}

/**
 * Sends text to the server-side emotion analysis API route,
 * falling back seamlessly to the resilient local NLP engine if unavailable.
 */
export async function analyzeEmotion(
  text: string,
  customerName = 'Customer',
  channel: 'chat' | 'email' | 'sms' | 'ticket' | 'social' = 'chat',
  customerTier: 'VIP' | 'Enterprise' | 'Standard' = 'Standard'
): Promise<AnalysisResult> {
  try {
    const res = await fetch('/api/analyze-emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, customerName, channel, customerTier }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.primaryEmotion) {
        return data as AnalysisResult;
      }
    }
  } catch {
    // API endpoint unavailable or offline, continue to fallback
  }

  // Reliable fallback
  return analyzeEmotionLocally(text, customerName, channel, customerTier);
}
