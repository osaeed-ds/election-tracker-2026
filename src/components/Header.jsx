import React from 'react';
import { RefreshCw, Radio, Clock, AlertTriangle, Play, Database, ShieldCheck } from 'lucide-react';

export default function Header({
  election,
  lastUpdated,
  sourceTimestamp,
  isRefreshing,
  isStale,
  error,
  isSimulated,
  simulationStage,
  onRefresh,
  onOpenSimulationModal
}) {
  const formatTime = (isoString) => {
    if (!isoString) return '--:--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Title and Badges */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  {election?.title || '2026 U.S. Election Night Tracker'}
                </h1>
                
                {isSimulated ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <Play className="w-3 h-3 fill-amber-300" />
                    SIMULATION ({simulationStage?.replace('_', ' ').toUpperCase()})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE CIVICAPI
                  </span>
                )}

                {isStale && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                    <AlertTriangle className="w-3 h-3" />
                    STALE FEED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Election Date: <strong className="text-slate-200">{election?.date || 'November 3, 2026'}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Local 127.0.0.1
                </span>
              </p>
            </div>
          </div>

          {/* Action and Timing Controls */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            <div className="text-right text-xs text-slate-400 hidden md:block">
              <div className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last Checked: {formatTime(lastUpdated)}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Feed Source: {formatTime(sourceTimestamp)}
              </div>
            </div>

            {/* Simulator Mode Trigger */}
            <button
              onClick={onOpenSimulationModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Test dashboard with election night scenarios"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulator</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white shadow-sm shadow-sky-900/40 border border-sky-400/20 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

        </div>

        {/* Error notification banner if any */}
        {error && (
          <div className="mt-2.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </header>
  );
}
