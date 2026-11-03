import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export default function SeatCounter({ activeTab, chamberTotals, onSelectTab }) {
  if (!chamberTotals) return null;

  const currentChamber = activeTab === 'house' ? chamberTotals.house :
                         activeTab === 'senate' ? chamberTotals.senate :
                         chamberTotals.governor;

  const chamberTitle = activeTab === 'house' ? 'U.S. House of Representatives' :
                       activeTab === 'senate' ? 'U.S. Senate' :
                       'State Governorships';

  const rCount = currentChamber?.R || 0;
  const dCount = currentChamber?.D || 0;
  const iCount = currentChamber?.I || 0;
  const oCount = currentChamber?.O || 0;
  const total = currentChamber?.totalSeats || 100;
  const majority = currentChamber?.majority || 51;
  const calledCount = currentChamber?.calledCount || 0;
  const onBallot = currentChamber?.onBallot || 0;

  // Percentage calculations for seat bar
  const rPct = (rCount / total) * 100;
  const dPct = (dCount / total) * 100;
  const iPct = (iCount / total) * 100;
  const oPct = (oCount / total) * 100;
  const majorityPct = (majority / total) * 100;

  const rWonMajority = rCount >= majority;
  const dWonMajority = dCount >= majority;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/50 mb-6">
      
      {/* Top Chamber Header & Mini Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {chamberTitle} Seat Counter
            </h2>
            {(rWonMajority || dWonMajority) && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                {rWonMajority ? 'GOP Majority' : 'Dem Majority'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {majority} needed for majority • {total} total seats ({onBallot} on 2026 ballot)
          </p>
        </div>

        {/* Small Summary Pills for other chambers */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onSelectTab('house')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeTab === 'house'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            House <span className="font-bold text-slate-200">{chamberTotals.house.D}D - {chamberTotals.house.R}R</span>
          </button>
          <button
            onClick={() => onSelectTab('senate')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeTab === 'senate'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Senate <span className="font-bold text-slate-200">{chamberTotals.senate.D}D - {chamberTotals.senate.R}R</span>
          </button>
          <button
            onClick={() => onSelectTab('governor')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              activeTab === 'governor'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gov <span className="font-bold text-slate-200">{chamberTotals.governor.D}D - {chamberTotals.governor.R}R</span>
          </button>
        </div>
      </div>

      {/* Primary Numbers Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Democratic Box */}
        <div className={`p-3 rounded-xl border ${dWonMajority ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950' : 'bg-slate-950/80 border-slate-800'}`}>
          <div className="text-xs font-medium text-blue-400 uppercase tracking-wider flex items-center justify-between">
            <span>Democrats</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {dCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {dCount >= majority ? 'Majority Won' : `${majority - dCount} to majority`}
          </div>
        </div>

        {/* Republican Box */}
        <div className={`p-3 rounded-xl border ${rWonMajority ? 'bg-red-950/60 border-red-500 shadow-md shadow-red-950' : 'bg-slate-950/80 border-slate-800'}`}>
          <div className="text-xs font-medium text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>Republicans</span>
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {rCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {rCount >= majority ? 'Majority Won' : `${majority - rCount} to majority`}
          </div>
        </div>

        {/* Independent / Other Box (if nonzero) */}
        {(iCount > 0 || oCount > 0 || activeTab === 'senate') && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs font-medium text-purple-400 uppercase tracking-wider flex items-center justify-between">
              <span>Independent / Other</span>
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {iCount + oCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {iCount} Ind • {oCount} Oth
            </div>
          </div>
        )}

        {/* Progress Box */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Called Progress</span>
            <Award className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {calledCount} <span className="text-xs font-normal text-slate-400">/ {onBallot}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {onBallot - calledCount} on ballot uncalled
          </div>
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <div className="relative pt-1 pb-2">
        <div className="h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
          {/* Democratic Bar */}
          <div
            style={{ width: `${dPct}%` }}
            className="bg-blue-600 transition-all duration-500 relative group"
            title={`Democrats: ${dCount} seats`}
          />
          {/* Independent Bar */}
          {iCount > 0 && (
            <div
              style={{ width: `${iPct}%` }}
              className="bg-purple-600 transition-all duration-500"
              title={`Independents: ${iCount} seats`}
            />
          )}
          {/* Uncalled Gray Section */}
          <div className="flex-1 bg-slate-800/80" />
          {/* Republican Bar */}
          <div
            style={{ width: `${rPct}%` }}
            className="bg-red-600 transition-all duration-500"
            title={`Republicans: ${rCount} seats`}
          />
        </div>

        {/* Majority Marker line */}
        <div
          style={{ left: `${majorityPct}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] z-10"
        >
          <span className="absolute -top-3.5 -translate-x-1/2 text-[10px] font-bold text-amber-300 bg-slate-900 px-1 rounded border border-amber-500/30">
            {majority}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
        <span className="text-blue-400 font-medium">← Democrats ({dCount})</span>
        <span className="text-amber-400/90 font-medium">{majority} Needed for Majority</span>
        <span className="text-red-400 font-medium">Republicans ({rCount}) →</span>
      </div>

    </div>
  );
}
