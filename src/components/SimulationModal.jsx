import React from 'react';
import { X, Play, Radio, Clock, ShieldCheck, Check } from 'lucide-react';

export default function SimulationModal({
  isOpen,
  onClose,
  isSimulated,
  simulationStage,
  onSetSimulation
}) {
  if (!isOpen) return null;

  const stages = [
    {
      id: 'pre_election',
      title: '1. Pre-Election (Polls Open)',
      time: '6:00 PM ET',
      description: '0% reporting across all races. Displays starting chamber baselines (Senate 31R/32D/2I, Gov 9R/5D).'
    },
    {
      id: 'early_returns',
      title: '2. Early Returns',
      time: '7:30 PM ET',
      description: 'Polls closed in IN, KY, FL, GA, VA, SC, VT. Initial reporting batches and first early calls.'
    },
    {
      id: 'prime_time',
      title: '3. Prime-Time Battlegrounds',
      time: '9:30 PM ET',
      description: 'Major battlegrounds reporting (OH, NC, PA, MI, TX, WI, IA, CO, AZ). Tight races and heavy seat movement.'
    },
    {
      id: 'late_night',
      title: '4. Late-Night West Coast',
      time: '11:30 PM ET',
      description: 'Polls closed in CA, MT, OR. Over 85% reporting nationwide; decisive chamber majorities emerging.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl shadow-slate-950 text-slate-100 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Play className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Election Night Simulator</h3>
              <p className="text-xs text-slate-400">Test dashboard behavior with sample 2026 scenarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Mode Option */}
        <div className="my-4">
          <button
            onClick={() => {
              onSetSimulation(false);
              onClose();
            }}
            className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              !isSimulated
                ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <span>Live CivicAPI Mode</span>
                  {!isSimulated && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Fetch live results from CivicAPI v2 public endpoints with 120s caching.
                </div>
              </div>
            </div>
            {!isSimulated && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
          </button>
        </div>

        {/* Simulation Stages */}
        <div className="space-y-2 mb-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Election Timeline Scenarios
          </div>
          {stages.map(stage => {
            const isSelected = isSimulated && simulationStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => {
                  onSetSimulation(true, stage.id);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-100">{stage.title}</span>
                    <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {stage.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {stage.description}
                  </p>
                </div>
                {isSelected && <Check className="w-5 h-5 text-amber-400 shrink-0 ml-2 mt-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            Runs entirely offline on local server
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
