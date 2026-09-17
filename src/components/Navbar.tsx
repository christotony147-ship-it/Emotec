import React from 'react';
import { Activity, BarChart2, ShieldAlert, Sparkles, Layers } from 'lucide-react';

interface Props {
  activeTab: 'analyzer' | 'trends' | 'alerts';
  setActiveTab: (tab: 'analyzer' | 'trends' | 'alerts') => void;
  pendingAlertsCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  pendingAlertsCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  emotech
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Hackathon Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">
                Customer Emotion Intelligence & Escalation Engine
              </p>
            </div>
          </div>

          {/* Navigation Switcher Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-analyzer"
              onClick={() => setActiveTab('analyzer')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Analyzer</span>
            </button>

            <button
              id="tab-trends"
              onClick={() => setActiveTab('trends')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'trends'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Trend Monitoring</span>
            </button>

            <button
              id="tab-alerts"
              onClick={() => setActiveTab('alerts')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                activeTab === 'alerts'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Supervisor Alerts</span>
              <span className="sm:hidden">Alerts</span>
              {pendingAlertsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {pendingAlertsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
