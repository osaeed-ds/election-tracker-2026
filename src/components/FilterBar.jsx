import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalRaces,
  filteredCount
}) {
  const filterOptions = [
    { id: 'all', label: 'All Races' },
    { id: 'called', label: 'Called' },
    { id: 'uncalled', label: 'Uncalled' },
    { id: 'dem_lead', label: 'Dem Lead/Win' },
    { id: 'rep_lead', label: 'GOP Lead/Win' },
    { id: 'close', label: 'Close (< 4%)' }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by state or district (e.g. OH-13, FL, GA)..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block mr-1" />
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => onStatusFilterChange(opt.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              statusFilter === opt.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Counter */}
      <div className="text-[11px] text-slate-400 text-right shrink-0">
        Showing <strong className="text-slate-200">{filteredCount}</strong> of {totalRaces}
      </div>

    </div>
  );
}
