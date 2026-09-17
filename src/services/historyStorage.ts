import { AnalysisResult } from '../types';

const STORAGE_KEY = 'emotech_analysis_history_v1';

// Pre-seeded realistic demo messages for immediate hackathon trend visualization
const SEED_HISTORY: AnalysisResult[] = [
  {
    id: 'emo_seed_01',
    text: "This is the THIRD time your app crashed while I was paying! My account was debited $140 and I have no confirmation! Absolutely unacceptable, refund me NOW or I will dispute this with my bank!",
    customerName: 'Marcus Vance',
    customerTier: 'VIP',
    channel: 'chat',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    primaryEmotion: 'anger',
    secondaryEmotions: [
      { emotion: 'frustration', score: 85 },
      { emotion: 'anxiety', score: 55 }
    ],
    confidence: 96,
    sentiment: 'negative',
    sentimentScore: -92,
    intensity: 'critical',
    keyPhrases: ['third time', 'unacceptable', 'dispute this with my bank', 'refund me NOW'],
    explanation: 'Extreme anger triggered by repeated financial transaction failure and threatened chargeback.',
    supervisorAlert: {
      required: true,
      severity: 'critical',
      reason: 'Threatened bank chargeback and double charge with VIP customer tier.',
      recommendedAction: 'Immediate phone callback within 10 mins by Senior Financial Escalations Lead.',
      department: 'Executive Escalations & Finance',
      suggestedResponse: '"Hello Marcus, I am a Senior Operations Lead taking personal ownership of your account. We have verified the transaction glitch and initiated an immediate reversal plus a $30 courtesy credit."',
      acknowledged: false,
    },
    source: 'nlp-engine',
  },
  {
    id: 'emo_seed_02',
    text: "I just wanted to say that Sarah from tech support was phenomenal! She resolved my custom domain SSL certificate issue in under 5 minutes with so much patience. Best customer service ever!",
    customerName: 'Elena Rostova',
    customerTier: 'Enterprise',
    channel: 'ticket',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    primaryEmotion: 'happiness',
    secondaryEmotions: [
      { emotion: 'surprise', score: 45 }
    ],
    confidence: 98,
    sentiment: 'positive',
    sentimentScore: 95,
    intensity: 'high',
    keyPhrases: ['phenomenal', 'best customer service ever', 'patience', 'under 5 minutes'],
    explanation: 'High gratitude and delight regarding fast resolution from front-line support staff.',
    supervisorAlert: {
      required: false,
      severity: 'low',
      reason: 'Positive feedback, no negative escalation required.',
      recommendedAction: 'Log commendation in agent Sarah\'s performance profile and send thank you email.',
      department: 'Customer Experience & QA',
      suggestedResponse: '"Dear Elena, thank you so much for the glowing review! We have passed your kind words directly to Sarah and leadership team."',
    },
    source: 'nlp-engine',
  },
  {
    id: 'emo_seed_03',
    text: "I've been trying to reset my two-factor authentication for 4 days now and each time the support link gives a 404 error. I'm locked out of my work files and missing my team deadlines.",
    customerName: 'David Chen',
    customerTier: 'Standard',
    channel: 'email',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    primaryEmotion: 'frustration',
    secondaryEmotions: [
      { emotion: 'anxiety', score: 70 },
      { emotion: 'sadness', score: 40 }
    ],
    confidence: 92,
    sentiment: 'negative',
    sentimentScore: -78,
    intensity: 'high',
    keyPhrases: ['4 days now', 'locked out', 'missing team deadlines', '404 error'],
    explanation: 'Prolonged blockage of core work access causing compounding frustration and professional anxiety.',
    supervisorAlert: {
      required: true,
      severity: 'high',
      reason: 'Multi-day lockout affecting workplace productivity.',
      recommendedAction: 'Expedite manual identity verification and dispatch direct phone PIN bypass.',
      department: 'Identity & Security Operations',
      suggestedResponse: '"Hi David, we deeply apologize for the link error preventing you from working. We have generated a direct secure verification bypass for you right now."',
      acknowledged: true,
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      acknowledgedBy: 'Supervisor Ray (ID #402)',
    },
    source: 'nlp-engine',
  },
  {
    id: 'emo_seed_04',
    text: "I'm really heartbroken to hear that my project data could not be recovered from the legacy server backup. We put 6 months of research into those spreadsheets.",
    customerName: 'Dr. Clara Higgins',
    customerTier: 'Enterprise',
    channel: 'email',
    timestamp: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    primaryEmotion: 'sadness',
    secondaryEmotions: [
      { emotion: 'frustration', score: 60 }
    ],
    confidence: 94,
    sentiment: 'negative',
    sentimentScore: -84,
    intensity: 'high',
    keyPhrases: ['heartbroken', 'could not be recovered', '6 months of research', 'lost data'],
    explanation: 'Customer experiencing deep sorrow and loss over irreversible research work disruption.',
    supervisorAlert: {
      required: true,
      severity: 'high',
      reason: 'Irreplaceable enterprise data loss event with high emotional impact.',
      recommendedAction: 'Engage Senior Database Reliability Engineer for deep raw storage recovery sweep.',
      department: 'Executive Support & Data Recovery',
      suggestedResponse: '"Dear Dr. Higgins, we understand the immense value of your 6 months of research. Our Senior Infrastructure Director has personally stepped in to attempt raw disk sector retrieval."',
      acknowledged: true,
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      acknowledgedBy: 'Supervisor Ray (ID #402)',
    },
    source: 'nlp-engine',
  },
  {
    id: 'emo_seed_05',
    text: "Hello! Could someone let me know if your API supports Webhook signatures with HMAC SHA-256? Also what are the current rate limits on the starter tier?",
    customerName: 'Samir Patel',
    customerTier: 'Standard',
    channel: 'chat',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    primaryEmotion: 'neutral',
    secondaryEmotions: [],
    confidence: 89,
    sentiment: 'neutral',
    sentimentScore: 0,
    intensity: 'mild',
    keyPhrases: ['API supports', 'Webhook signatures', 'rate limits', 'starter tier'],
    explanation: 'Objective technical inquiry regarding developer documentation and rate limits.',
    supervisorAlert: {
      required: false,
      severity: 'low',
      reason: 'Standard developer inquiry, zero escalation required.',
      recommendedAction: 'Provide API docs link and developer portal walkthrough.',
      department: 'Developer Relations',
      suggestedResponse: '"Hi Samir! Yes, our webhooks sign all payloads using HMAC SHA-256 with your private webhook secret. Our starter tier allows 1,200 req/min."',
    },
    source: 'nlp-engine',
  },
  {
    id: 'emo_seed_06',
    text: "Wait, wow! You guys upgraded my subscription to pro for free during the downtime window? I was not expecting that at all, super surprised and touched!",
    customerName: 'Chloe Bennett',
    customerTier: 'Standard',
    channel: 'social',
    timestamp: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    primaryEmotion: 'surprise',
    secondaryEmotions: [
      { emotion: 'happiness', score: 85 }
    ],
    confidence: 93,
    sentiment: 'positive',
    sentimentScore: 82,
    intensity: 'high',
    keyPhrases: ['wow', 'upgraded for free', 'not expecting that', 'super surprised'],
    explanation: 'Pleasant surprise resulting from proactive goodwill gesture by company.',
    supervisorAlert: {
      required: false,
      severity: 'low',
      reason: 'Positive delight event.',
      recommendedAction: 'Retweet or share with social media community team.',
      department: 'Brand Marketing',
      suggestedResponse: '"We love to surprise our community! Thank you for sticking with us during the maintenance Chloe!"',
    },
    source: 'nlp-engine',
  },
  {
    id: 'emo_seed_07',
    text: "URGENT: Someone just logged into my account from an IP in Russia! I received a password changed alert and I did not authorize this! Please freeze my account right away!",
    customerName: 'Arthur Pendelton',
    customerTier: 'VIP',
    channel: 'sms',
    timestamp: new Date(Date.now() - 1000 * 60 * 390).toISOString(),
    primaryEmotion: 'anxiety',
    secondaryEmotions: [
      { emotion: 'anger', score: 45 }
    ],
    confidence: 95,
    sentiment: 'negative',
    sentimentScore: -88,
    intensity: 'critical',
    keyPhrases: ['URGENT', 'logged in from Russia', 'password changed alert', 'freeze account right away'],
    explanation: 'Acute security anxiety and account takeover alarm requiring emergency lockout.',
    supervisorAlert: {
      required: true,
      severity: 'critical',
      reason: 'Active security breach / account takeover report.',
      recommendedAction: 'Initiate emergency credential revocation and session invalidation immediately.',
      department: 'Trust & Safety / Security Incident Team',
      suggestedResponse: '"Arthur, we have immediately locked all active sessions and placed your account in emergency protection mode. Our security team will contact your verified phone number within 5 minutes."',
      acknowledged: true,
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 385).toISOString(),
      acknowledgedBy: 'Security Lead Alice',
    },
    source: 'nlp-engine',
  }
];

export function getStoredHistory(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HISTORY));
      return SEED_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SEED_HISTORY;
  } catch {
    return SEED_HISTORY;
  }
}

export function saveAnalysisToHistory(result: AnalysisResult): AnalysisResult[] {
  try {
    const current = getStoredHistory();
    // Prepend new result
    const updated = [result, ...current.filter((item) => item.id !== result.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Also attempt backend synchronization if API exists
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    }).catch(() => {
      // Ignored for resilience
    });

    return updated;
  } catch {
    return [result];
  }
}

export function updateAlertAcknowledgment(
  id: string,
  acknowledgedBy: string
): AnalysisResult[] {
  try {
    const current = getStoredHistory();
    const updated = current.map((item) => {
      if (item.id === id && item.supervisorAlert) {
        return {
          ...item,
          supervisorAlert: {
            ...item.supervisorAlert,
            acknowledged: true,
            acknowledgedAt: new Date().toISOString(),
            acknowledgedBy,
          },
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getStoredHistory();
  }
}

export function clearHistory(): AnalysisResult[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch {
    return [];
  }
}

export function resetToSeedHistory(): AnalysisResult[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HISTORY));
    return SEED_HISTORY;
  } catch {
    return SEED_HISTORY;
  }
}
