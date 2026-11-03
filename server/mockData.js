/**
 * Realistic Mock Election Night Data Generator for 2026 General Election
 * Provides comprehensive data across all 54 watched House races,
 * 14 watched Senate states, 10 watched Governor states, plus other national races
 * to demonstrate full chamber counters across 4 timeline stages.
 */

const electionConfig = require('../config/election-config.json');

const STAGES = {
  PRE_ELECTION: 'pre_election', // 0% reporting, all uncalled
  EARLY_RETURNS: 'early_returns', // 7:30 PM ET (FL, GA, VA, IN, KY, SC reporting)
  PRIME_TIME: 'prime_time', // 9:30 PM ET (Midwest, TX, PA, OH battlegrounds)
  LATE_NIGHT: 'late_night' // 11:30 PM ET (West Coast, decisive majorities forming)
};

// Candidate rosters for watchlists
const CANDIDATES = {
  house: {
    'IN-01': [{ name: 'Frank Mrvan', party: 'D' }, { name: 'Randy Niemeyer', party: 'R' }],
    'IN-05': [{ name: 'Victoria Spartz', party: 'R' }, { name: 'Deborah Pickett', party: 'D' }],
    'KY-06': [{ name: 'Andy Barr', party: 'R' }, { name: 'Randy Keck', party: 'D' }],
    'FL-07': [{ name: 'Cory Mills', party: 'R' }, { name: 'Jennifer Adams', party: 'D' }],
    'FL-09': [{ name: 'Darren Soto', party: 'D' }, { name: 'Thomas Chalifoux', party: 'R' }],
    'FL-14': [{ name: 'Kathy Castor', party: 'D' }, { name: 'Rocky Rochford', party: 'R' }],
    'FL-22': [{ name: 'Lois Frankel', party: 'D' }, { name: 'Dan Franzese', party: 'R' }],
    'FL-25': [{ name: 'Debbie Wasserman Schultz', party: 'D' }, { name: 'Bryan Leib', party: 'R' }],
    'FL-27': [{ name: 'Maria Elvira Salazar', party: 'R' }, { name: 'Lucia Baez-Geller', party: 'D' }],
    'GA-01': [{ name: 'Buddy Carter', party: 'R' }, { name: 'Patti Hewitt', party: 'D' }],
    'GA-02': [{ name: 'Sanford Bishop', party: 'D' }, { name: 'Wayne Johnson', party: 'R' }],
    'SC-01': [{ name: 'Nancy Mace', party: 'R' }, { name: 'Michael B. Moore', party: 'D' }],
    'SC-02': [{ name: 'Joe Wilson', party: 'R' }, { name: 'David Robinson II', party: 'D' }],
    'VA-01': [{ name: 'Rob Wittman', party: 'R' }, { name: 'Leslie Mehta', party: 'D' }],
    'VA-05': [{ name: 'John McGuire', party: 'R' }, { name: 'Gloria Witt', party: 'D' }],
    'VA-07': [{ name: 'Eugene Vindman', party: 'D' }, { name: 'Derrick Anderson', party: 'R' }],
    'NC-01': [{ name: 'Don Davis', party: 'D' }, { name: 'Laurie Buckhout', party: 'R' }],
    'NC-05': [{ name: 'Virginia Foxx', party: 'R' }, { name: 'Chuck Hubbard', party: 'D' }],
    'NC-09': [{ name: 'Richard Hudson', party: 'R' }, { name: 'Nigel Bristow', party: 'D' }],
    'NC-11': [{ name: 'Chuck Edwards', party: 'R' }, { name: 'Caleb Rudow', party: 'D' }],
    'OH-01': [{ name: 'Greg Landsman', party: 'D' }, { name: 'Orlando Sonza', party: 'R' }],
    'OH-07': [{ name: 'Max Miller', party: 'R' }, { name: 'Matthew Diemer', party: 'D' }],
    'OH-09': [{ name: 'Marcy Kaptur', party: 'D' }, { name: 'Derek Merrin', party: 'R' }],
    'OH-10': [{ name: 'Mike Turner', party: 'R' }, { name: 'Amy Cox', party: 'D' }],
    'OH-13': [{ name: 'Emilia Sykes', party: 'D' }, { name: 'Kevin Coughlin', party: 'R' }],
    'ME-02': [{ name: 'Jared Golden', party: 'D' }, { name: 'Austin Theriault', party: 'R' }],
    'MI-04': [{ name: 'Bill Huizenga', party: 'R' }, { name: 'Jessica Swartz', party: 'D' }],
    'MI-07': [{ name: 'Curtis Hertel', party: 'D' }, { name: 'Tom Barrett', party: 'R' }],
    'MI-10': [{ name: 'John James', party: 'R' }, { name: 'Carl Marlinga', party: 'D' }],
    'NJ-07': [{ name: 'Thomas Kean Jr.', party: 'R' }, { name: 'Sue Altman', party: 'D' }],
    'PA-01': [{ name: 'Brian Fitzpatrick', party: 'R' }, { name: 'Ashley Ehasz', party: 'D' }],
    'PA-07': [{ name: 'Susan Wild', party: 'D' }, { name: 'Ryan Mackenzie', party: 'R' }],
    'PA-08': [{ name: 'Matt Cartwright', party: 'D' }, { name: 'Rob Bresnahan', party: 'R' }],
    'PA-10': [{ name: 'Scott Perry', party: 'R' }, { name: 'Janelle Stelson', party: 'D' }],
    'TX-09': [{ name: 'Al Green', party: 'D' }, { name: 'Melissa Bain', party: 'R' }],
    'TX-15': [{ name: 'Monica De La Cruz', party: 'R' }, { name: 'Michelle Vallejo', party: 'D' }],
    'TX-28': [{ name: 'Henry Cuellar', party: 'D' }, { name: 'Jay Furman', party: 'R' }],
    'TX-32': [{ name: 'Julie Johnson', party: 'D' }, { name: 'Darrell Day', party: 'R' }],
    'TX-34': [{ name: 'Vicente Gonzalez', party: 'D' }, { name: 'Mayra Flores', party: 'R' }],
    'TX-35': [{ name: 'Greg Casar', party: 'D' }, { name: 'Steven Wright', party: 'R' }],
    'AZ-01': [{ name: 'David Schweikert', party: 'R' }, { name: 'Amish Shah', party: 'D' }],
    'AZ-06': [{ name: 'Juan Ciscomani', party: 'R' }, { name: 'Kirsten Engel', party: 'D' }],
    'CO-05': [{ name: 'Jeff Crank', party: 'R' }, { name: 'River Gassen', party: 'D' }],
    'CO-08': [{ name: 'Yadira Caraveo', party: 'D' }, { name: 'Gabe Evans', party: 'R' }],
    'IA-01': [{ name: 'Mariannette Miller-Meeks', party: 'R' }, { name: 'Christina Bohannan', party: 'D' }],
    'IA-02': [{ name: 'Ashley Hinson', party: 'R' }, { name: 'Sarah Corkery', party: 'D' }],
    'IA-03': [{ name: 'Zach Nunn', party: 'R' }, { name: 'Lanon Baccam', party: 'D' }],
    'NE-02': [{ name: 'Don Bacon', party: 'R' }, { name: 'Tony Vargas', party: 'D' }],
    'NY-17': [{ name: 'Mike Lawler', party: 'R' }, { name: 'Mondaire Jones', party: 'D' }],
    'WI-01': [{ name: 'Bryan Steil', party: 'R' }, { name: 'Peter Barca', party: 'D' }],
    'WI-03': [{ name: 'Derrick Van Orden', party: 'R' }, { name: 'Rebecca Cooke', party: 'D' }],
    'MT-01': [{ name: 'Ryan Zinke', party: 'R' }, { name: 'Monica Tranel', party: 'D' }],
    'CA-22': [{ name: 'David Valadao', party: 'R' }, { name: 'Rudy Salas', party: 'D' }],
    'CA-48': [{ name: 'Darrell Issa', party: 'R' }, { name: 'Stephen Houlahan', party: 'D' }]
  },
  senate: {
    'FL': [{ name: 'Rick Scott', party: 'R' }, { name: 'Debbie Mucarsel-Powell', party: 'D' }],
    'FL-S': [{ name: 'Marco Rubio Seat (Special)', party: 'R', isSpecial: true }, { name: 'Democratic Nominee', party: 'D', isSpecial: true }],
    'GA': [{ name: 'Jon Ossoff', party: 'D' }, { name: 'Republican Challenger', party: 'R' }],
    'SC': [{ name: 'Lindsey Graham', party: 'R' }, { name: 'Democratic Challenger', party: 'D' }],
    'NC': [{ name: 'Thom Tillis', party: 'R' }, { name: 'Democratic Challenger', party: 'D' }],
    'OH': [{ name: 'Sherrod Brown Seat', party: 'R' }, { name: 'Democratic Challenger', party: 'D' }],
    'OH-S': [{ name: 'JD Vance Seat (Special)', party: 'R', isSpecial: true }, { name: 'Democratic Nominee', party: 'D', isSpecial: true }],
    'ME': [{ name: 'Susan Collins', party: 'R' }, { name: 'Democratic Challenger', party: 'D' }, { name: 'Independent Candidate', party: 'I' }],
    'NH': [{ name: 'Jeanne Shaheen', party: 'D' }, { name: 'Republican Challenger', party: 'R' }],
    'TX': [{ name: 'John Cornyn', party: 'R' }, { name: 'Democratic Challenger', party: 'D' }],
    'MI': [{ name: 'Gary Peters', party: 'D' }, { name: 'Republican Challenger', party: 'R' }],
    'MS': [{ name: 'Cindy Hyde-Smith', party: 'R' }, { name: 'Democratic Challenger', party: 'D' }],
    'IA': [{ name: 'Joni Ernst', party: 'R' }, { name: 'Democratic Challenger', party: 'D' }],
    'KS': [{ name: 'Roger Marshall', party: 'R' }, { name: 'Democratic Challenger', party: 'D' }],
    'MN': [{ name: 'Tina Smith', party: 'D' }, { name: 'Republican Challenger', party: 'R' }],
    'NE': [{ name: 'Pete Ricketts', party: 'R' }, { name: 'Dan Osborn', party: 'I' }]
  },
  governor: {
    'FL': [{ name: 'Republican Nominee', party: 'R' }, { name: 'Democratic Nominee', party: 'D' }],
    'GA': [{ name: 'Republican Nominee', party: 'R' }, { name: 'Democratic Nominee', party: 'D' }],
    'VT': [{ name: 'Phil Scott', party: 'R' }, { name: 'Democratic Nominee', party: 'D' }],
    'OH': [{ name: 'Republican Nominee', party: 'R' }, { name: 'Democratic Nominee', party: 'D' }],
    'ME': [{ name: 'Democratic Nominee', party: 'D' }, { name: 'Republican Nominee', party: 'R' }],
    'MI': [{ name: 'Democratic Nominee', party: 'D' }, { name: 'Republican Nominee', party: 'R' }],
    'NH': [{ name: 'Kelly Ayotte', party: 'R' }, { name: 'Joyce Craig', party: 'D' }],
    'TX': [{ name: 'Greg Abbott', party: 'R' }, { name: 'Democratic Nominee', party: 'D' }],
    'MN': [{ name: 'Tim Walz', party: 'D' }, { name: 'Republican Nominee', party: 'R' }],
    'OR': [{ name: 'Tina Kotek', party: 'D' }, { name: 'Republican Nominee', party: 'R' }]
  }
};

function generateSimulationFeed(stage = STAGES.PRIME_TIME) {
  const electionDate = electionConfig.election.date;
  const races = [];

  // Progression multipliers by stage and poll close hour
  const getStageReporting = (closeHourET, stageName) => {
    if (stageName === STAGES.PRE_ELECTION) return 0;
    if (stageName === STAGES.EARLY_RETURNS) {
      if (closeHourET <= 19) return Math.floor(45 + Math.random() * 45); // 45-90%
      if (closeHourET === 19.5) return Math.floor(15 + Math.random() * 30); // 15-45%
      return 0; // Later polls still closed
    }
    if (stageName === STAGES.PRIME_TIME) {
      if (closeHourET <= 19.5) return Math.floor(88 + Math.random() * 12); // 88-100%
      if (closeHourET === 20) return Math.floor(60 + Math.random() * 35); // 60-95%
      if (closeHourET === 21) return Math.floor(30 + Math.random() * 40); // 30-70%
      return Math.floor(5 + Math.random() * 15); // 5-20%
    }
    // LATE_NIGHT
    if (closeHourET <= 21) return Math.floor(95 + Math.random() * 5);
    return Math.floor(75 + Math.random() * 24);
  };

  const getCallStatus = (reporting, margin) => {
    if (reporting >= 90 && Math.abs(margin) > 2) return true;
    if (reporting >= 65 && Math.abs(margin) > 8) return true;
    if (reporting >= 40 && Math.abs(margin) > 15) return true;
    return false;
  };

  // 1. House Watchlist Races
  electionConfig.watchlists.house.forEach((item, index) => {
    const [hourStr, minStr] = item.closeTimeET.split(':');
    const closeHour = parseInt(hourStr, 10) + (parseInt(minStr, 10) === 30 ? 0.5 : 0);
    const reporting = Math.min(100, Math.max(0, getStageReporting(closeHour, stage)));
    
    const candList = CANDIDATES.house[item.district] || [
      { name: 'Democratic Candidate', party: 'D' },
      { name: 'Republican Candidate', party: 'R' }
    ];

    // Seed realistic margins
    const seed = (index * 17) % 21 - 10; // -10 to +10 margin
    const demPct = Math.round((50 + seed + (index % 3 === 0 ? 3 : -2)) * 10) / 10;
    const repPct = Math.round((100 - demPct) * 10) / 10;

    const baseTurnout = 280000 + (index * 4500) % 70000;
    const countedVotes = Math.round((baseTurnout * reporting) / 100);
    const demVotes = Math.round(countedVotes * (demPct / 100));
    const repVotes = countedVotes - demVotes;

    const isCalled = getCallStatus(reporting, demPct - repPct);
    const winnerParty = isCalled ? (demPct > repPct ? 'D' : 'R') : null;

    const candidates = candList.map(c => {
      const isDem = c.party === 'D';
      return {
        id: `cand-house-${item.district}-${c.party}`,
        name: c.name,
        party: c.party,
        votes: isDem ? demVotes : repVotes,
        percentage: isDem ? demPct : repPct,
        is_winner: winnerParty === c.party
      };
    });

    races.push({
      id: `us-house-2026-${item.district.toLowerCase()}`,
      election_date: electionDate,
      office: 'U.S. House',
      state: item.state,
      district: item.district.split('-')[1],
      canonical_key: item.district,
      poll_close_et: item.closeTimeET,
      poll_close_instant: item.closeInstant,
      percent_reporting: reporting,
      is_called: isCalled,
      called_winner_party: winnerParty,
      candidates
    });
  });

  // 2. Additional Non-Watchlist House Races (to drive realistic total chamber progress towards 435)
  const totalOtherHouseSeats = 381; // 435 - 54
  const calledOtherHouseCount = stage === STAGES.PRE_ELECTION ? 0 :
    stage === STAGES.EARLY_RETURNS ? 42 :
    stage === STAGES.PRIME_TIME ? 185 : 340;

  for (let i = 1; i <= calledOtherHouseCount; i++) {
    const isDem = (i % 2 === 0);
    races.push({
      id: `us-house-other-${i}`,
      election_date: electionDate,
      office: 'U.S. House',
      state: `ST${i}`,
      district: `${i}`,
      canonical_key: `OTHER-H-${i}`,
      percent_reporting: 100,
      is_called: true,
      called_winner_party: isDem ? 'D' : 'R',
      candidates: [
        { id: `c-h-${i}-1`, name: isDem ? 'Democratic Winner' : 'Republican Winner', party: isDem ? 'D' : 'R', votes: 150000, percentage: 56.5, is_winner: true },
        { id: `c-h-${i}-2`, name: isDem ? 'Republican Candidate' : 'Democratic Candidate', party: isDem ? 'R' : 'D', votes: 115000, percentage: 43.5, is_winner: false }
      ]
    });
  }

  // 3. Senate Watchlist Races (14 states + specials)
  electionConfig.watchlists.senate.forEach((item, index) => {
    const [hourStr, minStr] = item.closeTimeET.split(':');
    const closeHour = parseInt(hourStr, 10) + (parseInt(minStr, 10) === 30 ? 0.5 : 0);
    const reporting = Math.min(100, Math.max(0, getStageReporting(closeHour, stage)));

    const cList = CANDIDATES.senate[item.state] || [
      { name: 'Democratic Nominee', party: 'D' },
      { name: 'Republican Nominee', party: 'R' }
    ];

    const margin = (item.state === 'TX' || item.state === 'SC' || item.state === 'MS' || item.state === 'KS') ? 8 :
                   (item.state === 'GA' || item.state === 'MI' || item.state === 'MN') ? -4 : 2;
    const repPct = Math.round((50 + margin) * 10) / 10;
    const demPct = Math.round((100 - repPct) * 10) / 10;

    const baseTurnout = 2200000 + (index * 120000) % 1500000;
    const countedVotes = Math.round((baseTurnout * reporting) / 100);
    const repVotes = Math.round(countedVotes * (repPct / 100));
    const demVotes = countedVotes - repVotes;

    const isCalled = getCallStatus(reporting, repPct - demPct);
    const winnerParty = isCalled ? (repPct > demPct ? 'R' : (item.state === 'NE' ? 'I' : 'D')) : null;

    const candidates = cList.map(c => {
      const isR = c.party === 'R';
      return {
        id: `cand-senate-${item.state}-${c.party}`,
        name: c.name,
        party: c.party,
        votes: isR ? repVotes : demVotes,
        percentage: isR ? repPct : demPct,
        is_winner: winnerParty === c.party
      };
    });

    races.push({
      id: `us-senate-2026-${item.state.toLowerCase()}-regular`,
      election_date: electionDate,
      office: 'U.S. Senate',
      state: item.state,
      state_label: item.label,
      canonical_key: `SEN-${item.state}`,
      is_special: false,
      poll_close_et: item.closeTimeET,
      poll_close_instant: item.closeInstant,
      percent_reporting: reporting,
      is_called: isCalled,
      called_winner_party: winnerParty,
      candidates
    });

    // Special Election for FL and OH if configured
    if (item.hasSpecial) {
      const specialKey = `${item.state}-S`;
      const specCandidates = CANDIDATES.senate[specialKey] || [
        { name: `${item.label} Special GOP Nominee`, party: 'R', isSpecial: true },
        { name: `${item.label} Special Dem Nominee`, party: 'D', isSpecial: true }
      ];

      const specReporting = Math.max(0, reporting - 2);
      const specCalled = getCallStatus(specReporting, 6);
      const specWinner = specCalled ? 'R' : null;

      races.push({
        id: `us-senate-2026-${item.state.toLowerCase()}-special`,
        election_date: electionDate,
        office: 'U.S. Senate',
        state: item.state,
        state_label: `${item.label} (Special Election)`,
        canonical_key: `SEN-${item.state}-SPEC`,
        is_special: true,
        poll_close_et: item.closeTimeET,
        poll_close_instant: item.closeInstant,
        percent_reporting: specReporting,
        is_called: specCalled,
        called_winner_party: specWinner,
        candidates: specCandidates.map(c => ({
          id: `cand-senate-${item.state}-spec-${c.party}`,
          name: c.name,
          party: c.party,
          votes: Math.round(countedVotes * (c.party === 'R' ? 0.53 : 0.47)),
          percentage: c.party === 'R' ? 53.0 : 47.0,
          is_winner: specWinner === c.party
        }))
      });
    }
  });

  // 4. Additional Non-Watchlist Senate Races (to make up 35 seats on ballot)
  const otherSenateSeatsOnBallot = 35 - 16; // 19 additional seats
  const otherSenateCalledCount = stage === STAGES.PRE_ELECTION ? 0 :
    stage === STAGES.EARLY_RETURNS ? 4 :
    stage === STAGES.PRIME_TIME ? 11 : 18;

  for (let i = 1; i <= otherSenateCalledCount; i++) {
    const isR = (i % 2 === 1);
    races.push({
      id: `us-senate-other-${i}`,
      election_date: electionDate,
      office: 'U.S. Senate',
      state: `ST-SEN-${i}`,
      state_label: `State ${i}`,
      canonical_key: `OTHER-SEN-${i}`,
      percent_reporting: 100,
      is_called: true,
      called_winner_party: isR ? 'R' : 'D',
      candidates: [
        { id: `c-s-${i}-1`, name: isR ? 'Republican Senator' : 'Democratic Senator', party: isR ? 'R' : 'D', votes: 900000, percentage: 55.0, is_winner: true },
        { id: `c-s-${i}-2`, name: isR ? 'Democratic Candidate' : 'Republican Candidate', party: isR ? 'D' : 'R', votes: 730000, percentage: 45.0, is_winner: false }
      ]
    });
  }

  // 5. Governor Watchlist Races (10 states)
  electionConfig.watchlists.governor.forEach((item, index) => {
    const [hourStr, minStr] = item.closeTimeET.split(':');
    const closeHour = parseInt(hourStr, 10) + (parseInt(minStr, 10) === 30 ? 0.5 : 0);
    const reporting = Math.min(100, Math.max(0, getStageReporting(closeHour, stage)));

    const cList = CANDIDATES.governor[item.state] || [
      { name: 'Republican Nominee', party: 'R' },
      { name: 'Democratic Nominee', party: 'D' }
    ];

    const isDemLeaning = (item.state === 'MI' || item.state === 'OR' || item.state === 'MN');
    const isRepLeaning = (item.state === 'FL' || item.state === 'TX' || item.state === 'OH' || item.state === 'VT' || item.state === 'GA');
    const margin = isRepLeaning ? 7 : (isDemLeaning ? -6 : 1);
    const repPct = Math.round((50 + margin) * 10) / 10;
    const demPct = Math.round((100 - repPct) * 10) / 10;

    const baseTurnout = 1800000 + (index * 95000) % 1200000;
    const countedVotes = Math.round((baseTurnout * reporting) / 100);
    const repVotes = Math.round(countedVotes * (repPct / 100));
    const demVotes = countedVotes - repVotes;

    const isCalled = getCallStatus(reporting, repPct - demPct);
    const winnerParty = isCalled ? (repPct > demPct ? 'R' : 'D') : null;

    const candidates = cList.map(c => {
      const isR = c.party === 'R';
      return {
        id: `cand-gov-${item.state}-${c.party}`,
        name: c.name,
        party: c.party,
        votes: isR ? repVotes : demVotes,
        percentage: isR ? repPct : demPct,
        is_winner: winnerParty === c.party
      };
    });

    races.push({
      id: `gov-2026-${item.state.toLowerCase()}`,
      election_date: electionDate,
      office: 'Governor',
      state: item.state,
      state_label: item.label,
      canonical_key: `GOV-${item.state}`,
      poll_close_et: item.closeTimeET,
      poll_close_instant: item.closeInstant,
      percent_reporting: reporting,
      is_called: isCalled,
      called_winner_party: winnerParty,
      candidates
    });
  });

  // 6. Additional Non-Watchlist Governor Races (36 total on ballot)
  const otherGovSeatsOnBallot = 36 - 10; // 26 additional
  const otherGovCalledCount = stage === STAGES.PRE_ELECTION ? 0 :
    stage === STAGES.EARLY_RETURNS ? 5 :
    stage === STAGES.PRIME_TIME ? 16 : 24;

  for (let i = 1; i <= otherGovCalledCount; i++) {
    const isR = (i % 2 === 0);
    races.push({
      id: `gov-other-${i}`,
      election_date: electionDate,
      office: 'Governor',
      state: `ST-GOV-${i}`,
      state_label: `State ${i}`,
      canonical_key: `OTHER-GOV-${i}`,
      percent_reporting: 100,
      is_called: true,
      called_winner_party: isR ? 'R' : 'D',
      candidates: [
        { id: `c-g-${i}-1`, name: isR ? 'Republican Governor' : 'Democratic Governor', party: isR ? 'R' : 'D', votes: 650000, percentage: 54.0, is_winner: true },
        { id: `c-g-${i}-2`, name: isR ? 'Democratic Candidate' : 'Republican Candidate', party: isR ? 'D' : 'R', votes: 550000, percentage: 46.0, is_winner: false }
      ]
    });
  }

  return {
    source: 'CivicAPI v2 (Simulated)',
    timestamp: new Date().toISOString(),
    election_date: electionDate,
    stage,
    results: races
  };
}

module.exports = {
  STAGES,
  generateSimulationFeed
};
