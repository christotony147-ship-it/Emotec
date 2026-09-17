import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { EMOTION_THEMES, SEVERITY_CONFIG } from '../utils/emotionThemes';
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  PhoneCall,
  User,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface Props {
  alerts: AnalysisResult[];
  onAcknowledge: (id: string) => void;
  onInspect: (result: AnalysisResult) => void;
}

export const SupervisorAlertQueue: React.FC<Props> = ({
  alerts,
  onAcknowledge,
  onInspect,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const pendingAlerts = alerts.filter((a) => !a.supervisorAlert?.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.supervisorAlert?.acknowledged);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text.replace(/^"|"$/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="supervisor-queue-container" className="space-y-6">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Supervisor Escalation Dispatch Center
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated triage routing for anger, chargeback risks, extreme frustration, and high-tier churn alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block">Pending Action</span>
              <span className="text-lg font-black text-rose-400">{pendingAlerts.length}</span>
            </div>
            <div className="bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-400 block">Handled</span>
              <span className="text-lg font-black text-emerald-400">{acknowledgedAlerts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Incidents List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Pending Priority Escalations ({pendingAlerts.length})
        </h3>

        {pendingAlerts.length === 0 ? (
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-8 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h4 className="text-base font-bold text-white">All Clear! No Pending Escalations</h4>
            <p className="text-xs mt-1">
              No customer messages currently require supervisor intervention. Any new anger or frustration triggers will show here immediately.
            </p>
          </div>
        ) : (
          pendingAlerts.map((incident) => {
            const theme = EMOTION_THEMES[incident.primaryEmotion] || EMOTION_THEMES.neutral;
            const alert = incident.supervisorAlert!;
            const severityCfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.moderate;

            return (
              <div
                key={incident.id}
                id={`incident-card-${incident.id}`}
                className={`rounded-2xl border p-5 transition-all shadow-md ${
                  alert.severity === 'critical'
                    ? 'bg-red-950/40 border-red-500/80'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{theme.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {incident.customerName}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                          {incident.customerTier} TIER
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase">
                          • {incident.channel}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Logged {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase ${severityCfg.bg}`}
                    >
                      {severityCfg.label}
                    </span>
                    <button
                      id={`btn-queue-ack-${incident.id}`}
                      onClick={() => onAcknowledge(incident.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Handled
                    </button>
                    <button
                      id={`btn-queue-inspect-${incident.id}`}
                      onClick={() => onInspect(incident)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      Inspect <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4 space-y-3">
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 italic font-mono leading-relaxed">
                    "{incident.text}"
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="font-semibold text-rose-300 block mb-1">
                        Reason for Supervisor Alert:
                      </span>
                      <p className="text-slate-200">{alert.reason}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="font-semibold text-amber-300 block mb-1 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" /> Recommended Action Protocol:
                      </span>
                      <p className="text-slate-200">{alert.recommendedAction}</p>
                    </div>
                  </div>

                  {/* Suggested response */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-emerald-300">
                        Suggested Empathetic Agent Script:
                      </span>
                      <button
                        id={`btn-copy-script-${incident.id}`}
                        onClick={() => handleCopy(incident.id, alert.suggestedResponse)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white/5"
                      >
                        {copiedId === incident.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedId === incident.id ? 'Copied' : 'Copy Response'}
                      </button>
                    </div>
                    <p className="italic text-slate-300">{alert.suggestedResponse}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolved / Acknowledged Incidents */}
      {acknowledgedAlerts.length > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Recently Handled Incidents ({acknowledgedAlerts.length})
          </h3>

          <div className="space-y-2">
            {acknowledgedAlerts.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/50 rounded-xl border border-slate-800/80 p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span className="font-semibold text-white">{item.customerName}</span>
                  <span className="text-slate-400 truncate max-w-md">"{item.text}"</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    Handled by {item.supervisorAlert?.acknowledgedBy || 'Supervisor'}
                  </span>
                  <button
                    onClick={() => onInspect(item)}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
