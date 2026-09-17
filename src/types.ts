export type EmotionType =
  | 'happiness'
  | 'sadness'
  | 'frustration'
  | 'anger'
  | 'neutral'
  | 'surprise'
  | 'anxiety';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export type AlertSeverity = 'critical' | 'high' | 'moderate' | 'low';

export interface SupervisorAlert {
  required: boolean;
  severity: AlertSeverity;
  reason: string;
  recommendedAction: string;
  department: string;
  suggestedResponse: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface SecondaryEmotion {
  emotion: EmotionType;
  score: number; // 0 to 100
}

export interface AnalysisResult {
  id: string;
  text: string;
  customerName: string;
  customerTier: 'VIP' | 'Enterprise' | 'Standard';
  channel: 'chat' | 'email' | 'sms' | 'ticket' | 'social';
  timestamp: string;
  primaryEmotion: EmotionType;
  secondaryEmotions: SecondaryEmotion[];
  confidence: number; // 0 to 100 percentage
  sentiment: SentimentType;
  sentimentScore: number; // -100 to +100
  intensity: 'mild' | 'moderate' | 'high' | 'critical';
  keyPhrases: string[];
  explanation: string;
  supervisorAlert: SupervisorAlert;
  source: 'gemini' | 'nlp-engine';
}

export interface EmotionThemeConfig {
  label: string;
  emoji: string;
  bgCard: string;
  borderCard: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  lightBg: string;
  glowColor: string;
  bannerBg: string;
}
