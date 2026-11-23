# Horse Racing Features

**Completed** means implemented and verified. **In Progress** means partially implemented. **Planned** means implementation has yet to start.

## Original Assessment Requirements

Source: Insider One's *Software Developer Assessment Project* PDF.

| Feature | Status | Behavior |
| --- | --- | --- |
| Horse roster, colors, and condition | Completed | The roster contains 20 horses. Each has a distinct color and a random integer condition from 1 to 100. The roster shows each horse's name, color, and condition. |
| Six-round program | Completed | **Generate Program** creates six rounds of 1200, 1400, 1600, 1800, 2000, and 2200 m. Each round selects 10 distinct horses at random. The Program panel shows distances, lanes, and names. |
| Sequential race flow | Completed | **Start** begins round one. Under normal operation the remaining five rounds start automatically in order. |
| Animated track | Completed | The track shows the round number, distance, and 10 participants. Horses move to the right in their own lanes and remain at the finish line until the next round. |
| Official results | Completed | After the last horse finishes, Pinia records the result and the Results panel adds the 10 ranked horses with their names, colors, and simulated finish times. Completed results remain accessible in chronological order. |
| Component design and state management | Completed | Vue components render the interface, Pinia owns shared race state, pure TypeScript calculates race outcomes, and a composable manages browser timing. |
| Unit and E2E bonuses | Completed | Vitest covers calculations, store transitions, and timers. Playwright covers the complete six-round workflow and the race controls. |
| Visual testing bonus | Completed | Playwright compares the initial dashboard, generated program, and first completed result against Windows Chromium baselines at 1440 × 900. |

## Implementation Decisions

| Feature | Status | Behavior |
| --- | --- | --- |
| Roster size interpretation | Completed | The PDF mentions both 1–20 horses and a pool of 20. Each page load creates exactly 20 horses and randomizes their condition scores. |
| Horse identity and selection | Completed | Horses have stable numeric IDs and names and colors from fixed lists. Each round draws from the full pool independently, so horses may return in later rounds. |
| Program regeneration | Completed | **Generate Program** is available before racing or after the program finishes or is stopped. It resets results, simulation, elapsed time, and playback speed while retaining the roster. |
| Responsive layout | Completed | At desktop widths the roster is left, the track is centered, and Program and Results are right. At narrower widths the panels stack. |
| Keyboard and reduced motion | Completed | Controls support keyboard operation and visible focus. The race action retains focus during transitions. The track announces status changes and uses fixed markers with finish text for reduced motion. |
| Condition-based pace | Completed | Condition maps linearly to a 14–18 m/s base speed. Each horse draws a 0.88–1.12 form multiplier per round and a 0.95–1.05 tempo multiplier for each of three equal-distance segments. At 1x, one real second advances eight simulated seconds. |
| Race clock and transitions | Completed | One animation frame loop advances elapsed time. After completed rounds one through five, a 1.5-second real-time delay precedes a fresh simulation. The race action is unavailable during that delay. Unmount clears pending frames and transition callbacks. |
| Pause and Resume | Completed | Pause commits time up to the click and stops the loop. Resume rebases the clock. Paused time is excluded. Repeated actions do not create another loop. |
| Finish-time ordering | Completed | A horse's finish time comes from the sum of its segment times. Results sort using unrounded times, with lane number breaking exact ties. Times display to two decimal places. |

## Enhancements Beyond Assessment Requirements

| Feature | Status | Description | Reason | Technical Approach | Assessment Relation |
| --- | --- | --- | --- | --- | --- |
| Custom SVG Horse Indicators | Completed | Side-view silhouettes use each horse's roster color. | Makes horses recognizable at lane size. | An original local SVG inherits the horse color and uses the track's existing motion. | Optional visual enhancement to the required track animation. |
| Live Race Leaderboard | Completed | Shows all 10 positions and progress, highlighting the first three. | Makes provisional order easier to follow. | Samples the same progress used by the track about every 250 ms of race-clock time. Lane breaks in-progress ties. Finish time and lane order finishers. | Optional view. Official results remain separate. |
| Live Position Change Indicators | Completed | Arrows show gains or losses from the previous sample. A dash means unchanged. | Makes changes understandable without relying on color. | The track holds previous ranks locally and clears them on a new round or program. | Optional. |
| Program Accordion | Completed | Round 1 opens on generation and each newly active round opens automatically. Any lineup can be expanded or collapsed. | Makes six lineups easier to scan. | Native buttons with expanded-state semantics control a single locally selected round. Active, completed, and upcoming states remain visible. | Optional presentation of the required program. |
| Results Accordion | Completed | Each completed round gets a header with its winner and an expandable 10-horse table. The newest result opens automatically and earlier tables remain accessible. | Makes official results easier to revisit after several rounds. | Headers and tables read Pinia results in chronological order. Expansion state is local and resets on regeneration. | Optional presentation of the required results. |
| Top Three Ranking Badges | Completed | Gold, silver, and bronze circles surround ranks one through three. Other ranks use plain numbers. | Highlights the top three and preserves column alignment. | Every rank uses the same centered, fixed-width column. The display follows the official order. | Optional presentation. |
| Winner Announcement | Completed | A compact track notice shows the completed round, winner, and finish time during the 1.5-second transition. The sixth winner remains with the completion message until a new program is generated. | Makes each winner easy to identify before the next round. | Uses the first official result entry and existing race status. Stop confirmation freezes the transition, and a confirmed stop clears the notice. | Optional race feedback. |
| Equal-Height Desktop Panels | Completed | The four desktop panels share aligned bottom edges. On narrower screens, cards size to their contents. | Keeps the dashboard balanced without shrinking the track. | The track drives the desktop row height. Lists scroll within their cards. | Optional layout refinement. |
| Stop Race | Completed | After confirmation, stops an active, paused, or transitioning program. Completed outcomes remain available. | Allows leaving a program without waiting for all six rounds. | Pinia enters `stopped` and clears the active simulation. Generate Program starts a fresh program. | Optional explicit cancellation. Normal race flow still runs all six rounds. |
| Stop Confirmation Dialog | Completed | Cancel or Escape restores the previous activity. End Race confirms cancellation. | Prevents accidental cancellation and keeps the state stable while deciding. | A native modal focuses Cancel. The composable cancels pending work and stores the remaining transition delay. Focus returns to Stop on cancel or Generate Program on confirmation. | Optional safeguard. |
| Playback Speed Control | Completed | Offers 0.5x, 1x, and 2x, equivalent to 4, 8, and 16 simulated seconds per real second. | Lets viewers follow the race at their preferred pace. | Scales elapsed frame deltas. The selection persists between rounds, resets to 1x on generation, and leaves the transition delay and official results unchanged. | Optional viewing control. |
| Dynamic Speed Switching | Completed | Speed can change while running or paused and takes effect from the current position. | Lets viewers adjust pace during a program. | Running time through the input is charged at the previous rate. Future frame deltas use the new rate. A paused clock stays frozen. | Optional viewing behavior. |

## Running the Checks

- `npm test` runs unit tests. `npm run test:watch` watches during development.
- Install Chromium with `npx playwright install chromium`. Run `npm run test:e2e` for browser behavior and `npm run test:visual` for screenshot comparisons.
- `npm run build` checks application and test types and builds the production bundle.

## Maintenance

Update the applicable entry when behavior changes. Keep assessment requirements and optional enhancements separate, and mark a feature Completed after verification.
