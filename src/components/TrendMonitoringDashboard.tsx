import React, { useState, useMemo } from 'react';
import { AnalysisResult, EmotionType } from '../types';
import { EMOTION_THEMES, SEVERITY_CONFIG } from '../utils/emotionThemes';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Download,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  Database,
  Eye,
  AlertTriangle,
  Smile,
  Frown,
} from 'lucide-react';

interface Props {
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onAcknowledgeAlert: (id: string) => void;
  onResetSeedData: () => void;
  onClearHistory: () => void;
}

export const TrendMonitoringDashboard: React.FC<Props> = ({
  history,
  onSelectResult,
  onAcknowledgeAlert,
  onResetSeedData,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');
  const [selectedAlertFilter, setSelectedAlertFilter] = useState<string>('all');

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = history.length;
    if (total === 0) {
      return {
        total: 0,
        avgConfidence: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        alertCount: 0,
        escalationRate: 0,
        dominantEmotion: 'neutral' as EmotionType,
        emotionCounts: {} as Record<EmotionType, number>,
      };
    }

    let sumConfidence = 0;
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let alertCount = 0;
    const emotionCounts: Record<EmotionType, number> = {
      happiness: 0,
      sadness: 0,
      frustration: 0,
      anger: 0,
      neutral: 0,
      surprise: 0,
      anxiety: 0,
    };

    history.forEach((item) => {
      sumConfidence += item.confidence;
      if (item.sentiment === 'positive') positive++;
      else if (item.sentiment === 'negative') negative++;
      else neutral++;

      if (item.supervisorAlert?.required) alertCount++;
      if (emotionCounts[item.primaryEmotion] !== undefined) {
        emotionCounts[item.primaryEmotion]++;
      }
    });

    let dominant: EmotionType = 'neutral';
    let maxCount = -1;
    (Object.keys(emotionCounts) as EmotionType[]).forEach((emo) => {
      if (emotionCounts[emo] > maxCount) {
        maxCount = emotionCounts[emo];
        dominant = emo;
      }
    });

    return {
      total,
      avgConfidence: Math.round(sumConfidence / total),
      positiveCount: positive,
      negativeCount: negative,
      neutralCount: neutral,
      alertCount,
      escalationRate: Math.round((alertCount / total) * 100),
      dominantEmotion: dominant,
      emotionCounts,
    };
  }, [history]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primaryEmotion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supervisorAlert?.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEmotion =
        selectedEmotionFilter === 'all' || item.primaryEmotion === selectedEmotionFilter;

      const matchesAlert =
        selectedAlertFilter === 'all' ||
        (selectedAlertFilter === 'alerts' && item.supervisorAlert?.required) ||
        (selectedAlertFilter === 'pending' &&
          item.supervisorAlert?.required &&
          !item.supervisorAlert?.acknowledged) ||
        (selectedAlertFilter === 'acknowledged' &&
          item.supervisorAlert?.required &&
          item.supervisorAlert?.acknowledged);

      return matchesSearch && matchesEmotion && matchesAlert;
    });
  }, [history, searchQuery, selectedEmotionFilter, selectedAlertFilter]);

  // Export handlers
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `emotech_trend_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Customer', 'Tier', 'Channel', 'Timestamp', 'Primary Emotion', 'Confidence %', 'Sentiment', 'Sentiment Score', 'Intensity', 'Supervisor Alert', 'Alert Severity', 'Reason'];
    const rows = history.map((item) => [
      item.id,
      `"${item.customerName}"`,
      item.customerTier,
      item.channel,
      item.timestamp,
      item.primaryEmotion,
      item.confidence,
      item.sentiment,
      item.sentimentScore,
      item.intensity,
      item.supervisorAlert?.required ? 'YES' : 'NO',
      item.supervisorAlert?.severity || 'none',
      `"${(item.supervisorAlert?.reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `emotech_trend_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div id="trend-monitoring-dashboard" className="space-y-6">
      {/* Cloud Database Status Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Cloud Database & Trend Store</h2>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Storage Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical customer emotion data automatically synced for trend monitoring, sentiment drift, and supervisor auditing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-json"
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            JSON
          </button>
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            CSV
          </button>
          <button
            id="btn-reset-seed"
            onClick={onResetSeedData}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Reload realistic hackathon demo records"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            Reload Demo Data
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Analyzed */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
            Total Analyzed
          </span>
          <div className="text-2xl font-black text-white mt-1">{metrics.total}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Customer messages</span>
        </div>

        {/* Supervisor Escalation Rate */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
            Escalation Rate
          </span>
          <div className="text-2xl font-black text-rose-400 mt-1 flex items-baseline gap-1">
            {metrics.escalationRate}%
            <span className="text-xs text-slate-400 font-normal">({metrics.alertCount} alerts)</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Supervisor triggers</span>
        </div>

        {/* Avg Confidence */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
            Avg Confidence
          </span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{metrics.avgConfidence}%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Model certainty</span>
        </div>

        {/* Dominant Emotion */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
            Top Emotion
          </span>
          <div className="text-xl font-black text-white mt-1 capitalize flex items-center gap-1.5 truncate">
            <span>{EMOTION_THEMES[metrics.dominantEmotion]?.emoji || '😐'}</span>
            <span className="truncate">{metrics.dominantEmotion}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {metrics.emotionCounts[metrics.dominantEmotion] || 0} occurrences
          </span>
        </div>

        {/* Positive vs Negative Ratio */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 col-span-2 lg:col-span-1">
          <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
            Sentiment Split
          </span>
          <div className="flex items-center gap-2 mt-1 text-sm font-bold">
            <span className="text-emerald-400 flex items-center gap-0.5">
              <Smile className="w-3.5 h-3.5" /> {metrics.positiveCount}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-rose-400 flex items-center gap-0.5">
              <Frown className="w-3.5 h-3.5" /> {metrics.negativeCount}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Positive vs Negative</span>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emotion Distribution Bars */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Customer Emotion Distribution
            </h3>
            <span className="text-xs text-slate-400">Total samples: {metrics.total}</span>
          </div>

          <div className="space-y-3">
            {(Object.keys(metrics.emotionCounts) as EmotionType[]).map((emo) => {
              const count = metrics.emotionCounts[emo] || 0;
              const percentage = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
              const theme = EMOTION_THEMES[emo];

              return (
                <div key={emo} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 capitalize flex items-center gap-1.5 font-medium">
                      <span>{theme.emoji}</span> {theme.label}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: theme.accentColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Escalation Severity Heatmap */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Supervisor Alert Health
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-red-300 uppercase">Critical Severity</span>
                  <span className="text-xs font-black text-white">
                    {history.filter((h) => h.supervisorAlert?.severity === 'critical').length} incidents
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Legal threats, chargebacks, active security alarms
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-rose-300 uppercase">High Priority</span>
                  <span className="text-xs font-black text-white">
                    {history.filter((h) => h.supervisorAlert?.severity === 'high').length} incidents
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Persistent rage, multi-day technical outages, VIP tier friction
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-amber-300 uppercase">Moderate Alerts</span>
                  <span className="text-xs font-black text-white">
                    {history.filter((h) => h.supervisorAlert?.severity === 'moderate').length} incidents
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Frustration threshold crossed, delayed responses
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
            {metrics.alertCount} total alerts • {history.filter((h) => h.supervisorAlert?.acknowledged).length} handled
          </div>
        </div>
      </div>

      {/* Historical Records Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Analysis History Log</h3>
            <p className="text-xs text-slate-400">
              Showing {filteredHistory.length} of {history.length} logged messages
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
              <input
                id="input-history-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-slate-950/90 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Emotion Filter */}
            <select
              id="filter-emotion-select"
              value={selectedEmotionFilter}
              onChange={(e) => setSelectedEmotionFilter(e.target.value)}
              className="bg-slate-950/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Emotions</option>
              <option value="anger">😡 Anger</option>
              <option value="frustration">😤 Frustration</option>
              <option value="happiness">😊 Happiness</option>
              <option value="sadness">😔 Sadness</option>
              <option value="anxiety">😰 Anxiety</option>
              <option value="surprise">😲 Surprise</option>
              <option value="neutral">😐 Neutral</option>
            </select>

            {/* Alert Filter */}
            <select
              id="filter-alert-select"
              value={selectedAlertFilter}
              onChange={(e) => setSelectedAlertFilter(e.target.value)}
              className="bg-slate-950/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Logs</option>
              <option value="alerts">All Escalations</option>
              <option value="pending">Pending Escalations</option>
              <option value="acknowledged">Acknowledged</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Primary Emotion</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Message Snippet</th>
                <th className="py-3 px-3">Supervisor Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                    No matching records found in cloud analysis history.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const theme = EMOTION_THEMES[item.primaryEmotion] || EMOTION_THEMES.neutral;
                  const alert = item.supervisorAlert;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectResult(item)}
                    >
                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{item.customerName}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.customerTier} • {item.channel.toUpperCase()}
                        </div>
                      </td>

                      {/* Emotion */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold capitalize ${theme.badgeBg} ${theme.badgeText}`}
                        >
                          <span>{theme.emoji}</span> {item.primaryEmotion}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {item.confidence}%
                      </td>

                      {/* Snippet */}
                      <td className="py-3 px-3 max-w-xs truncate text-slate-200">
                        "{item.text}"
                      </td>

                      {/* Supervisor Status */}
                      <td className="py-3 px-3">
                        {alert?.required ? (
                          alert.acknowledged ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                              <CheckCircle className="w-3.5 h-3.5" /> Handled
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1 font-bold text-[11px] animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {alert.severity.toUpperCase()} ALERT
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 text-[11px]">Standard</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {alert?.required && !alert.acknowledged && (
                            <button
                              id={`btn-ack-row-${item.id}`}
                              onClick={() => onAcknowledgeAlert(item.id)}
                              className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded text-[11px] font-medium"
                              title="Acknowledge supervisor alert"
                            >
                              Handle
                            </button>
                          )}
                          <button
                            id={`btn-view-row-${item.id}`}
                            onClick={() => onSelectResult(item)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Inspect complete result"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
