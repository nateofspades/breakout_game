# BrikaVolt final sequential test design — historical source-phase plan

This plan is retained as preparation history. The authorized release executor subsequently observed identity RED (3 failed/1 passed), identity GREEN (4 passed), and falling-fixture RED/GREEN; added storage resilience and stored-muted/zero-volume real audio tests; and supplied a repository-owned `npm run test:browser:audio` harness plus `_site/` build. Exact final full local/live counts, review and remote gates belong to the executed result/report, not the predictions below. All publication holds below are superseded by the owner's final release mission.

Status: source-only preparation; every newly drafted test is **unexecuted**. Do not treat tests as passes or label a source-inferred failure observed RED. No production edit is authorized until the relevant failure is observed in the execution lane. Drafting the additional characterization coverage was explicitly requested; later corrections must still proceed one reproduced behavior slice at a time.

## Draft files and intended assertions

- `tests/final-identity.test.js`: exact BrikaVolt browser/title/header/accessibility/description identity, README exact first heading and near-top final URL/screenshot link, consistent `brikavolt` package and lock metadata, original license/music retained, old storage namespace retained. First three tests should expose current old branding; this is a prediction, not execution evidence. Storage preservation may already pass.
- `tests/final-mechanics.test.js`: each of four pickups through actual falling-drop collection; independent multiball object/vector identities; timer refresh/expiry speed on all balls; lost-last-multiball cleanup with cumulative sector/score; three-hit scoring across actual impacts; all five complete map strengths/bounds and transition cleanup, score/lives preservation and final-victory boundary; literal legacy keys/unrelated-key preservation. These extend existing characterization rather than imply current defects.
- `tests/browser/final-release.spec.js`: final identity plus menu **and** active geometry at exact six sizes; native focused-button Space activation; five sequential Continue stages with final Play again; local old/new path simulation with seeded legacy score/music prefs; actual real-time audio-clock passage past a full composition loop without another context/source/start origin; 320px portrait and 844px landscape touch-only edge mapping/start/pause/resume/restart. Browser errors include page errors, console errors, failed requests and HTTP failures in viewport/touch cases.

## Existing coverage to retain, not replace

Read all existing seven unit files and three browser files. Existing coverage already includes last-ball lives, pause freeze, powerup timing/caps, repeat-multiball unique trajectories, drop cycle and misses, high-speed normals, scoring, layout strengths, loop-boundary waveform and hook, safe storage, fake-context Music lifecycle, six-size active board/control/HUD geometry, desktop input/mouse mapping, Chromium trusted touch drag/WebKit taps, orientation state, real visibility-handler suspension, actual OfflineAudioContext channel RMS/peak, live analyser mute/unmute, reload prefs, deterministic scoring/continue/defeat/victory/record. Retain cached rendering, unchanged-text optimization, native Space handling, and polling for ResizeObserver/real audio clock.

Existing `game.spec.js` expects PRISM BREAK and must be intentionally migrated with the branding after observing the new identity RED; do not weaken/remove startup assertions. Existing browser hooks are local-only `?test=1`: public `prismState` is a clone, `prismAudio` is diagnostics, `prismTest` mutation is not permitted remotely. Final browser campaign uses existing `complete` scenario so it tests UI/transition, not honest full-wall reachability. Unit map/strength cases and the separate tracking experiment address different evidence; never call scenario-based clearing a human or natural campaign win.

## Remaining refinements/gates for lane owner

1. Run identity tests alone first and save expected assertion failures. Fix only exact metadata/branding/docs/package identity; do not rename song, generic prism terms, compatibility APIs or keys. Preserve original historical notes with an explicit supersession heading, replace prominent obsolete proposal and publication hold as applicable.
2. Run new mechanics characterization independently. If a new case fails, distinguish test defect from actual production defect; reproduce and minimally correct one behavior at a time. Current new tests use actual existing APIs and no invented production hook.
3. Add/execute browser storage-denial cases using an init script that makes the `localStorage` getter throw, plus malformed/negative/JSON-wrong-type best/audio values. Assert startup/move/score/mute still work and no page errors. Unit denial/malformed tests exist; full browser denial is not yet in the draft spec.
4. Browser falling pickup proof is currently incomplete: existing `power` hook directly invokes powers, not falling pickup collection. New unit tests exercise actual falling drops, but if browser render/collection verification is needed, FIRST add a failing browser scenario test, then only minimal localhost-gated fixture additions after observed RED. Do not expose mutations on public host. Capture power glyphs, multiballs and two/three-strength pips in later-level actual frames.
5. Add explicit no-context-before-gesture and initial-stored-muted silent signal tests, volume-zero signal then restore, and real clock/RMS after resize/orientation/level/gameover/victory. The draft full-loop test checks real clock and same source, while existing offline continuity test checks waveform boundary; clock-only is not proof absence of an audible click. Physical speaker loudness and actual devices remain unverified.
6. Ensure event listeners/error collectors span every new test, including campaign/audio/storage. Current six-size/touch cases collect all error classes; older tests collect narrower subsets. Ignore nothing silently.
7. Firefox Playwright does not support `isMobile`; retain explicit reasoned skips only for unsupported contexts, not six-size desktop contexts. Chromium CDP touch and WebKit native Playwright touch emulation are not physical-phone testing. Use actual emitted coordinates and clamp bounds, not ideal fractional mouse coordinates.
8. All six exact sizes required locally and live: 1920×1080, 1366×768, 768×1024, 390×844, 320×568, 844×390. Check initial menu primary, board, drag, launch, pause/restart/music/volume fully visible/hit-testable, no horizontal/vertical document overflow and >=44px controls; poll settled dimensions after orientation. New title width can expose small-screen issues: observe failure before CSS correction.
9. Existing `scripts/smoke.js` covers only three sizes and expects live screenshot URL. Do not mistake it for six-size acceptance or silently omit screenshots from the artifact while leaving its expectation intact. Expand it after RED or use final-release six-size browser suite plus appropriate live audio/error/touch cases. Full browser local tests have live skips for mutation scenarios; report separate local/live totals/skips from JSON, never subtract in your head.
10. `scripts/reachability.js` is an optional separately logged deterministic full-map tracker; it mutates paddle aim through public rules, not bricks/score/lives. Do not run during source preparation. No build command exists. Pages publication requires an allowlisted artifact/workflow or otherwise verified source, not merely this existing CI file.

## Exact execution commands (later only)

Run from `/root/arcade-migration-prep/brickblitzgame`, only after coordinator grants exclusive lane. Reuse coordinator-designated global lock; shown existing lock is `/root/arcade-migration-audit/preparation/test.lock`. Use bash `set -o pipefail` with tee so failure statuses survive. Do not run npm ci while another worker owns memory lane. Do not install/stop shared audio services blindly.

```bash
cd /root/arcade-migration-prep/brickblitzgame
set -o pipefail
E=/root/arcade-final-migration/brikavoltgame
# Discovery only: exact starting commit, ancestry and working changes.
git status --short
git rev-parse HEAD
git merge-base --is-ancestor 075d7a0b79f62e063d7ec55520a93cdeac088080 HEAD
# Only if dependencies are absent, inside exclusive lane:
flock /root/arcade-migration-audit/preparation/test.lock npm ci 2>&1 | tee "$E/npm-ci.log"
flock /root/arcade-migration-audit/preparation/test.lock npx vitest run tests/final-identity.test.js --maxWorkers=1 2>&1 | tee "$E/identity-red.log"
# STOP: inspect genuine branding assertion failures before production edits.
# After each minimal branding correction, rerun the same command to identity-green.log.
flock /root/arcade-migration-audit/preparation/test.lock npx vitest run tests/final-mechanics.test.js --maxWorkers=1 2>&1 | tee "$E/mechanics.log"
flock /root/arcade-migration-audit/preparation/test.lock npm test 2>&1 | tee "$E/unit-final.log"
```

With a coordinator-confirmed working private PulseAudio output already provided:

```bash
flock /root/arcade-migration-audit/preparation/test.lock env BASE_URL=http://127.0.0.1:4279 npm run test:browser -- --grep 'BrikaVolt final' 2>&1 | tee "$E/identity-browser.log"
flock /root/arcade-migration-audit/preparation/test.lock env BASE_URL=http://127.0.0.1:4279 npm run test:browser 2>&1 | tee "$E/browser-final.log"
```

These commands start the project's own Playwright-managed localhost server; do NOT leave a manual server on port 4279. Copy `test-results/browser.json` to `$E/browser-final.json` immediately after the full run, before another browser invocation overwrites it. Exact audio harness path documented historically is `node /root/arcade-migration-prep/paddlepulsegame/scripts/run-browser-tests.js`; it is sibling/environment-specific and not inspected or executed by this source worker. The lane owner must read it and confirm argument/env forwarding, private sink and cleanup before choosing it instead of normal npm browser invocation. Do not modify sibling source here.

After all final changes and actual full green, use supported read-only Codex review (check installed CLI help first) with baseline `075d7a0b79f62e063d7ec55520a93cdeac088080`; record reviewed HEAD and complete output. Review diff must include prepared commits and final changes. Record substantial remediation and rerun/re-review. Historical review is not final review.

For deployed path-aware verification AFTER actual rename/push/exact-SHA deployment:

```bash
flock /root/arcade-migration-audit/preparation/test.lock env LIVE_URL=https://nateofspades.github.io/BrikaVolt_Game/ npm run test:browser 2>&1 | tee "$E/browser-live.log"
```

This needs valid audio environment too; save resulting JSON separately and inspect actual screenshot captures in all required viewports. Final immutable repository ID, baseline/prepared ancestry, author association, remote SHA, Actions and Pages exact SHA, URL 200/title/assets are independent gates, not established by test success. Parent handles profiles. Create result.json/report.md only during final executed handoff, never from this source design.
