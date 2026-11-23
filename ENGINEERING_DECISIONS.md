# Engineering Decisions

## Vue, TypeScript, and Pinia

**Decision** — Use Vue 3 with Composition API and TypeScript in a single Vite application. Pinia owns the roster, program, current round, clock, and official results.

**Rationale** — Typed props and events make component boundaries explicit. The track, controls, and results can share one lifecycle without passing mutable state through unrelated components.

**Trade-offs** — Pinia adds a shared-state boundary to maintain. Derived display values stay in the views. A single application fits the assessment's shared race flow and avoids the coordination and deployment overhead of micro-frontends.

## Pure domain functions and race pacing

**Decision** — Keep participant selection, pacing, progress, and result sorting in pure TypeScript functions. Map condition to 14–18 m/s, draw round form between 0.88 and 1.12, and draw pace between 0.95 and 1.05 for each of three equal-distance segments.

**Rationale** — Condition provides an advantage with room for variation. Segment speeds determine both distance travelled and finish time, so displayed progress and results share one model.

**Trade-offs** — Three fixed-speed segments provide bounded variation and straightforward tests. Acceleration within each segment is outside this simulation model.

## Animation, pause, and round sequencing

**Decision** — Advance elapsed time with one `requestAnimationFrame` loop. Pause records the current elapsed time and cancels the frame. Resume takes a fresh time reference. Each round starts the same engine with its own participants and distance after the previous round's result and 1.5-second transition.

**Rationale** — Emitting motion from elapsed time keeps positions consistent across frame rates. The composable owns browser callbacks, while Pinia guards state changes and records results.

**Trade-offs** — Browsers can throttle background frames. When frames resume, elapsed time may move the active round forward. Pause explicitly excludes paused time.

## Live leaderboard and podium

**Decision** — Sample the track's progress data about four times per second and rank those positions. Break in-progress ties by lane. Order finished horses by the official finish-time comparator. Build the podium from the latest completed result's first three entries.

**Rationale** — The live board and visuals share the simulation's positions. The final sampled ranking and podium agree with the official results. Rank-change history belongs to the track view.

**Trade-offs** — The board can lag the frame-rendered track by a sample interval and can skip brief overtakes. The latest podium limits right-panel height while every official result remains available in the tables.

## Deterministic tests

**Decision** — Inject fixed random draws into domain tests, use fake timers for lifecycle tests, and seed the browser random source and control its clock for Playwright.

**Rationale** — The same scenarios can be rerun without waiting for six real-time rounds or depending on random selections.

**Trade-offs** — Controlled time exercises known flows. Real-time browser smoke checks complement it. Screenshot baselines depend on the browser and operating system used to render them.
