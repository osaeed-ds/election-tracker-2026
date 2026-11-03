/**
 * Normalization Engine for CivicAPI v2 Election Feeds
 * Maps raw API JSON or simulation feed into standardized dashboard format,
 * calculates running seat counts with baseline balances, and matches watchlists.
 */

const electionConfig = require('../config/election-config.json');

/**
 * Normalizes party strings into canonical codes: 'R', 'D', 'I', 'O'
 */
function normalizeParty(partyStr) {
  if (!partyStr) return 'O';
  const clean = String(partyStr).trim().toUpperCase();
  if (clean === 'R' || clean === 'REP' || clean === 'REPUBLICAN' || clean === 'GOP') return 'R';
  if (clean === 'D' || clean === 'DEM' || clean === 'DEMOCRAT' || clean === 'DEMOCRATIC') return 'D';
  if (clean === 'I' || clean === 'IND' || clean === 'INDEPENDENT' || clean === 'UNENROLLED') return 'I';
  return 'O';
}

/**
 * Formats numbers with thousands separators
 */
function formatVotes(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-US');
}

/**
 * Normalizes percentage values to 1 decimal place string or number
 */
function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return 0;
  return Math.round(Number(val) * 10) / 10;
}

/**
 * Clamps reporting percentage between 0 and 100
 */
function clampReporting(val) {
  if (val === null || val === undefined || isNaN(val)) return 0;
  return Math.min(100, Math.max(0, Math.round(Number(val) * 10) / 10));
}

/**
 * Processes full election feed and generates dashboard payload
 */
function normalizeElectionData(feedData, isStale = false, errorMsg = null) {
  const { baselines, watchlists } = electionConfig;
  const rawRaces = Array.isArray(feedData?.results) ? feedData.results : [];

  // Track called seats across the ENTIRE feed by unique race ID
  const calledSeats = {
    house: { R: 0, D: 0, I: 0, O: 0, calledCount: 0 },
    senate: { R: 0, D: 0, I: 0, O: 0, calledCount: 0 },
    governor: { R: 0, D: 0, I: 0, O: 0, calledCount: 0 }
  };

  const processedRacesMap = new Map();

  // 1. Process all feed races for chamber tallies and index them
  rawRaces.forEach(race => {
    const raceState = (race.state || race.province || '').toUpperCase();
    const raceTitle = String(race.election_name || race.office || race.type || '').toLowerCase();
    const raceId = race.id || `${raceTitle}-${raceState}-${race.district || 'statewide'}`;
    if (processedRacesMap.has(raceId)) return; // Prevent double counting
    processedRacesMap.set(raceId, race);

    // Determine chamber/office category
    let category = null;
    if (raceTitle.includes('house') || raceTitle.includes('representative')) category = 'house';
    else if (raceTitle.includes('senate') || raceTitle.includes('senator')) category = 'senate';
    else if (raceTitle.includes('gov') || raceTitle.includes('gubernatorial')) category = 'governor';

    if (!category) return;

    // Check if race is called
    const isCalled = Boolean(race.is_called || race.called || race.winner_called);
    let winningParty = null;

    if (isCalled) {
      if (race.called_winner_party) {
        winningParty = normalizeParty(race.called_winner_party);
      } else if (Array.isArray(race.candidates)) {
        const winningCand = race.candidates.find(c => c.is_winner || c.winner);
        if (winningCand) winningParty = normalizeParty(winningCand.party);
      }

      if (winningParty && calledSeats[category][winningParty] !== undefined) {
        calledSeats[category][winningParty] += 1;
        calledSeats[category].calledCount += 1;
      }
    }
  });

  // 2. Compute Total Running Seats (Starting Balance + Called Seats)
  const chamberTotals = {
    house: {
      R: baselines.house.starting.R + calledSeats.house.R,
      D: baselines.house.starting.D + calledSeats.house.D,
      I: baselines.house.starting.I + calledSeats.house.I,
      O: baselines.house.starting.O + calledSeats.house.O,
      totalSeats: baselines.house.totalSeats,
      majority: baselines.house.majority,
      calledCount: calledSeats.house.calledCount,
      onBallot: baselines.house.onBallot,
      uncalledCount: baselines.house.onBallot - calledSeats.house.calledCount
    },
    senate: {
      R: baselines.senate.starting.R + calledSeats.senate.R,
      D: baselines.senate.starting.D + calledSeats.senate.D,
      I: baselines.senate.starting.I + calledSeats.senate.I,
      O: baselines.senate.starting.O + calledSeats.senate.O,
      totalSeats: baselines.senate.totalSeats,
      majority: baselines.senate.majority,
      calledCount: calledSeats.senate.calledCount,
      onBallot: baselines.senate.onBallot,
      uncalledCount: baselines.senate.onBallot - calledSeats.senate.calledCount
    },
    governor: {
      R: baselines.governor.starting.R + calledSeats.governor.R,
      D: baselines.governor.starting.D + calledSeats.governor.D,
      I: baselines.governor.starting.I + calledSeats.governor.I,
      O: baselines.governor.starting.O + calledSeats.governor.O,
      totalSeats: baselines.governor.totalSeats,
      majority: baselines.governor.majority,
      calledCount: calledSeats.governor.calledCount,
      onBallot: baselines.governor.onBallot,
      uncalledCount: baselines.governor.onBallot - calledSeats.governor.calledCount
    }
  };

  // 3. Build Watchlist Race Cards for House (54 districts)
  const houseCards = watchlists.house.map(watched => {
    // Find matching race in feed
    const match = rawRaces.find(r => {
      const titleStr = String(r.election_name || r.office || r.type || '').toLowerCase();
      if (!titleStr.includes('house') && !titleStr.includes('rep')) return false;
      const stateMatch = String(r.state || r.province || '').toUpperCase() === watched.state;
      const targetDist = watched.district.split('-')[1];
      const rawDist = r.district !== null && r.district !== undefined ? String(r.district).padStart(2, '0') : null;
      const distMatch = rawDist === targetDist || titleStr.includes(`district ${parseInt(targetDist, 10)}`) || titleStr.includes(`house ${parseInt(targetDist, 10)}`);
      const keyMatch = r.canonical_key === watched.district;
      return (stateMatch && distMatch) || keyMatch;
    });

    if (!match) {
      return {
        id: `house-unmatched-${watched.district}`,
        key: watched.district,
        office: 'U.S. House',
        state: watched.state,
        district: watched.district.split('-')[1],
        label: `${watched.district}`,
        closeTimeET: watched.closeTimeET,
        closeInstant: watched.closeInstant,
        percentReporting: 0,
        isCalled: false,
        calledWinnerParty: null,
        candidates: [],
        isUnmatched: true
      };
    }

    const reporting = clampReporting(match.percent_reporting || match.reporting_percentage || match.precincts_reporting_pct);
    const isCalled = Boolean(match.is_called || match.called || match.winner_called);
    let calledWinnerParty = match.called_winner_party ? normalizeParty(match.called_winner_party) : null;

    const candidates = Array.isArray(match.candidates) ? match.candidates.map(c => {
      const party = normalizeParty(c.party);
      const isWinner = Boolean(c.is_winner || c.winner);
      if (isWinner && !calledWinnerParty) calledWinnerParty = party;
      return {
        id: c.id || `cand-${c.name}-${party}`,
        name: c.name || 'Candidate',
        party,
        votes: Number(c.votes || 0),
        votesFormatted: formatVotes(c.votes),
        percentage: formatPercent(c.percentage || c.percent || c.vote_pct),
        isWinner
      };
    }).sort((a, b) => b.votes - a.votes) : [];

    // Identify current leader (even if uncalled)
    const leader = candidates.length > 0 ? candidates[0] : null;

    return {
      id: match.id || `house-${watched.district}`,
      key: watched.district,
      office: 'U.S. House',
      state: watched.state,
      district: watched.district.split('-')[1],
      label: `${watched.district}`,
      closeTimeET: match.poll_close_et || watched.closeTimeET,
      closeInstant: match.poll_close_instant || watched.closeInstant,
      percentReporting: reporting,
      isCalled,
      calledWinnerParty: isCalled ? calledWinnerParty : null,
      leaderParty: leader ? leader.party : null,
      candidates,
      isUnmatched: false
    };
  }).sort(sortRaces);

  // 4. Build Watchlist Race Cards for Senate (14 states + specials)
  const senateCards = [];
  watchlists.senate.forEach(watched => {
    // Find all contests matching this Senate state (regular and special)
    const matches = rawRaces.filter(r => {
      const titleStr = String(r.election_name || r.office || r.type || '').toLowerCase();
      if (!titleStr.includes('senate') && !titleStr.includes('senator')) return false;
      return String(r.state || r.province || '').toUpperCase() === watched.state;
    });

    if (matches.length === 0) {
      senateCards.push({
        id: `senate-unmatched-${watched.state}`,
        key: `SEN-${watched.state}`,
        office: 'U.S. Senate',
        state: watched.state,
        label: `${watched.label}`,
        closeTimeET: watched.closeTimeET,
        closeInstant: watched.closeInstant,
        isSpecial: false,
        percentReporting: 0,
        isCalled: false,
        calledWinnerParty: null,
        candidates: [],
        isUnmatched: true
      });
      return;
    }

    matches.forEach(match => {
      const reporting = clampReporting(match.percent_reporting || match.reporting_percentage || match.precincts_reporting_pct);
      const isCalled = Boolean(match.is_called || match.called || match.winner_called);
      let calledWinnerParty = match.called_winner_party ? normalizeParty(match.called_winner_party) : null;
      const isSpecial = Boolean(match.is_special || String(match.id || '').includes('special') || String(match.canonical_key || '').includes('SPEC'));

      const candidates = Array.isArray(match.candidates) ? match.candidates.map(c => {
        const party = normalizeParty(c.party);
        const isWinner = Boolean(c.is_winner || c.winner);
        if (isWinner && !calledWinnerParty) calledWinnerParty = party;
        return {
          id: c.id || `cand-${c.name}-${party}`,
          name: c.name || 'Candidate',
          party,
          votes: Number(c.votes || 0),
          votesFormatted: formatVotes(c.votes),
          percentage: formatPercent(c.percentage || c.percent || c.vote_pct),
          isWinner
        };
      }).sort((a, b) => b.votes - a.votes) : [];

      const leader = candidates.length > 0 ? candidates[0] : null;

      senateCards.push({
        id: match.id || `senate-${watched.state}${isSpecial ? '-spec' : ''}`,
        key: `SEN-${watched.state}${isSpecial ? '-SPEC' : ''}`,
        office: 'U.S. Senate',
        state: watched.state,
        label: isSpecial ? `${watched.label} (Special)` : `${watched.label}`,
        closeTimeET: match.poll_close_et || watched.closeTimeET,
        closeInstant: match.poll_close_instant || watched.closeInstant,
        isSpecial,
        percentReporting: reporting,
        isCalled,
        calledWinnerParty: isCalled ? calledWinnerParty : null,
        leaderParty: leader ? leader.party : null,
        candidates,
        isUnmatched: false
      });
    });
  });
  senateCards.sort(sortRaces);

  // 5. Build Watchlist Race Cards for Governor (10 states)
  const governorCards = watchlists.governor.map(watched => {
    const match = rawRaces.find(r => {
      const titleStr = String(r.election_name || r.office || r.type || '').toLowerCase();
      if (!titleStr.includes('gov') && !titleStr.includes('gubernatorial')) return false;
      return String(r.state || r.province || '').toUpperCase() === watched.state;
    });

    if (!match) {
      return {
        id: `gov-unmatched-${watched.state}`,
        key: `GOV-${watched.state}`,
        office: 'Governor',
        state: watched.state,
        label: `${watched.label}`,
        closeTimeET: watched.closeTimeET,
        closeInstant: watched.closeInstant,
        percentReporting: 0,
        isCalled: false,
        calledWinnerParty: null,
        candidates: [],
        isUnmatched: true
      };
    }

    const reporting = clampReporting(match.percent_reporting || match.reporting_percentage || match.precincts_reporting_pct);
    const isCalled = Boolean(match.is_called || match.called || match.winner_called);
    let calledWinnerParty = match.called_winner_party ? normalizeParty(match.called_winner_party) : null;

    const candidates = Array.isArray(match.candidates) ? match.candidates.map(c => {
      const party = normalizeParty(c.party);
      const isWinner = Boolean(c.is_winner || c.winner);
      if (isWinner && !calledWinnerParty) calledWinnerParty = party;
      return {
        id: c.id || `cand-${c.name}-${party}`,
        name: c.name || 'Candidate',
        party,
        votes: Number(c.votes || 0),
        votesFormatted: formatVotes(c.votes),
        percentage: formatPercent(c.percentage || c.percent || c.vote_pct),
        isWinner
      };
    }).sort((a, b) => b.votes - a.votes) : [];

    const leader = candidates.length > 0 ? candidates[0] : null;

    return {
      id: match.id || `gov-${watched.state}`,
      key: `GOV-${watched.state}`,
      office: 'Governor',
      state: watched.state,
      label: `${watched.label}`,
      closeTimeET: match.poll_close_et || watched.closeTimeET,
      closeInstant: match.poll_close_instant || watched.closeInstant,
      percentReporting: reporting,
      isCalled,
      calledWinnerParty: isCalled ? calledWinnerParty : null,
      leaderParty: leader ? leader.party : null,
      candidates,
      isUnmatched: false
    };
  }).sort(sortRaces);

  return {
    election: electionConfig.election,
    timestamp: new Date().toISOString(),
    sourceTimestamp: feedData?.timestamp || new Date().toISOString(),
    source: feedData?.source || 'CivicAPI v2',
    isStale,
    error: errorMsg,
    chamberTotals,
    watchlists: {
      house: houseCards,
      senate: senateCards,
      governor: governorCards
    }
  };
}

/**
 * Chronological sorting helper: Sort by closeInstant/closeTimeET -> state -> district
 */
function sortRaces(a, b) {
  const timeA = a.closeInstant || a.closeTimeET || '99:99';
  const timeB = b.closeInstant || b.closeTimeET || '99:99';
  if (timeA !== timeB) return timeA.localeCompare(timeB);

  const stateA = a.state || '';
  const stateB = b.state || '';
  if (stateA !== stateB) return stateA.localeCompare(stateB);

  const distA = a.district ? parseInt(a.district, 10) : 0;
  const distB = b.district ? parseInt(b.district, 10) : 0;
  return distA - distB;
}

module.exports = {
  normalizeParty,
  formatVotes,
  formatPercent,
  clampReporting,
  normalizeElectionData
};
