import { GoogleGenAI, Type } from '@google/genai';
import { analyzeEmotionLocally } from '../src/services/emotionAnalyzer.ts';

export interface AnalyzePayload {
  text: string;
  customerName?: string;
  channel?: 'chat' | 'email' | 'sms' | 'ticket' | 'social';
  customerTier?: 'VIP' | 'Enterprise' | 'Standard';
}

let geminiDisabled = false;

export async function processEmotionAnalysis(payload: AnalyzePayload) {
  const text = payload.text || '';
  const customerName = payload.customerName || 'Customer';
  const channel = payload.channel || 'chat';
  const customerTier = payload.customerTier || 'Standard';

  // Try Gemini if API key is configured and not previously flagged as denied/failing
  if (process.env.GEMINI_API_KEY && !geminiDisabled) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const prompt = `Analyze the customer emotion and sentiment of the following message:
Message: "${text.replace(/"/g, '\\"')}"
Customer: ${customerName} (${customerTier} Tier, via ${channel})

CRITICAL GUIDELINES:
- Do NOT censor, redact, or mask customer words (e.g. "fuck", "hell", "sucks", "bullshit", "shit"). In customer service de-escalation, verbatim words are essential indicators of acute customer anger, distress, and churn risk.
- Classify explicit customer profanity and vocal exasperation as ANGER (or high FRUSTRATION), with HIGH or CRITICAL intensity.
- Classify the primary emotion accurately into one of: happiness, sadness, frustration, anger, neutral, surprise, anxiety.
- Assess confidence score (60 to 99), sentiment (positive, negative, neutral), intensity (mild, moderate, high, critical), key emotional trigger phrases, rationale, and whether a Supervisor Alert is required (Anger, severe frustration, threats of cancellation/lawyer/chargeback require immediate supervisor escalation).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              primaryEmotion: {
                type: Type.STRING,
                description: 'One of: happiness, sadness, frustration, anger, neutral, surprise, anxiety',
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence score percentage from 60 to 99',
              },
              sentiment: {
                type: Type.STRING,
                description: 'positive, negative, or neutral',
              },
              sentimentScore: {
                type: Type.NUMBER,
                description: '-100 to 100',
              },
              intensity: {
                type: Type.STRING,
                description: 'mild, moderate, high, critical',
              },
              keyPhrases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              explanation: {
                type: Type.STRING,
              },
              supervisorAlert: {
                type: Type.OBJECT,
                properties: {
                  required: { type: Type.BOOLEAN },
                  severity: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  recommendedAction: { type: Type.STRING },
                  department: { type: Type.STRING },
                  suggestedResponse: { type: Type.STRING },
                },
                required: ['required', 'severity', 'reason', 'recommendedAction', 'department', 'suggestedResponse'],
              },
            },
            required: ['primaryEmotion', 'confidence', 'sentiment', 'sentimentScore', 'intensity', 'keyPhrases', 'explanation', 'supervisorAlert'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          id: 'emo_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
          text,
          customerName,
          customerTier,
          channel,
          timestamp: new Date().toISOString(),
          ...parsed,
          source: 'gemini',
        };
      }
    } catch (err: unknown) {
      console.warn('Gemini API unavailable or denied, switching to high-precision NLP engine:', err instanceof Error ? err.message : String(err));
      geminiDisabled = true;
    }
  }

  // Resilient, instantaneous high-precision NLP emotion analysis
  return analyzeEmotionLocally(text, customerName, channel, customerTier);
}
