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

## Live leaderboard

**Decision** — Sample the track's progress data about four times per second at 1x and rank those positions. Break in-progress ties by lane. Order finished horses by the official finish-time comparator.

**Rationale** — The live board and visuals share the simulation's positions. The final sampled ranking agrees with the official results. Rank-change history belongs to the track view.

**Trade-offs** — The board can lag the frame-rendered track by a sample interval and can skip brief overtakes.

## Decorative motion and runner details

**Decision** — Keep the gait in stepped CSS over three leg poses and a fixed SVG body. Use Vue TransitionGroup to move leaderboard rows keyed by horse ID. Keep runner information in a lane-local tooltip triggered by lane hover or marker focus and tap.

**Rationale** — The simulation already supplies motion state, horizontal position, and rank. Visual effects use that state without scheduling another race clock. The tooltip uses the current runner and the lane edges for positioning.

**Trade-offs** — Gait cadence is fixed across playback speeds to keep the pose stable on speed changes. The rank transition shortens at 2x and is disabled at 4x to leave room for faster samples. Large rank changes settle immediately to limit crossing rows, and Pause or Stop confirmation cancels in-flight transitions. Reduced motion suppresses both effects.

## Program and results presentation

**Decision** — Use one open section per panel, with local expansion state. Use intrinsic grid-row transitions for accordion contents. Render rank badges in the official results table and derive the winner header from its first entry and the existing transition or finished state. Keep the title and status slots at consistent heights.

**Rationale** — Collapsed headers make rounds easier to scan, and the official data remains the source for tables and winner notices. The announcement uses the existing transition window, so timing remains consistent with Stop and playback speed.

**Trade-offs** — Each new active round or completed result opens its section automatically. At desktop widths the track determines the shared row height, and the other panels scroll internally when their contents exceed that height.

## Stop and playback speed

**Decision** — Keep the confirmation flag local to the controls, with a distinct `stopped` state in Pinia for confirmed cancellation. Apply playback speed to real-time frame deltas. At 1x the simulation advances eight seconds per real second, and at 4x it advances 32. Commit the partial frame at the old rate before assigning a new rate.

**Rationale** — Opening the dialog freezes the last displayed frame and cancels scheduled work. Cancel preserves the prior race state and resumes any remaining real-time transition delay. Confirm discards the active simulation and retains completed results. Scaling deltas leaves pace segments and official finish times intact.

**Trade-offs** — The composable tracks the transition deadline and remaining delay to make cancellation reversible. The transition uses real time independently of race playback. Native dialog behavior provides keyboard focus containment and Escape handling.

## Deterministic tests

**Decision** — Inject fixed random draws into domain tests, use fake timers for lifecycle tests, and seed the browser random source and control its clock for Playwright.

**Rationale** — The same scenarios can be rerun without waiting for six real-time rounds or depending on random selections.

**Trade-offs** — Controlled time exercises known flows. Real-time browser smoke checks complement it. Screenshot baselines depend on the browser and operating system used to render them.
