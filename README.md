# Horse Racing Assessment

## Project Overview

A browser-based horse racing simulator for the Insider One frontend assessment. Generate a six-round program, watch the races run in order, and review each round's results as the program progresses.

## Tech Stack

| Tool | Role |
| --- | --- |
| Vue 3 and TypeScript | Typed UI components using the Composition API and `<script setup>` |
| Pinia | Shared roster, program, race status, clock, and results |
| Vite and CSS | Development server, production build, and responsive layout |
| Vitest and Playwright | Unit, browser flow, and visual regression tests |

## Features

- A roster of 20 horses with unique names and colors and randomized condition scores from 1 to 100.
- Six rounds with 10 randomly selected horses each, covering 1,200 to 2,200 metres in 200-metre increments.
- A 10-lane track with Start, Pause, and Resume controls. The program advances automatically after each round.
- Stop with confirmation, preserving completed results, and a 0.5x, 1x, or 2x viewing speed that leaves race outcomes unchanged.
- Color-coded SVG horses with a three-pose gait, on-demand runner details, and a live leaderboard that highlights changes in rank.
- Expandable program and results panels, with all 10 official finish times available after each round and badges for the top three ranks.
- A track-side winner announcement during each round transition and after the final round.
- Keyboard-operable controls, responsive panels, and fixed markers with finish indicators when reduced motion is requested.

See [FEATURES.md](FEATURES.md) for the current feature inventory and the distinction between assessment requirements and implementation decisions.
See [ENGINEERING_DECISIONS.md](ENGINEERING_DECISIONS.md) for technical rationale and trade-offs, and [AGENTS.md](AGENTS.md) for coding-agent guidance.

## Getting Started

Use Node.js 22.12+ on the 22.x line, or Node.js 24 LTS, with npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, then select **Generate Program** and **Start**.

```sh
npm run build
npm run preview
```

The build runs TypeScript checks and writes the production bundle to `dist/`. The preview command serves that bundle locally.

## Project Structure

| Path | Responsibility |
| --- | --- |
| `src/components/` | Controls, roster, track, program, and results panels |
| `src/domain/` | Roster generation, participant selection, pacing, and ranking |
| `src/stores/` | Program lifecycle and shared race state |
| `src/composables/` | Animation frame scheduling, clock updates, and round transition timers |
| `tests/unit/` and `tests/e2e/` | Domain, store, timer, browser flow, and screenshot checks |

## Architecture & Design Decisions

- **Shared state.** Pinia coordinates controls, the track, and the results panel through a small set of race states. Browser frame and timeout handles stay in the animation composable, which cancels them when the application unmounts.
- **Pacing.** Pure TypeScript maps condition scores to base speeds of 14–18 m/s. Each horse draws a round-level form multiplier of 0.88–1.12 and a tempo multiplier of 0.95–1.05 for each of three equal-distance segments. Higher condition helps, while overlapping pace ranges allow different outcomes. Eight simulated seconds pass per real second.
- **Position and ranking.** The same segment speeds determine both track position at a given elapsed time and each horse's finish time. Results use unrounded finish times and break exact ties by lane. Displayed times are simulated seconds rounded to two decimals.
- **Clock and progression.** A single `requestAnimationFrame` loop advances the race clock. Pause records elapsed time and stops the loop. Resume establishes a fresh time reference. Once the last horse finishes, the store records the result and the composable waits 1.5 seconds before starting the next round.

## Testing

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run test:visual
```

Vitest covers the simulation, live ranking, participant selection, store transitions, and race timing. Playwright covers the six-round flow, controls, results, gait and rank transitions, runner details, keyboard and touch interaction, reduced motion, and responsive widths. Screenshot comparisons cover the initial dashboard, generated program, and first completed round. Browser tests use seeded randomness and a controlled clock.

The committed screenshots use Windows Chromium at 1440 × 900. Run comparisons on that platform for the supplied baselines. If maintaining baselines on another platform, review them locally after running `npm run test:visual -- --update-snapshots`.

## Assumptions

- The case mentions both a 1–20 roster and 20 available horses. Each page load creates exactly 20 horses.
- Selection is without replacement within a round. A horse can appear in multiple rounds.
- Regenerating a program retains the roster and condition scores. Regeneration is blocked while a race is running, paused, or between rounds.
- Condition affects base speed, with form and segment tempo introducing bounded variation.

## AI-Assisted Development

AI tools assisted with implementation, testing, and documentation during the assessment.
