/**
 * Local Express Backend Server for Election Night Tracker
 * Binds strictly to 127.0.0.1 for local privacy and security.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const electionConfig = require('../config/election-config.json');
const civicApiClient = require('./civicApi');
const { STAGES } = require('./mockData');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '127.0.0.1';

// Middlewares
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', `http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`] }));
app.use(express.json());

// 1. Get Live or Simulated Election Results
app.get('/api/results', async (req, res) => {
  try {
    const forceRefresh = req.query.force === 'true';
    const results = await civicApiClient.getNormalizedResults(forceRefresh);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve election results', details: err.message });
  }
});

// 2. Get Current Election Configuration
app.get('/api/config', (req, res) => {
  res.json(electionConfig);
});

// 3. Simulation Controls
app.get('/api/simulation/status', (req, res) => {
  res.json({
    simulationMode: civicApiClient.simulationMode,
    simulationStage: civicApiClient.simulationStage,
    availableStages: Object.values(STAGES)
  });
});

app.post('/api/simulation', (req, res) => {
  const { enabled, stage } = req.body;
  if (stage && !Object.values(STAGES).includes(stage)) {
    return res.status(400).json({ error: `Invalid simulation stage. Must be one of: ${Object.values(STAGES).join(', ')}` });
  }
  civicApiClient.setSimulationMode(enabled, stage);
  res.json({
    success: true,
    simulationMode: civicApiClient.simulationMode,
    simulationStage: civicApiClient.simulationStage
  });
});

// Serve frontend build in production mode
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Election Tracker API is running. Build frontend with "npm run build" to view web dashboard.');
    }
  });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`=================================================`);
  console.log(` Election Tracker 2026 Local Server Running`);
  console.log(` URL: http://${HOST}:${PORT}`);
  console.log(` Target: ${electionConfig.election.title} (${electionConfig.election.date})`);
  console.log(` CivicAPI Cache TTL: ${electionConfig.settings.serverCacheTtlSeconds}s`);
  console.log(`=================================================`);
});

module.exports = { app, server };
