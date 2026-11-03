# Election Night Tracker - Requirements Specification

**Version:** 1.0  
**Prepared:** November 3, 2026  
**Purpose:** A handoff brief for a developer or AI implementing a private, personal-use U.S. election results dashboard.

## 1. Product summary

Build a mobile-friendly dashboard for one person's election-night use. It tracks a selected watchlist of U.S. House, Senate, and gubernatorial contests; shows live candidate vote totals, vote percentages, estimated precincts reporting, and calls; and summarizes party seat counts across each chamber or office.

Use CivicAPI for vote totals, reporting percentages, and its own race calls. The app is an unofficial convenience view, not an election authority or certification source. Keep it private behind the owner's ChatGPT sign-in when hosted on ChatGPT Sites.

The current configuration targets the November 3, 2026 general election. Keep the election date, watched races, poll-close schedule, baseline counts, polling interval, and cache duration in one editable configuration area so the tracker can be adapted for a different election.

## 2. Users and scope

- Primary user: one person, for personal, non-commercial use.
- Offices: U.S. House, U.S. Senate, and state governor.
- Results source: CivicAPI only for live results and calls.
- Hosting: private ChatGPT Site, using a Worker proxy for CivicAPI requests.
- No user accounts, comments, notifications, predictions, or public sharing are required.

## 3. Race watchlists

Show three office tabs. Within each tab, sort races by poll-close time, then state, then district where applicable. Use CivicAPI poll-close metadata when available; otherwise use a maintained election-specific schedule. Display close times in Eastern Time and keep sorting based on the actual close instant.

### House districts (54)

KY-06, IN-05, VA-07, IN-01, FL-14, FL-22, FL-25, FL-09, FL-07, VA-01, GA-02, GA-01, SC-01, SC-02, VA-05, FL-27, OH-01, OH-13, NC-01, NC-11, OH-07, OH-10, OH-09, NC-09, NC-05, PA-07, PA-10, PA-08, MI-10, MI-04, NJ-07, MI-07, PA-01, ME-02, TX-15, NY-17, CO-08, AZ-01, WI-03, IA-01, IA-02, WI-01, AZ-06, NE-02, IA-03, CO-05, MT-01, CA-22, CA-48, TX-09, TX-28, TX-32, TX-34, TX-35.

The list includes the extra districts identified in the source graphic's footnotes: PA-07, PA-10, TX-09, TX-28, TX-32, TX-34, and TX-35. Do not silently discard a requested district if CivicAPI cannot match it; show it as unavailable or unmatched.

### Senate states (14)

FL, GA, SC, NC, OH, ME, NH, TX, MI, KS, MS, IA, NE, MN.

### Governor states (10)

GA, FL, TX, OH, NH, ME, VT, OR, MN, MI.

If the feed has more than one Senate contest in a selected state, show each contest separately and count each called seat separately.

## 4. Seat-counter behavior

The counter is a running count of seats accounted for by seats not on the ballot plus called election results. An uncalled race must not be assigned to the current leader.

### Starting balances for the November 3, 2026 configuration

| Office | Starting counts (seats not on ballot) | Seats on ballot | Chamber/office size |
|---|---:|---:|---:|
| House | 0 R, 0 D, 0 I | 435 | 435 |
| Senate | 31 R, 32 D, 2 I | 35 | 100 |
| Governors | 9 R, 5 D | 36 | 50 |

- The Senate baseline reflects 35 seats on the 2026 ballot: 33 regular elections plus special elections in Florida and Ohio. It excludes all 35 from the initial balance.
- The governor baseline excludes the 36 state governorships on the 2026 ballot.
- Independent senators are counted as Independent, even though they caucus with Democrats.
- As CivicAPI marks any House, Senate, or governor contest called, add one seat to the winner's party bucket. This applies to every applicable race in the full CivicAPI feed, including contests outside the card watchlists.
- Normalize parties into Republican (R), Democratic (D), Independent (I), and Other (O). Preserve the distinction between a candidate leading and a race being called.
- Display the chamber/office size separately from the number of currently accounted seats. Also show called-race progress so users can see why a tally is below the full chamber size.
- Avoid double counting repeated feed rows. Prefer stable race IDs; for Senate, do not key contests only by state because a special and regular contest can share a state.

## 5. Race-card requirements

Each race card should show:

- Race label: state and office; district for House.
- Candidate name and party, with vote count and vote percentage for each candidate available from CivicAPI.
- Percent precincts or ballot batches reporting, using CivicAPI's field and definition.
- A prominent Called or Uncalled status based only on CivicAPI's call indicator.
- Poll-close time in Eastern Time.
- A clear empty/unmatched state if the feed has no corresponding race.

Candidate votes should be formatted with thousands separators; percentages should be shown to one decimal place. The reporting bar must be clamped to 0-100 for display. Keep race status visually distinct from vote leader status.

## 6. Data feed and normalization

Use CivicAPI v2's public JSON race-search endpoints. No API key or registration is required.

- Query U.S. General elections for House and Senate results.
- Query U.S. Statewide elections for governor results.
- Filter results to the configured election date and U.S. states; exclude nationwide aggregate rows and territories from state seat totals.
- Map each feed race to an office and canonical key (for example, `CA-22` for House or a unique race ID plus state for Senate).
- Read candidate name, party, votes, percentage, and winner/call fields; read race percent_reporting and any available poll-close metadata.
- Validate actual CivicAPI response shape and office labels against the API documentation before release. Search summaries may not include every detail available from an individual race endpoint.
- Candidate party mapping should handle common labels and abbreviations, including Republican/GOP/R, Democratic/Democrat/D, Independent/Ind, and unknown/third parties as Other.
- Include a visible CivicAPI attribution link and a note that official election authorities are the source for certified results.

## 7. API traffic, refresh, and resilience

CivicAPI's published FAQ says its results system updates every 5-10 seconds, permits personal use, and requires no API key. The public documentation reviewed for this brief did not state a request-rate limit. The app must therefore use conservative polling and handle limits gracefully.

- Browser refresh target: every 2 minutes while the page is visible.
- Server-side cache: 120 seconds for feed responses and normalized results. Repeated clicks and multiple browser checks within the cache window should reuse cached data.
- There are two upstream feed requests per uncached refresh (General and Statewide), approximately 60 upstream requests per hour for one continuously active cache when every refresh misses. Cache hits should reduce this.
- Allow only one results refresh in flight per page. Pause scheduled polling while the page is hidden, then refresh once when it becomes visible.
- On network errors, HTTP 429, or 5xx responses, retain the last good snapshot, show its source timestamp and a stale/unavailable indicator, and use exponential backoff. Respect Retry-After when supplied. Do not retry rapidly or in parallel.
- Show both the browser's last check and the feed's last-updated/last-fetched timestamp when available. Do not label cached data as newly fetched.
- A two-minute browser cadence combined with a two-minute server cache can mean a source fetch happens less often than every two minutes due to timer alignment. If a strict two-minute source freshness target is required, shorten the server cache (for example, to 60 seconds) while retaining the two-minute browser cadence.
- Do not scrape CivicAPI's website when the API is available.

## 8. Privacy, hosting, and security

- Default to owner-only access. Visitors must sign in with the same ChatGPT account that owns the Site.
- Never make the dashboard public unless the owner explicitly changes the sharing requirement.
- No API credentials are needed. Do not add a secret or expose a private credential in browser code.
- Keep the CivicAPI proxy route read-only; validate/limit query parameters to the configured country, election types, and date.
- Do not collect personal information, analytics, or user tracking. Browser local storage may hold only the last successful public results snapshot.

## 9. Suggested layout and interaction

- Phone-first dark navy dashboard with House, Senate, and Governor tabs.
- Compact party counters at the top, including Independent/Other when nonzero and a called-race progress line.
- Watchlist cards below, sorted chronologically by poll close and then alphabetically by state.
- Persistent freshness/status indicator and a manual refresh control. Manual refresh should still respect server caching and backoff.
- Keep the source attribution and unofficial-results note visible without dominating the results.

## 10. Acceptance criteria

1. Site is private and accessible to its owner after ChatGPT sign-in.
2. The three tabs contain exactly the configured watchlists, including all footnote districts, with unmatched contests visibly reported.
3. Each race card presents candidate votes, percentages, percent reporting, call status, and close time when feed data is available.
4. Race cards sort by actual close time, then state, then district.
5. Initial balances equal 0 House, 31 R / 32 D / 2 I Senate, and 9 R / 5 D governors for the 2026 configuration.
6. Each called contest in the full feed adds exactly one seat to the called winner's party; an uncalled contest adds none.
7. Repeated polls or duplicate feed rows never add the same race twice.
8. A stale feed does not erase the last good snapshot; the UI makes stale data apparent.
9. Page polling is no faster than every two minutes while visible; worker caching and backoff prevent bursts.
10. CivicAPI attribution is visible and the UI distinguishes calls from certified results.

## 11. Sources and implementation references

- CivicAPI FAQ: https://www.civicapi.org/faq (data sources, personal-use policy, update cadence, calls, reporting definition, and result accuracy).
- CivicAPI API documentation: https://civicapi.org/api-documentation (v2 API overview and endpoint reference).
- U.S. Senate, Class II senators: https://www.senate.gov/senators/Class_II.htm (regular 2026 Senate class).
- U.S. Senate party division: https://www.senate.gov/about/parties-leadership/party-division.shtml (chamber baseline).
- U.S. House Clerk, Official List of Members of the 119th Congress: https://clerk.house.gov/member_info/olm-119.pdf (House baseline and vacancies).
- The user-provided election graphic supplies the selected-race watchlists and poll-close ordering cues. Treat its candidate/ratings commentary as outside the app's requirements.

## 12. Open implementation checks

Before deployment, verify that CivicAPI returns every configured race for the target election date, confirm the exact summary field names and winner semantics, reconcile race counts against the 435 House / 35 Senate / 36 governor contests, and verify the baseline seat classes against authoritative records. Report mismatches instead of silently substituting or dropping data.
