/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult } from './types';
import { analyzeEmotion } from './services/emotionAnalyzer';
import {
  getStoredHistory,
  saveAnalysisToHistory,
  updateAlertAcknowledgment,
  resetToSeedHistory,
  clearHistory,
} from './services/historyStorage';
import { Navbar } from './components/Navbar';
import { SupervisorAlertBanner } from './components/SupervisorAlertBanner';
import { MessageInputForm } from './components/MessageInputForm';
import { EmotionResultCard } from './components/EmotionResultCard';
import { TrendMonitoringDashboard } from './components/TrendMonitoringDashboard';
import { SupervisorAlertQueue } from './components/SupervisorAlertQueue';
import { Activity, ShieldCheck, Database, Info, Sparkles, X, CheckCircle2, History } from 'lucide-react';

export default function App() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyzer' | 'trends' | 'alerts'>('analyzer');
  const [inspectModalResult, setInspectModalResult] = useState<AnalysisResult | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);
  const resultSectionRef = useRef<HTMLDivElement>(null);

  // Initialize history on boot
  useEffect(() => {
    const loaded = getStoredHistory();
    setHistory(loaded);
    if (loaded.length > 0 && !currentResult) {
      setCurrentResult(loaded[0]);
    }
  }, []);

  // Compute pending unacknowledged alerts for banner and badge
  const pendingAlerts = history.filter(
    (item) => item.supervisorAlert?.required && !item.supervisorAlert?.acknowledged
  );
  const latestPendingAlert = pendingAlerts.length > 0 ? pendingAlerts[0] : null;

  // Handle new message analysis
  const handleAnalyzeMessage = async (
    text: string,
    customerName: string,
    channel: 'chat' | 'email' | 'sms' | 'ticket' | 'social',
    customerTier: 'VIP' | 'Enterprise' | 'Standard'
  ) => {
    setIsLoading(true);
    try {
      const result = await analyzeEmotion(text, customerName, channel, customerTier);
      // Immediately set the active result
      setCurrentResult(result);
      const updatedHistory = saveAnalysisToHistory(result);
      setHistory(updatedHistory);
      // Flash the live update indicator
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 3500);
      // Ensure smooth scroll so user sees the newly analyzed result
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      console.error('Error analyzing emotion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = (id: string) => {
    const updated = updateAlertAcknowledgment(id, 'Supervisor On-Duty');
    setHistory(updated);
    if (currentResult && currentResult.id === id) {
      setCurrentResult({
        ...currentResult,
        supervisorAlert: {
          ...currentResult.supervisorAlert,
          acknowledged: true,
          acknowledgedAt: new Date().toISOString(),
          acknowledgedBy: 'Supervisor On-Duty',
        },
      });
    }
    if (inspectModalResult && inspectModalResult.id === id) {
      setInspectModalResult({
        ...inspectModalResult,
        supervisorAlert: {
          ...inspectModalResult.supervisorAlert,
          acknowledged: true,
          acknowledgedAt: new Date().toISOString(),
          acknowledgedBy: 'Supervisor On-Duty',
        },
      });
    }
  };

  const handleResetSeed = () => {
    const seeded = resetToSeedHistory();
    setHistory(seeded);
    if (seeded.length > 0) {
      setCurrentResult(seeded[0]);
    }
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setCurrentResult(null);
  };

  const handleInspect = (result: AnalysisResult) => {
    setInspectModalResult(result);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Supervisor Alert Banner for Active Escalations */}
      {latestPendingAlert && (
        <SupervisorAlertBanner
          alertResult={latestPendingAlert}
          onAcknowledge={handleAcknowledgeAlert}
          onViewDetails={handleInspect}
        />
      )}

      {/* 2. Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingAlertsCount={pendingAlerts.length}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'analyzer' && (
          <div className="space-y-6">
            {/* Input Form */}
            <MessageInputForm
              onSubmit={handleAnalyzeMessage}
              isLoading={isLoading}
            />

            {/* Color-Coded Emotion Result Card */}
            {currentResult && (
              <div ref={resultSectionRef} className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Active Emotion Analysis Result
                    </h3>
                    {justUpdated && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Live Analyzed Just Now
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>
                      Timestamp: {new Date(currentResult.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                      ID: {currentResult.id}
                    </span>
                  </div>
                </div>

                {/* Quick Switcher for Latest vs Previous Analyses */}
                {history.length > 1 && (
                  <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-xs overflow-x-auto">
                    <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1 pl-1 shrink-0">
                      <History className="w-3.5 h-3.5 text-indigo-400" />
                      Recent Analyses:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {history.slice(0, 5).map((item, idx) => {
                        const isSelected = currentResult.id === item.id;
                        const isLatest = idx === 0;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCurrentResult(item)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                          >
                            <span>{item.primaryEmotion === 'anger' ? '😡' : item.primaryEmotion === 'happiness' ? '😊' : item.primaryEmotion === 'frustration' ? '😤' : item.primaryEmotion === 'sadness' ? '😔' : item.primaryEmotion === 'anxiety' ? '😰' : '😐'}</span>
                            <span className="capitalize">{item.primaryEmotion}</span>
                            {isLatest && (
                              <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/30 text-indigo-300'}`}>
                                Latest
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <EmotionResultCard
                  key={currentResult.id}
                  result={currentResult}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <TrendMonitoringDashboard
            history={history}
            onSelectResult={handleInspect}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResetSeedData={handleResetSeed}
            onClearHistory={handleClear}
          />
        )}

        {activeTab === 'alerts' && (
          <SupervisorAlertQueue
            alerts={history.filter((h) => h.supervisorAlert?.required)}
            onAcknowledge={handleAcknowledgeAlert}
            onInspect={handleInspect}
          />
        )}
      </main>

      {/* Detail Inspection Modal */}
      {inspectModalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6">
            <button
              id="btn-close-inspect-modal"
              onClick={() => setInspectModalResult(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Incident Details & Emotion Analysis</h3>
              <p className="text-xs text-slate-400">Record ID: {inspectModalResult.id}</p>
            </div>

            <EmotionResultCard
              result={inspectModalResult}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">emotech</span>
            <span>•</span>
            <span>Customer Emotion Detection & Trend Monitoring</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Supervisor Engine Active
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <Database className="w-3.5 h-3.5" /> Cloud Storage Synced ({history.length} records)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
