import React from 'react';
import { Layers, Landmark, Shield } from 'lucide-react';

export default function TabNav({ activeTab, onSelectTab, counts }) {
  const tabs = [
    {
      id: 'house',
      label: 'U.S. House',
      sublabel: '54 Watched Districts',
      icon: Layers,
      count: counts?.house || 54,
      called: counts?.houseCalled || 0
    },
    {
      id: 'senate',
      label: 'U.S. Senate',
      sublabel: '14 Key States / Specials',
      icon: Landmark,
      count: counts?.senate || 14,
      called: counts?.senateCalled || 0
    },
    {
      id: 'governor',
      label: 'Governors',
      sublabel: '10 Key States',
      icon: Shield,
      count: counts?.governor || 10,
      called: counts?.governorCalled || 0
    }
  ];

  return (
    <div className="flex border-b border-slate-800 space-x-1 sm:space-x-3 mb-5 overflow-x-auto no-scrollbar">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2.5 px-4 py-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              isActive
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
            <div className="text-left">
              <div className="font-bold flex items-center gap-1.5">
                <span>{tab.label}</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.called}/{tab.count} called
                </span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                {tab.sublabel}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
