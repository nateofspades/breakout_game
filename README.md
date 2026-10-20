# BrikaVolt

[Play BrikaVolt](https://nateofspades.github.io/BrikaVolt_Game/)

![BrikaVolt active gameplay](assets/screenshots/gameplay.png)

Five formations, armored bricks, four falling powerups and a continuous instrumental soundtrack in a dusk-lit vector arena. Static HTML, CSS, Canvas and vanilla JavaScript modules; no backend, ads or paid services. The owner's final release authorization supersedes earlier private holds and candidate names. Existing art, music, gameplay improvements and `prism-break.*` records/preferences are retained. See [IP assessment and provenance limits](docs/IP_AUDIT.md); publication is not legal clearance.

Local development: `npm ci`, `npm run serve`, open `http://127.0.0.1:4279`. Stop a manual server before browser testing (all three engines, one worker). Unit tests: `npm test`. `npm run build` creates the allowlisted `_site/` publication artifact: HTML, CSS, local modules, favicon, project screenshots and the unchanged MIT notice. Never publish the repository root, tests, private evidence or node_modules.

For headless Linux install `pulseaudio` and use `npm run test:browser:audio`. The repository-owned runner starts and cleans up an isolated null sink without changing a shared audio service. It exercises real AudioContext rendering/clock/signal, but discards physical speaker output. If `PULSE_SERVER` is already supplied it uses that output without stopping it. Plain `npm run test:browser` requires a working audio device, particularly Firefox.

Final local release verification: **38 unit tests passed; 108 browser cases passed, 3 explicitly skipped, 0 failed/flaky** across Chromium, Firefox and WebKit, one worker. The three skips are Firefox's unsupported mobile contexts; its desktop contexts test all six sizes. The non-mutating automated paddle tracker also completed all five sectors (20,600 points). Exact review/remote/live execution evidence is maintained separately in the release report. Physical devices and speakers are not verified by browser emulation or a null audio sink.

An original synthwave brick breaker: five handcrafted prism formations, a dusk-lit vector arena, and an original instrumental soundtrack. Static HTML, CSS, Canvas and vanilla JavaScript ES modules; no backend, ads or paid services.

## Play

Start a run, then press Space or tap Launch ball. Clear every brick to continue to the next sector. Break all five for Victory. Armored bricks take two or three hits; their pips show remaining strength. Each hit earns 25 points while each destroyed brick earns 100. You start with three lives; only losing the last active ball costs a life.

- Desktop: Left/Right or A/D steer; mouse over the board also aims. Space launches; P or Escape pauses/resumes. Visible Pause/Resume and Restart buttons are always available.
- Mobile: drag the dedicated strip below the board. Its full width maps directly to board coordinates, keeping your finger below the action. Tap Launch ball after each serve. Portrait and landscape preserve the game and soundtrack.
- Capsules: ↔ wide paddle for 12 seconds; ◷ slow balls for 10 seconds; ⁙ independent multiball (five-ball cap); ♥ extra life (five-life cap). Every fifth destroyed brick drops a capsule, cycling through the four types. Temporary effects refresh, never compound, and reset at a new sector, lost last ball or restart. Capsules never delay completion.
- Hidden tabs automatically pause the game. Returning does not automatically resume gameplay. The record is saved locally when available; storage failure does not block play.

## Music

“Prism Velocity” is an original 156-BPM A-minor synthwave instrumental: a rising/falling saw-and-triangle hook, octave bass, stereo chord stabs, syncopated pulse and stable synthesized musical percussion. There are no sound effects of any kind. The 16-bar score and synthesis live in [src/music.js](src/music.js); code, artwork and composition use the MIT license.

One AudioContext and one continuous loop are created only after interaction. Start, restart, pause, menus, gameover, victory, resize and orientation never restart the transport. Music On/Off fades master gain while preserving phase. Volume and enable preferences use Prism-specific localStorage keys. Hidden pages can suspend/resume the same context. Read-only diagnostics: `window.prismAudio.snapshot()` and `.measure()`. [Music comparison and provenance](docs/music-provenance.md).

## Run locally

Requires Node.js 22. npm dependencies are local to this project.

    npm ci
    npm run serve

Open http://127.0.0.1:4279/ (or set PORT for the local server). All game asset URLs are relative, including under a GitHub Pages repository subpath.

## Tests

    npm test
    npx playwright install --with-deps chromium firefox webkit
    npm run test:browser

Headless Linux alternative: `npm run test:browser:audio`. Live verification: `LIVE_URL=https://nateofspades.github.io/BrikaVolt_Game/ npm run test:browser:audio`. Local-only deterministic scenario tests are explicitly skipped on the public host; Firefox does not support Playwright's `isMobile` contexts. Six viewport sizes are tested in every desktop browser engine: 1920×1080, 1366×768, 768×1024, 390×844, 320×568 and 844×390. Chromium and WebKit also run touch/mobile contexts.

Vitest tests deterministic rules, geometry, lifecycle, pickups, storage and music abstraction. `node scripts/reachability.js` additionally exercises all five layouts using an automated mouse-style paddle tracker without deleting bricks or modifying score/lives; this is a reachability experiment, not a human-skill claim. Playwright exercises real startup, inputs, layouts, progression, highscore persistence and real Web Audio rendering across Chromium, Firefox and WebKit, one worker. Linux Firefox requires a working audio service (for headless servers, start PulseAudio with a null sink); the tests do not fake AudioContext rendering. Mutating scenario hooks require BOTH localhost and `?test=1`; production exposes read-only snapshots only.

CI uses npm ci and runs both suites on push to main and pull requests. On main, Pages publication depends on the verification job and deploys only `_site/` from the same checked-out SHA. [Historical verification evidence and limitations](docs/verification.md). Automated mobile tests are emulation, not physical-device touch or subjective speaker/listening verification. No claim of universal 60 FPS is made; physics uses a fixed 120-Hz step with ≤2-pixel collision substeps, independent of rendering.

## Structure

- src/rules.js — deterministic campaign and collision rules
- src/app.js — Canvas rendering, responsive UI and input
- src/music.js — original score, stereo synthesis and persistent transport
- src/storage.js — optional safe persistence
- tests/ — Vitest and Playwright regressions

## Technology and credits

The existing [MIT notice](LICENSE) credits **Nathan Burns (2026)** for this project. The original Canvas art, rules and **Prism Velocity** score/synthesis are preserved; this is not independent verification of every underlying right. Runtime code is static HTML/CSS and native ES modules with Canvas/Web Audio, not a bundled third-party game engine. Vitest, Playwright and Prettier are development tools, not runtime assets; keep `node_modules`, tests and reports out of a future served artifact rather than duplicating their full installations.

[Play BrikaVolt](https://nateofspades.github.io/BrikaVolt_Game/) · [MIT license](LICENSE). Historical verification and private migration notes are retained for provenance, not current publication instructions.
