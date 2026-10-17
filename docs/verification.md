# Verification

## Reproducible local execution

- `npm ci`: succeeded; audit reported 0 vulnerabilities.
- `npm test`: 25 passed, 0 failed, across 7 Vitest files, maximum one worker.
- `npm run test:browser`: 38 passed, 0 failed, 1 intentionally skipped, 0 flaky, 39 defined cases. Chromium, Firefox and WebKit, one worker. The skip is Firefox's unsupported Playwright `isMobile` emulation; its desktop-context viewport checks still cover all six sizes.
- Viewports: 1920×1080, 1366×768, 768×1024, 390×844, 320×568 and 844×390. Checks include the complete canvas and below-action drag strip, aspect ratio, no horizontal overflow, separated HUD cells, minimum landscape board height and ≥44px control height.
- Real startup/clicks, keyboard motion, Space launch, mouse coordinate mapping, pause/resume/restart, progression, defeat/victory and persisted record are exercised. Localhost-only scenario hooks arrange deterministic brick/ball states but still use the production rules and real startup.
- Chromium uses a trusted browser-emulated CDP touch drag; WebKit uses actual Playwright touchscreen taps in an `isMobile`/`hasTouch` context. Both exercise orientation changes. Visibility testing dispatches the real visibility handler with an emulated `document.hidden` value, verifies a frozen game, suspended/resumed audio and no unexpected gameplay resume.

## Audio, measured in actual browser engines

All three engines rendered the complete original stereo composition through a real 24 kHz OfflineAudioContext with gain 0.65, returning identical results:

| Channel | RMS | Absolute peak |
| --- | --- | --- |
| Left | 0.0610669009703935 | 0.4057014286518097 |
| Right | 0.058709872121768716 | 0.39454343914985657 |

Real-time analyser tests additionally verify nonzero output, a muted RMS below 0.001, unmute, volume preferences and one persistent context/source/start timestamp through restart, pause and resize. Unit tests cover gain/preferences/storage failures, repeated activation, visibility continuity and the loop boundary. There are no event SFX or a note scheduler that can accumulate stale events. A project-created PulseAudio null sink supplies headless Linux output for the final browser run, including Firefox; audio data is not mocked in these browser tests.

## Reachability and visual evidence

`node scripts/reachability.js` completed the actual five-sector rules campaign using automated mouse-style paddle tracking: Victory, score 20600, 5 lives remaining, 54648 fixed steps / 455.4 simulated seconds. It never deletes bricks or mutates score/lives. This demonstrates reachability, not human difficulty or input latency.

Actual active-game screenshots (not menu mockups) are stored in `assets/screenshots/gameplay.png`, `mobile.png` and `landscape.png`, and were visually inspected. Screenshot review found a compressed landscape HUD, which was moved beside an enlarged playfield. A new geometry regression also protects HUD separation on 320px screens.

Other confirmed fixes: repeated multiball pickups now select unique trajectories; final musical tails wrap rather than being truncated at the loop boundary; the fourth-led soundtrack hook is distinct from Snake's opening arpeggio; static artwork is cached and unchanged DOM text is not rewritten every frame. Initial cross-browser fractional-pointer assertions were corrected to compare against delivered event coordinates instead of ideal fractional screen pixels.

The first hosted CI run exposed a test synchronization race after mobile orientation changes: `setViewportSize` resolved before ResizeObserver had applied the new canvas dimensions. The geometry helper now polls the real viewport, canvas and drag-strip bounds before retaining all original size, overflow and separation assertions. No fixed sleep, mock layout or automatic test retry was added. The affected mobile tests were rerun locally: 2 passed, 0 failed, 1 unsupported Firefox-mobile case skipped. A subsequent `codex review --uncommitted` completed successfully and confirmed that the polling does not weaken the assertions; no actionable regressions were found. Its output is retained in `breakout_game-codex-review-followup.log` in the delivery directory. Exact hosted follow-up results/run IDs are retained in the final JSON.

## Independent review and remote delivery

`codex review --base 541ec5b` completed successfully after the green local suites, using Codex 0.162.1 / gpt-6.1-sol in the read-only sandbox. Verdict: “No concrete, actionable regression was identified in the reviewed diff.” There were no actionable findings to fix. The full output is retained at `/root/arcade-projects/delivery/breakout_game-codex-review.log`, outside the repository. The final delivery JSON records exact commit attribution, CI run IDs/conclusions for HEAD, Pages source/build and live desktop/mobile results.

## Limits

No physical-phone touch, physical-speaker loudness, subjective listening panel, universal 60-FPS benchmark or exhaustive plagiarism/legal clearance is claimed. Mobile results are browser emulation. The deterministic tracking experiment is not a human playtest. Browser/OS audio interruption can require a subsequent user gesture. Comparison with unpublished puzzle/Pong sources was unavailable; their reserved keys/tempos are documented in music-provenance.md.
