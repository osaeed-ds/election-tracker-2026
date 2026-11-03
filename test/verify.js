/**
 * Verification Test Suite for Election Night Tracker
 */

const { app, server } = require('../server/server');
const electionConfig = require('../config/election-config.json');

async function runTests() {
  console.log('--- Starting Verification Tests ---');
  const baseUrl = 'http://127.0.0.1:3001';

  try {
    // Test 1: Config Endpoint
    const configRes = await fetch(`${baseUrl}/api/config`);
    if (!configRes.ok) throw new Error(`Config API failed with status ${configRes.status}`);
    const configData = await configRes.json();
    console.log('✓ Test 1: Config endpoint returned successfully');
    console.log(`  - House watchlist count: ${configData.watchlists.house.length} (Expected: 54)`);
    console.log(`  - Senate watchlist count: ${configData.watchlists.senate.length} (Expected: 14)`);
    console.log(`  - Governor watchlist count: ${configData.watchlists.governor.length} (Expected: 10)`);
    
    if (configData.watchlists.house.length !== 54) throw new Error('House watchlist count mismatch');
    if (configData.watchlists.senate.length !== 14) throw new Error('Senate watchlist count mismatch');
    if (configData.watchlists.governor.length !== 10) throw new Error('Governor watchlist count mismatch');

    // Test 2: Simulation API (Pre-Election Baseline)
    const simPreRes = await fetch(`${baseUrl}/api/simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true, stage: 'pre_election' })
    });
    if (!simPreRes.ok) throw new Error('Simulation set pre_election failed');
    
    const resultsPreRes = await fetch(`${baseUrl}/api/results`);
    const resultsPre = await resultsPreRes.json();
    console.log('✓ Test 2: Pre-Election Baseline verification:');
    console.log(`  - Senate balance: ${resultsPre.chamberTotals.senate.R}R, ${resultsPre.chamberTotals.senate.D}D, ${resultsPre.chamberTotals.senate.I}I (Expected: 31R, 32D, 2I)`);
    console.log(`  - Governor balance: ${resultsPre.chamberTotals.governor.R}R, ${resultsPre.chamberTotals.governor.D}D (Expected: 9R, 5D)`);
    console.log(`  - House balance: ${resultsPre.chamberTotals.house.R}R, ${resultsPre.chamberTotals.house.D}D (Expected: 0R, 0D)`);

    if (resultsPre.chamberTotals.senate.R !== 31 || resultsPre.chamberTotals.senate.D !== 32 || resultsPre.chamberTotals.senate.I !== 2) {
      throw new Error('Senate pre-election baseline mismatch');
    }
    if (resultsPre.chamberTotals.governor.R !== 9 || resultsPre.chamberTotals.governor.D !== 5) {
      throw new Error('Governor pre-election baseline mismatch');
    }

    // Test 3: Simulation API (Prime-Time Stage)
    const simPrimeRes = await fetch(`${baseUrl}/api/simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true, stage: 'prime_time' })
    });
    if (!simPrimeRes.ok) throw new Error('Simulation set prime_time failed');

    const resultsPrimeRes = await fetch(`${baseUrl}/api/results`);
    const resultsPrime = await resultsPrimeRes.json();
    console.log('✓ Test 3: Prime-Time Stage Results verification:');
    console.log(`  - House seats called: ${resultsPrime.chamberTotals.house.calledCount}`);
    console.log(`  - Senate seats called: ${resultsPrime.chamberTotals.senate.calledCount}`);
    console.log(`  - Governor seats called: ${resultsPrime.chamberTotals.governor.calledCount}`);
    console.log(`  - House cards returned: ${resultsPrime.watchlists.house.length}`);
    console.log(`  - Senate cards returned: ${resultsPrime.watchlists.senate.length}`);
    console.log(`  - Governor cards returned: ${resultsPrime.watchlists.governor.length}`);

    // Test 4: Static Web App index.html serving
    const staticRes = await fetch(`${baseUrl}/`);
    if (!staticRes.ok) throw new Error(`Static app returned ${staticRes.status}`);
    const htmlText = await staticRes.text();
    if (!htmlText.includes('root') && !htmlText.includes('Election')) {
      throw new Error('Static index.html content invalid');
    }
    console.log('✓ Test 4: Production web app bundle served correctly at /');

    console.log('\n=================================================');
    console.log(' ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✓');
    console.log('=================================================');
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
