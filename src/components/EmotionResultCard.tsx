import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { EMOTION_THEMES, SEVERITY_CONFIG } from '../utils/emotionThemes';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Clock,
  User,
  Activity,
  Layers,
  PhoneForwarded,
} from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onAcknowledgeAlert?: (id: string) => void;
}

export const EmotionResultCard: React.FC<Props> = ({ result, onAcknowledgeAlert }) => {
  const [copied, setCopied] = useState(false);
  const theme = EMOTION_THEMES[result.primaryEmotion] || EMOTION_THEMES.neutral;
  const alert = result.supervisorAlert;
  const severityCfg = alert?.required ? SEVERITY_CONFIG[alert.severity] : null;

  const handleCopySummary = () => {
    const summary = `[emotech Analysis]
Customer: ${result.customerName} (${result.channel.toUpperCase()})
Primary Emotion: ${theme.label} (${result.confidence}% Confidence)
Sentiment: ${result.sentiment.toUpperCase()} (${result.sentimentScore > 0 ? '+' : ''}${result.sentimentScore}/100)
Intensity: ${result.intensity.toUpperCase()}
Key Phrases: ${result.keyPhrases.join(', ')}
Supervisor Escalation: ${alert.required ? `YES - [${alert.severity.toUpperCase()}] ${alert.reason}` : 'No escalation required'}
Rationale: ${result.explanation}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="emotion-result-card"
      className={`w-full rounded-2xl border transition-all duration-300 shadow-lg overflow-hidden ${theme.bgCard} ${theme.borderCard} bg-slate-900/60 backdrop-blur-md`}
      style={{
        boxShadow: `0 10px 30px -10px ${theme.glowColor}`,
      }}
    >
      {/* Top Header Strip with Color Coding */}
      <div
        className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          result.primaryEmotion === 'anger'
            ? 'bg-rose-950/80 border-rose-800/60 text-rose-100'
            : result.primaryEmotion === 'frustration'
            ? 'bg-amber-950/80 border-amber-800/60 text-amber-100'
            : result.primaryEmotion === 'happiness'
            ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-100'
            : result.primaryEmotion === 'sadness'
            ? 'bg-indigo-950/80 border-indigo-800/60 text-indigo-100'
            : result.primaryEmotion === 'anxiety'
            ? 'bg-purple-950/80 border-purple-800/60 text-purple-100'
            : 'bg-slate-900/80 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label={theme.label}>
            {theme.emoji}
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Detected Emotion Result
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/10 border border-white/20">
            {result.intensity.toUpperCase()} INTENSITY
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            id="btn-copy-analysis-summary"
            onClick={handleCopySummary}
            className="text-xs px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Copy formatted analysis"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-6">
        {/* Hero Emotion & Confidence Meter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left: Big Emotion Title */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-5xl select-none" role="img" aria-label={theme.label}>
                {theme.emoji}
              </span>
              <div>
                <h3
                  id="primary-emotion-label"
                  className="text-3xl font-extrabold tracking-tight text-white capitalize flex items-center gap-2"
                >
                  {result.primaryEmotion}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${theme.badgeBg} ${theme.badgeText}`}>
                    Primary
                  </span>
                </h3>
                <p className="text-sm text-slate-300 mt-1">{result.explanation}</p>
              </div>
            </div>

            {/* Customer metadata tag */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 bg-slate-800/90 px-2.5 py-1 rounded-md border border-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Customer: <strong className="text-white">{result.customerName}</strong>
              </span>
              <span className="flex items-center gap-1 bg-slate-800/90 px-2.5 py-1 rounded-md border border-slate-700">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Tier: <strong className="text-white">{result.customerTier}</strong>
              </span>
              <span className="flex items-center gap-1 bg-slate-800/90 px-2.5 py-1 rounded-md border border-slate-700">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Channel: <strong className="text-white uppercase">{result.channel}</strong>
              </span>
            </div>
          </div>

          {/* Right: Confidence Score Gauge */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Confidence Score
            </span>
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* SVG circular progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeDasharray={`${result.confidence}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke={theme.accentColor}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span id="confidence-score-value" className="text-2xl font-black text-white">
                  {result.confidence}%
                </span>
                <span className="text-[10px] text-slate-400">Certainty</span>
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-400 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {result.confidence >= 85 ? 'High Precision' : 'Moderate Confidence'}
            </span>
          </div>
        </div>

        {/* Analyzed Message Quote Box */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            Analyzed Customer Text
          </div>
          <p className="text-slate-200 italic font-mono text-sm leading-relaxed">
            "{result.text}"
          </p>
        </div>

        {/* Sentiment Polarity & Secondary Nuances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sentiment Meter */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Sentiment Polarity
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                  result.sentiment === 'positive'
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                    : result.sentiment === 'negative'
                    ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {result.sentiment} ({result.sentimentScore > 0 ? '+' : ''}{result.sentimentScore})
              </span>
            </div>

            {/* Polarity Slider Bar */}
            <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="w-1/2 bg-gradient-to-r from-rose-600 to-amber-500 opacity-60"></div>
              <div className="w-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60"></div>
              {/* Marker */}
              <div
                className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-md transform -translate-x-1/2"
                style={{
                  left: `${((result.sentimentScore + 100) / 200) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Very Negative (-100)</span>
              <span>Neutral (0)</span>
              <span>Very Positive (+100)</span>
            </div>
          </div>

          {/* Key Trigger Phrases */}
          <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Emotional Keyword Signals
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.keyPhrases.map((phrase, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-md"
                >
                  "{phrase}"
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Emotions Nuances */}
        {result.secondaryEmotions.length > 0 && (
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Co-Occurring Secondary Emotions
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.secondaryEmotions.map((sec, idx) => {
                const secTheme = EMOTION_THEMES[sec.emotion] || EMOTION_THEMES.neutral;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60"
                  >
                    <span className="text-xs text-slate-200 flex items-center gap-1 capitalize">
                      <span>{secTheme.emoji}</span> {sec.emotion}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {sec.score}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Supervisor Alert Action Card */}
        {alert && alert.required && (
          <div
            id="result-supervisor-alert-box"
            className={`p-4 rounded-xl border ${
              alert.severity === 'critical'
                ? 'bg-red-950/70 border-red-500/80'
                : 'bg-amber-950/70 border-amber-500/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-sm font-bold text-white">
                  Supervisor Action Required ({alert.department})
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded tracking-wide uppercase ${
                  severityCfg?.bg || 'bg-red-600 text-white'
                }`}
              >
                {severityCfg?.label || alert.severity.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-200">
              <div>
                <strong className="text-amber-300">Escalation Reason:</strong> {alert.reason}
              </div>
              <div>
                <strong className="text-emerald-300">Protocol:</strong> {alert.recommendedAction}
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-white/10">
                <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <PhoneForwarded className="w-3.5 h-3.5 text-cyan-400" />
                  Recommended De-Escalation Script:
                </div>
                <p className="italic text-slate-200">{alert.suggestedResponse}</p>
              </div>
            </div>

            {onAcknowledgeAlert && !alert.acknowledged && (
              <div className="mt-3 flex justify-end">
                <button
                  id="btn-card-acknowledge"
                  onClick={() => onAcknowledgeAlert(result.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Handled & Acknowledge
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
