# Repository guidance

- Use Vue 3 Composition API, `<script setup lang="ts">`, TypeScript, Pinia, Vite, and plain CSS. Use English names for code, files, and commits. Keep component props and events typed.
- Keep view concerns in `src/components/`, shared race lifecycle state in `src/stores/`, browser timing in `src/composables/`, and pure race calculations in `src/domain/`. Derive view values from existing state. Keep display history local to the view.
- Preserve the shared pace model for track positions, ranking, and finish times. Keep the random source injectable for domain tests. Publish official results only after all horses in a round finish, and preserve the deterministic lane tie-break.
- Maintain one animation frame loop and one transition timer. Rebase the animation clock on resume, cancel pending work on unmount, and clear round-specific state at the appropriate boundary. Preserve reduced-motion support and keyboard operation when editing the track.
- Freeze scheduled work while Stop confirmation is open and preserve only the remaining transition delay on cancel. Apply playback speed to frame deltas and keep official finish calculations and real-time transition delays independent of playback.
- Prefer focused changes and existing modules. Add dependencies only for a concrete requirement.
- Keep accordion expansion local to the view. Derive winner notices and rank badges from official results and reuse the existing transition state for announcement timing.
- After relevant changes, run `npm run build` and `npm test`. For UI and flow changes, install Chromium with `npx playwright install chromium`, then run `npm run test:e2e` and `npm run test:visual`. Inspect visual differences before updating baselines. The committed baselines target Windows Chromium.
- Keep FEATURES.md consistent with shipped behavior, including its assessment requirements and enhancements sections. Update README.md for usage or setup changes and ENGINEERING_DECISIONS.md for meaningful architecture decisions.
