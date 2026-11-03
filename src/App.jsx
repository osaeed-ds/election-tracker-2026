import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import SeatCounter from './components/SeatCounter.jsx';
import TabNav from './components/TabNav.jsx';
import FilterBar from './components/FilterBar.jsx';
import RaceCard from './components/RaceCard.jsx';
import SimulationModal from './components/SimulationModal.jsx';
import Footer from './components/Footer.jsx';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'election_tracker_snapshot_2026';
const POLL_INTERVAL_MS = 120000; // 2 minutes

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Tab & Filters
  const [activeTab, setActiveTab] = useState('house');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Simulation Controls
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [simStage, setSimStage] = useState('prime_time');

  const pollTimerRef = useRef(null);

  // Load cached snapshot from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);
        setLastUpdated(parsed.timestamp);
      }
    } catch (e) {
      console.warn('Failed to load local storage snapshot:', e);
    }
  }, []);

  // Fetch election results from local backend server
  const fetchResults = useCallback(async (force = false) => {
    try {
      setRefreshing(true);
      setError(null);

      const res = await fetch(`/api/results${force ? '?force=true' : ''}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      setData(json);
      setLastUpdated(json.timestamp || new Date().toISOString());
      setIsSimulated(Boolean(json.isSimulated));
      if (json.simulationStage) setSimStage(json.simulationStage);

      // Save successful snapshot to localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json));
      } catch (e) {
        // LocalStorage quota or error
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Unable to refresh results: ${err.message}. Retaining cached view.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and 2-minute polling loop with visibility handling
  useEffect(() => {
    fetchResults();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Page returned to foreground, refresh once
        fetchResults();
        // Reset timer
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(() => fetchResults(), POLL_INTERVAL_MS);
      } else {
        // Tab hidden, pause polling
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    pollTimerRef.current = setInterval(() => fetchResults(), POLL_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchResults]);

  // Set Simulation Mode handler
  const handleSetSimulation = async (enabled, stage) => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, stage })
      });
      if (res.ok) {
        await fetchResults(true);
      }
    } catch (err) {
      setError(`Simulation switch error: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  // Extract watchlist for active tab
  const currentRaces = data?.watchlists?.[activeTab] || [];

  // Filtered Races Calculation
  const filteredRaces = currentRaces.filter(race => {
    // 1. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchLabel = race.label?.toLowerCase().includes(q);
      const matchState = race.state?.toLowerCase().includes(q);
      const matchDistrict = race.district?.toLowerCase().includes(q);
      const matchCand = race.candidates?.some(c => c.name?.toLowerCase().includes(q));
      if (!matchLabel && !matchState && !matchDistrict && !matchCand) return false;
    }

    // 2. Status Filter
    if (statusFilter === 'called') return race.isCalled;
    if (statusFilter === 'uncalled') return !race.isCalled;
    if (statusFilter === 'dem_lead') {
      return (race.isCalled && race.calledWinnerParty === 'D') || (!race.isCalled && race.leaderParty === 'D');
    }
    if (statusFilter === 'rep_lead') {
      return (race.isCalled && race.calledWinnerParty === 'R') || (!race.isCalled && race.leaderParty === 'R');
    }
    if (statusFilter === 'close') {
      if (!race.candidates || race.candidates.length < 2) return false;
      const margin = Math.abs(race.candidates[0].percentage - race.candidates[1].percentage);
      return margin <= 4.0;
    }

    return true;
  });

  const tabCounts = {
    house: data?.watchlists?.house?.length || 54,
    houseCalled: data?.watchlists?.house?.filter(r => r.isCalled)?.length || 0,
    senate: data?.watchlists?.senate?.length || 14,
    senateCalled: data?.watchlists?.senate?.filter(r => r.isCalled)?.length || 0,
    governor: data?.watchlists?.governor?.length || 10,
    governorCalled: data?.watchlists?.governor?.filter(r => r.isCalled)?.length || 0
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col">
      
      {/* Top Header */}
      <Header
        election={data?.election}
        lastUpdated={lastUpdated}
        sourceTimestamp={data?.sourceTimestamp}
        isRefreshing={refreshing}
        isStale={data?.isStale}
        error={error || data?.error}
        isSimulated={isSimulated}
        simulationStage={simStage}
        onRefresh={() => fetchResults(true)}
        onOpenSimulationModal={() => setIsSimModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-sm font-medium text-slate-400">Loading election data from local server...</p>
          </div>
        ) : (
          <>
            {/* Top Seat Counter Component */}
            <SeatCounter
              activeTab={activeTab}
              chamberTotals={data?.chamberTotals}
              onSelectTab={setActiveTab}
            />

            {/* Office Watchlist Navigation Tabs */}
            <TabNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              counts={tabCounts}
            />

            {/* Filter and Search Controls */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              totalRaces={currentRaces.length}
              filteredCount={filteredRaces.length}
            />

            {/* Grid of Race Cards */}
            {filteredRaces.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">No matching races found</p>
                <p className="text-xs">Try clearing your search query or selecting a different status filter.</p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="mt-2 text-xs text-sky-400 hover:underline font-medium"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRaces.map(race => (
                  <RaceCard key={race.id || race.key} race={race} />
                ))}
              </div>
            )}
          </>
        )}

      </main>

      {/* Simulator Modal */}
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        isSimulated={isSimulated}
        simulationStage={simStage}
        onSetSimulation={handleSetSimulation}
      />

      {/* Attribution & Legal Footer */}
      <Footer />

    </div>
  );
}
