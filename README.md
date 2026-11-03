# 2026 U.S. Election Night Tracker

A fast, private, and personal election results web application designed to run locally on your laptop in any modern browser. It tracks a curated watchlist of key U.S. House, Senate, and Gubernatorial contests, showing live candidate vote totals, percentages, precincts reporting, and race calls alongside chamber-wide seat counters.

---

## Features

- **Live CivicAPI v2 Integration**: Queries public JSON race-search endpoints with automatic normalization. No API keys or account registration required.
- **Server-Side In-Memory Cache**: 120-second caching layer prevents upstream rate-limiting and conserves bandwidth (~60 requests/hour max).
- **Interactive Seat Counters**: Running totals reflect chamber baselines (seats not on ballot) plus called races from the full feed. Uncalled races are never assigned to leaders.
  - **House**: 435 total (218 for majority)
  - **Senate**: 100 total (31R / 32D / 2I baseline; 35 on ballot; 51 for majority)
  - **Governors**: 50 total (9R / 5D baseline; 36 on ballot; 26 for majority)
- **Chronological Sorting**: Contests are automatically sorted by poll-closing time (Eastern Time), then state and district.
- **Offline Election Simulator**: Built-in 4-stage simulation engine (Pre-Election, Early Returns, Prime-Time Battlegrounds, Late-Night West Coast) to test dashboard UI anytime.
- **Dark Navy Theme**: Mobile-friendly, high-contrast dashboard with live status badges, filter chips, and search bar.
- **Private by Default**: Binds strictly to `127.0.0.1` on your machine. Zero tracking, zero telemetry.

---

## Watchlists Included (November 3, 2026)

- **U.S. House (54 key battleground districts)**:
  `KY-06`, `IN-05`, `VA-07`, `IN-01`, `FL-14`, `FL-22`, `FL-25`, `FL-09`, `FL-07`, `VA-01`, `GA-02`, `GA-01`, `SC-01`, `SC-02`, `VA-05`, `FL-27`, `OH-01`, `OH-13`, `NC-01`, `NC-11`, `OH-07`, `OH-10`, `OH-09`, `NC-09`, `NC-05`, `PA-07`, `PA-10`, `PA-08`, `MI-10`, `MI-04`, `NJ-07`, `MI-07`, `PA-01`, `ME-02`, `TX-15`, `NY-17`, `CO-08`, `AZ-01`, `WI-03`, `IA-01`, `IA-02`, `WI-01`, `AZ-06`, `NE-02`, `IA-03`, `CO-05`, `MT-01`, `CA-22`, `CA-48`, `TX-09`, `TX-28`, `TX-32`, `TX-34`, `TX-35`.
- **U.S. Senate (14 key states + special elections)**:
  `FL` (regular + special), `GA`, `SC`, `NC`, `OH` (regular + special), `ME`, `NH`, `TX`, `MI`, `KS`, `MS`, `IA`, `NE`, `MN`.
- **Governors (10 key states)**:
  `GA`, `FL`, `TX`, `OH`, `NH`, `ME`, `VT`, `OR`, `MN`, `MI`.

---

## Prerequisites

- **Node.js** (v18, v20, or v22 LTS recommended) — [Download from nodejs.org](https://nodejs.org/) or install via Homebrew (`brew install node`).
- **npm** (comes bundled with Node.js).
- Any modern web browser (Chrome, Safari, Firefox, Edge).

---

## Quick Start Installation (Local Laptop)

### 1. Clone or Download the Repository
```bash
git clone https://github.com/<your-username>/election-tracker-2026.git
cd election-tracker-2026
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://127.0.0.1:5173
```
*(The development server automatically starts the local proxy API on port 3001 and the Vite UI on port 5173 with hot-reloading).*

---

## Running in Production Mode

To build the optimized static bundle and run both the API and web UI on a single local port:

```bash
# Build the production frontend bundle
npm run build

# Start the unified local server
npm start
```

Open your browser and navigate to:
```
http://127.0.0.1:3000
```

---

## Using the Built-In Election Simulator

To test the dashboard before election night:
1. Click the **"Simulator"** button in the top-right header.
2. Select any of the 4 timeline stages:
   - **1. Pre-Election (Polls Open - 6:00 PM ET)**: 0% reporting, baseline chamber seat counters.
   - **2. Early Returns (7:30 PM ET)**: Initial returns in FL, GA, VA, IN, KY, SC, VT with early race calls.
   - **3. Prime-Time Battlegrounds (9:30 PM ET)**: Tight battleground counts across OH, NC, PA, MI, TX, WI, IA, CO, AZ.
   - **4. Late-Night West Coast (11:30 PM ET)**: Final poll closings and decisive chamber majorities.
3. Switch back to **"Live CivicAPI Mode"** anytime.

---

## Customizing Watchlists and Baselines

All election parameters, districts, states, baselines, and poll-close schedules are centralized in:
[`config/election-config.json`](config/election-config.json)

To adapt for a different election or modify your watchlist:
- **`election.date`**: Change the target election date (`YYYY-MM-DD`).
- **`baselines`**: Update starting seat counts (seats not on ballot) and majority thresholds.
- **`watchlists.house`**: Add or remove House district objects (`{ "district": "PA-07", "state": "PA", "closeTimeET": "20:00" }`).
- **`watchlists.senate`**: Add or remove Senate state objects.
- **`watchlists.governor`**: Add or remove Governor state objects.

---

## Project Structure

```
election-tracker-2026/
├── config/
│   └── election-config.json    # Centralized election configuration & watchlists
├── server/
│   ├── server.js              # Express backend server (binds to 127.0.0.1)
│   ├── civicApi.js            # CivicAPI v2 client with 120s caching & rate limiting
│   ├── normalizer.js          # Result normalizer, party mapping & seat calculator
│   └── mockData.js            # 4-stage realistic simulation scenario generator
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Live status, last check timestamps & refresh controls
│   │   ├── SeatCounter.jsx    # Chamber majority counters & visual progress bars
│   │   ├── TabNav.jsx         # House, Senate, and Governor tab switcher
│   │   ├── FilterBar.jsx      # Search input & quick status filter chips
│   │   ├── RaceCard.jsx       # Individual race returns, candidate percentages & call badge
│   │   ├── SimulationModal.jsx# Simulator modal for switching timeline stages
│   │   └── Footer.jsx         # CivicAPI attribution & unofficial disclaimer
│   ├── App.jsx                # Main application component & polling scheduler
│   ├── main.jsx               # React entry point
│   └── index.css              # Dark navy styling & Tailwind CSS imports
├── test/
│   └── verify.js              # End-to-end verification script
├── package.json
└── vite.config.mjs
```

---

## Data Attribution & Disclaimer

- **Data Source**: Results powered by the [CivicAPI v2](https://www.civicapi.org) public results system.
- **Disclaimer**: This app is an unofficial personal convenience dashboard for election night monitoring. It is not an official election authority. Certified results are published solely by state and county election officials.

---

## License

MIT License — Feel free to use, modify, and share with friends!
