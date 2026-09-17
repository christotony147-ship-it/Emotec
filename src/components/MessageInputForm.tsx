import React, { useState } from 'react';
import { Send, Sparkles, RotateCcw, AlertCircle, MessageSquareText } from 'lucide-react';

interface PresetMessage {
  label: string;
  emoji: string;
  text: string;
  customerName: string;
  customerTier: 'VIP' | 'Enterprise' | 'Standard';
  channel: 'chat' | 'email' | 'sms' | 'ticket' | 'social';
}

const PRESET_MESSAGES: PresetMessage[] = [
  {
    label: 'Raw Anger / Profanity',
    emoji: '🤬',
    customerName: 'Marcus Bennett',
    customerTier: 'VIP',
    channel: 'chat',
    text: "What the hell is going on with your system? This service fucking sucks and nobody is answering my ticket! Fix this bullshit right now or I'm canceling my account!",
  },
  {
    label: 'Rage / Chargeback Threat',
    emoji: '😡',
    customerName: 'Jonathan Reed',
    customerTier: 'VIP',
    channel: 'chat',
    text: "This is completely unacceptable! You charged my card twice for $290 and your rep hung up on me! Refund me immediately or I'm disputing this with my bank and calling my attorney!",
  },
  {
    label: 'Frustrated / Looping Bug',
    emoji: '😤',
    customerName: 'Kelly Simmons',
    customerTier: 'Standard',
    channel: 'ticket',
    text: "I have been stuck in this endless login verification loop for 3 hours now. Every time I submit the code it resets. Why is this so difficult? I need access to my files right now!",
  },
  {
    label: 'Delighted Customer Praise',
    emoji: '😊',
    customerName: 'Maya Lin',
    customerTier: 'Enterprise',
    channel: 'email',
    text: "Just wanted to express my gratitude to Alex in customer support! He helped our engineering team deploy the webhook update seamlessly. Truly exceptional and delightful service!",
  },
  {
    label: 'Heartbroken / Data Loss',
    emoji: '😔',
    customerName: 'Arthur Vance',
    customerTier: 'Standard',
    channel: 'email',
    text: "I'm heartbroken to learn that our team's project archive from last year was permanently deleted during the server migration. We lost weeks of work and research.",
  },
  {
    label: 'Account Security Anxiety',
    emoji: '😰',
    customerName: 'Rebecca Frost',
    customerTier: 'VIP',
    channel: 'sms',
    text: "EMERGENCY: I just received 4 security codes I never requested and an alert that my primary email was changed! Please freeze my account right away!",
  },
  {
    label: 'Neutral Business Inquiry',
    emoji: '😐',
    customerName: 'Derek Taylor',
    customerTier: 'Standard',
    channel: 'chat',
    text: "Hello, could you please provide the tracking number for order #49102 and confirm if standard deliveries require a signature upon arrival?",
  },
];

interface Props {
  onSubmit: (text: string, customerName: string, channel: 'chat' | 'email' | 'sms' | 'ticket' | 'social', customerTier: 'VIP' | 'Enterprise' | 'Standard') => Promise<void>;
  isLoading: boolean;
}

export const MessageInputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [customerName, setCustomerName] = useState('Alex Rivera');
  const [channel, setChannel] = useState<'chat' | 'email' | 'sms' | 'ticket' | 'social'>('chat');
  const [customerTier, setCustomerTier] = useState<'VIP' | 'Enterprise' | 'Standard'>('Standard');
  const [error, setError] = useState('');
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please type or select a customer message to analyze.');
      return;
    }
    setError('');
    await onSubmit(text, customerName, channel, customerTier);
  };

  const handleSelectPreset = async (preset: PresetMessage, index: number) => {
    setText(preset.text);
    setCustomerName(preset.customerName);
    setChannel(preset.channel);
    setCustomerTier(preset.customerTier);
    setError('');
    setActivePresetIndex(index);
    // Instant 1-click execution: immediately run emotion analysis so active results refresh
    await onSubmit(preset.text, preset.customerName, preset.channel, preset.customerTier);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div
      id="message-input-container"
      className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 sm:p-6 backdrop-blur-md shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-indigo-400" />
            Customer Text Message Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Input incoming customer messages to detect emotions, confidence, polarity, and supervisor escalation triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
          <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono text-[11px] border border-slate-700">
            Ctrl+Enter to Analyze
          </span>
        </div>
      </div>

      {/* Quick Demo Preset Buttons for Hackathon */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Hackathon Demo Presets (1-Click Instant Analysis):
          </label>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click any emotion card to test in real-time
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {PRESET_MESSAGES.map((preset, idx) => (
            <button
              key={idx}
              id={`preset-btn-${idx}`}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectPreset(preset, idx)}
              className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between group disabled:opacity-60 cursor-pointer ${
                activePresetIndex === idx && text === preset.text
                  ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/80 hover:border-indigo-500/50'
              }`}
              title={preset.text}
            >
              <div className="flex items-center gap-1.5 font-medium text-slate-100 group-hover:text-indigo-300">
                <span className="text-lg">{preset.emoji}</span>
                <span className="truncate font-semibold">{preset.label}</span>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                <span className="uppercase font-semibold text-slate-300">{preset.customerTier}</span>
                <span className="text-indigo-300 opacity-80 group-hover:opacity-100 font-medium">⚡ 1-Click</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Context Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Customer Name
            </label>
            <input
              id="input-customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Channel
            </label>
            <select
              id="select-channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value as unknown as typeof channel)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="chat">Live Chat</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="ticket">Support Ticket</option>
              <option value="social">Social Media / Review</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Account Tier
            </label>
            <select
              id="select-customer-tier"
              value={customerTier}
              onChange={(e) => setCustomerTier(e.target.value as unknown as typeof customerTier)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Standard">Standard Tier</option>
              <option value="VIP">VIP Tier</option>
              <option value="Enterprise">Enterprise Tier</option>
            </select>
          </div>
        </div>

        {/* Text Input Message */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="input-message-text" className="text-xs font-medium text-slate-300">
              Customer Message Text:
            </label>
            <span className="text-[11px] text-slate-400">
              {text.length} characters
            </span>
          </div>

          <textarea
            id="input-message-text"
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste the customer's text message here (e.g. 'What the hell is this? This service sucks!')..."
            className="w-full bg-slate-950/90 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
          />

          {error && (
            <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Submit & Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              id="btn-clear-text"
              type="button"
              onClick={() => {
                setText('');
                setError('');
              }}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Input
            </button>
          </div>

          <button
            id="btn-submit-analysis"
            type="submit"
            disabled={isLoading || !text.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Customer Emotion...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Submit & Detect Emotion
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
