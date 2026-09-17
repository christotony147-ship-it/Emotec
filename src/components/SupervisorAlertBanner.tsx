import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { SEVERITY_CONFIG } from '../utils/emotionThemes';
import { AlertTriangle, BellRing, CheckCircle, ChevronDown, ChevronUp, ShieldAlert, PhoneCall, Copy, Check } from 'lucide-react';

interface Props {
  alertResult: AnalysisResult | null;
  onAcknowledge: (id: string) => void;
  onViewDetails?: (result: AnalysisResult) => void;
}

export const SupervisorAlertBanner: React.FC<Props> = ({
  alertResult,
  onAcknowledge,
  onViewDetails,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!alertResult || !alertResult.supervisorAlert || !alertResult.supervisorAlert.required) {
    return null;
  }

  const { supervisorAlert, customerName, customerTier, channel } = alertResult;
  const severityCfg = SEVERITY_CONFIG[supervisorAlert.severity] || SEVERITY_CONFIG.moderate;
  const isAck = supervisorAlert.acknowledged;

  const handleCopyResponse = () => {
    if (supervisorAlert.suggestedResponse) {
      navigator.clipboard.writeText(supervisorAlert.suggestedResponse.replace(/^"|"$/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="supervisor-alert-banner"
      className={`w-full transition-all duration-300 border-b shadow-sm ${
        isAck
          ? 'bg-slate-900/95 text-slate-100 border-slate-700'
          : supervisorAlert.severity === 'critical'
          ? 'bg-gradient-to-r from-red-950 via-rose-950 to-red-900 text-white border-red-500/80 ring-2 ring-red-500/30'
          : 'bg-gradient-to-r from-amber-950 via-rose-950 to-amber-900 text-white border-amber-500/80 ring-1 ring-amber-500/30'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Left info */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${
                isAck
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : supervisorAlert.severity === 'critical'
                  ? 'bg-red-500/30 text-red-300 animate-pulse'
                  : 'bg-amber-500/30 text-amber-300'
              }`}
            >
              {isAck ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded tracking-wider uppercase ${severityCfg.bg}`}
                >
                  {isAck ? 'ACKNOWLEDGED' : severityCfg.label}
                </span>
                <span className="text-xs text-slate-300">
                  Customer: <strong className="text-white font-medium">{customerName}</strong> ({customerTier} Tier, {channel.toUpperCase()})
                </span>
                <span className="text-xs bg-slate-800/80 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                  Dept: {supervisorAlert.department}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-100 mt-1 truncate max-w-2xl">
                {supervisorAlert.reason}
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {!isAck ? (
              <button
                id="btn-acknowledge-alert"
                onClick={() => onAcknowledge(alertResult.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Acknowledge Alert
              </button>
            ) : (
              <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md">
                <Check className="w-3.5 h-3.5" /> Handled ({supervisorAlert.acknowledgedBy || 'Supervisor'})
              </span>
            )}

            {onViewDetails && (
              <button
                id="btn-view-alert-details"
                onClick={() => onViewDetails(alertResult)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700"
              >
                Inspect Incident
              </button>
            )}

            <button
              id="btn-toggle-alert-drawer"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors"
              title={expanded ? 'Collapse details' : 'Expand supervisor guidance'}
              aria-label="Toggle details"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable supervisor action protocol */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-black/30 p-3 rounded-lg border border-white/10">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
                <PhoneCall className="w-3.5 h-3.5" />
                Recommended Action Protocol
              </div>
              <p className="text-slate-200 leading-relaxed">
                {supervisorAlert.recommendedAction}
              </p>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/10">
              <div className="flex items-center justify-between gap-1.5 text-emerald-300 font-semibold mb-1">
                <div className="flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5" />
                  Suggested Empathetic De-escalation Response
                </div>
                <button
                  id="btn-copy-suggested-response"
                  onClick={handleCopyResponse}
                  className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white/10"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-slate-300 italic leading-relaxed">
                {supervisorAlert.suggestedResponse}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
