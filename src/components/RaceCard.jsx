import React from 'react';
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

export default function RaceCard({ race }) {
  if (!race) return null;

  const {
    label,
    office,
    state,
    closeTimeET,
    percentReporting,
    isCalled,
    calledWinnerParty,
    candidates,
    isUnmatched,
    isSpecial
  } = race;

  const partyBadgeClass = (party) => {
    switch (party) {
      case 'D':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'R':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'I':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600';
    }
  };

  const partyBgClass = (party) => {
    switch (party) {
      case 'D': return 'bg-blue-600';
      case 'R': return 'bg-red-600';
      case 'I': return 'bg-purple-600';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
      isCalled
        ? 'bg-slate-900/90 border-slate-700 shadow-md shadow-slate-950/60'
        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
    }`}>
      
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/40 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-white tracking-tight">
              {label}
            </span>
            {isSpecial && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Special
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span>{office}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-slate-400" />
              Polls close {closeTimeET} ET
            </span>
          </div>
        </div>

        {/* Status Call Badge */}
        <div>
          {isUnmatched ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-3 h-3" />
              Unmatched
            </span>
          ) : isCalled ? (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm ${
              calledWinnerParty === 'D'
                ? 'bg-blue-600 text-white border-blue-400'
                : calledWinnerParty === 'R'
                ? 'bg-red-600 text-white border-red-400'
                : 'bg-emerald-600 text-white border-emerald-400'
            }`}>
              <CheckCircle className="w-3.5 h-3.5" />
              CALLED {calledWinnerParty ? `(${calledWinnerParty})` : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
              Uncalled
            </span>
          )}
        </div>
      </div>

      {/* Body: Candidates & Vote Returns */}
      <div className="p-3.5 space-y-2.5 flex-1">
        {isUnmatched ? (
          <div className="py-6 text-center text-xs text-slate-400 space-y-1">
            <p className="font-medium text-slate-300">Awaiting CivicAPI Feed Results</p>
            <p className="text-[11px]">Race is configured on watchlist. Data will display as soon as votes are reported.</p>
          </div>
        ) : (
          candidates.map((cand, idx) => {
            const isWinner = Boolean(cand.isWinner);
            const isLeader = idx === 0 && cand.votes > 0 && !isCalled;

            return (
              <div
                key={cand.id || idx}
                className={`p-2 rounded-lg border transition ${
                  isWinner
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : isLeader
                    ? 'bg-slate-800/40 border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${partyBadgeClass(cand.party)}`}>
                      {cand.party}
                    </span>
                    <span className="font-semibold text-slate-100 truncate">
                      {cand.name}
                    </span>
                    {isWinner && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Winner Called" />
                    )}
                    {isLeader && (
                      <span className="text-[10px] text-amber-400 font-medium shrink-0 flex items-center gap-0.5" title="Leading uncalled race">
                        <TrendingUp className="w-2.5 h-2.5" /> Lead
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-100 text-xs">
                      {cand.percentage}%
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5">
                      ({cand.votesFormatted} votes)
                    </span>
                  </div>
                </div>

                {/* Percentage Bar */}
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, cand.percentage))}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${partyBgClass(cand.party)}`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer: Reporting % Bar */}
      <div className="px-3.5 py-2.5 border-t border-slate-800/60 bg-slate-950/30 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-medium">
          {percentReporting}% reporting
        </span>
        <div className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-2">
          <div
            style={{ width: `${percentReporting}%` }}
            className={`h-full rounded-full transition-all duration-300 ${
              percentReporting === 100
                ? 'bg-emerald-500'
                : percentReporting > 0
                ? 'bg-sky-500'
                : 'bg-slate-700'
            }`}
          />
        </div>
      </div>

    </div>
  );
}
