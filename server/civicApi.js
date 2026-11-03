/**
 * CivicAPI v2 Client with in-memory caching, rate-limiting, and error resilience.
 * Uses official CivicAPI v2 endpoint: https://civicapi.org/api/v2/race/search
 */

const electionConfig = require('../config/election-config.json');
const { generateSimulationFeed, STAGES } = require('./mockData');
const { normalizeElectionData } = require('./normalizer');

class CivicApiClient {
  constructor() {
    this.cacheTtlMs = (electionConfig.settings.serverCacheTtlSeconds || 120) * 1000;
    this.cachedData = null;
    this.cacheExpiresAt = 0;
    this.lastGoodSnapshot = null;
    this.isFetching = false;
    this.retryAfterUntil = 0;
    this.failureCount = 0;
    
    // Simulation state
    this.simulationMode = false;
    this.simulationStage = STAGES.PRIME_TIME;
  }

  setSimulationMode(enabled, stage = STAGES.PRIME_TIME) {
    this.simulationMode = Boolean(enabled);
    if (stage) this.simulationStage = stage;
    this.clearCache();
  }

  clearCache() {
    this.cachedData = null;
    this.cacheExpiresAt = 0;
  }

  async getNormalizedResults(forceRefresh = false) {
    const now = Date.now();

    // If simulation mode is enabled, generate simulation feed immediately
    if (this.simulationMode) {
      const mockFeed = generateSimulationFeed(this.simulationStage);
      const normalized = normalizeElectionData(mockFeed);
      normalized.isSimulated = true;
      normalized.simulationStage = this.simulationStage;
      return normalized;
    }

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && this.cachedData && now < this.cacheExpiresAt) {
      return {
        ...this.cachedData,
        cacheHit: true,
        cacheTtlRemainingSec: Math.max(0, Math.round((this.cacheExpiresAt - now) / 1000))
      };
    }

    // If respect Retry-After window
    if (now < this.retryAfterUntil && this.lastGoodSnapshot) {
      return {
        ...this.lastGoodSnapshot,
        isStale: true,
        error: `Rate limited by CivicAPI. Backing off until ${new Date(this.retryAfterUntil).toLocaleTimeString()}`
      };
    }

    // Single-flight lock: if already fetching, return last good snapshot or wait
    if (this.isFetching && this.cachedData) {
      return this.cachedData;
    }

    this.isFetching = true;

    try {
      const liveFeed = await this.fetchLiveCivicData();
      const normalized = normalizeElectionData(liveFeed);
      
      this.cachedData = normalized;
      this.cacheExpiresAt = Date.now() + this.cacheTtlMs;
      this.lastGoodSnapshot = normalized;
      this.failureCount = 0;
      this.retryAfterUntil = 0;

      return {
        ...normalized,
        cacheHit: false,
        cacheTtlRemainingSec: Math.round(this.cacheTtlMs / 1000)
      };
    } catch (err) {
      this.failureCount += 1;
      const backoffMs = Math.min(60000, Math.pow(2, this.failureCount) * (electionConfig.settings.retryBackoffBaseMs || 5000));
      this.retryAfterUntil = Date.now() + backoffMs;

      console.warn(`[CivicAPI] Fetch failed (${err.message}). Retaining last good snapshot. Backing off for ${Math.round(backoffMs/1000)}s`);

      if (this.lastGoodSnapshot) {
        return {
          ...this.lastGoodSnapshot,
          isStale: true,
          error: `Upstream CivicAPI warning: ${err.message}. Showing last good snapshot.`
        };
      }

      // If no prior snapshot, fall back to pre-election baseline snapshot
      const fallbackFeed = generateSimulationFeed(STAGES.PRE_ELECTION);
      const fallbackData = normalizeElectionData(fallbackFeed, true, `CivicAPI notice: ${err.message}. Initializing baseline counters.`);
      fallbackData.isFallback = true;
      return fallbackData;
    } finally {
      this.isFetching = false;
    }
  }

  async fetchLiveCivicData() {
    const electionDate = electionConfig.election.date;
    // Official CivicAPI v2 search endpoint
    const url = `https://civicapi.org/api/v2/race/search?election_date=${electionDate}&country=US&limit=500`;

    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'ElectionTracker2026/1.0 (Personal Local Dashboard)'
    };

    const res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });

    if (res.status === 429) {
      const retryAfterHeader = res.headers?.get('retry-after');
      const waitSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
      this.retryAfterUntil = Date.now() + (waitSeconds * 1000);
      throw new Error(`HTTP 429 Too Many Requests. Retry-After: ${waitSeconds}s`);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const races = Array.isArray(data.races) ? data.races : [];

    return {
      source: 'CivicAPI v2 (Live)',
      timestamp: new Date().toISOString(),
      election_date: electionDate,
      results: races
    };
  }
}

module.exports = new CivicApiClient();
