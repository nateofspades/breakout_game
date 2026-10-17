# Music provenance

## Prism Velocity — original composition

Written for Prism Break, released under this repository's MIT license. No samples, recordings, borrowed melodies, SFX, event-triggered notes or third-party music libraries. Source and score: `src/music.js`.

A minor (harmonic-minor G♯ in the E-major turnaround), 156 BPM, 16 bars / 256 sixteenth steps, approximately 24.615 seconds. A–F–D–E bass/harmony spans two bars per chord. The hook begins A4, rest, D5, E5, A5, G5, E5, rest: fourth-led ascents answer a falling G–E–D–C–B contour. This deliberately avoids the existing Snake track's opening A–C–E–G–E arpeggio. Its second half descends through B4, A4, G♯4 into the dominant. Later phrases lift an octave and the final phrase descends into a breath before the loop. Octave triangle bass on eighth notes with anticipations at steps 7/15, bright band-limited additive saw + triangle lead, alternating stereo chord stabs at 2/6/11/14, four-on-floor sine kick, pitched metallic backbeat/hat and restrained answer notes. Percussion is deterministic pitched synthesis, not random noise. All audio is musical; gameplay never calls a sound-effect function.

A stereo buffer is synthesized once after interaction and played by one looping Web Audio source. Master gain smoothly controls mute and volume without stopping the source or shifting transport. Start, pause, restart, level completion, gameover, victory and resize do not rebuild music. Hidden pages may suspend the same context; visible pages resume that context's phase. Browsers can still require a fresh gesture after OS interruption. Preferences are game-specific and storage denial is nonfatal.

## Read-only comparison performed before composing

The four complete existing source files were inspected, including literal note arrays, timing, voices, arrangement, and transport. Exact source hashes:

| Existing file       | SHA-256                                                            |
| ------------------- | ------------------------------------------------------------------ |
| flappy_bird_game.js | `c931ee96859eb58849d76fac0423eed28ad6bb6b002dece7fd90c8ac59cac592` |
| tetris_game.js      | `a150482a1da1b062222f62eb964752864a0240cf296fa19c9baa5ac249a04aa5` |
| pang_game.js        | `9b65c132e7675438674582a1899396a341d547732688a676a720f0ea49aeb94f` |
| neon_snake.js       | `a70cc55080a5ddf9a21bf68f32349edc53bdedd0e39423778cec8edfe978eb78` |

- Snake, “Neon Circuit”: eight-second loop, 0.25-second pulse, Hz lead 440/523.25/659.25/783.99/659.25/523.25/493.88/392, sparse square lead and low saw bass. Prism uses a longer 156-BPM sixteenth score, different rest contour and harmony, octave rhythm and wider chord voicings.
- Tetris, “Neon Stack”: 150-BPM sixteenths / 12.8 seconds, opening MIDI 76/79/83/79/74/79/81/79, square lead, noise hats, mono sample buffer. Prism does not reuse those notes or that rhythmic contour, and uses a stereo, noise-free arrangement and harmonic-minor turnaround.
- Pang, “Polar Circuit”: 172 BPM / 64 steps, opening E4/rest/G4/A4/B4/rest/A4/G4, E-centric square melody, E/C/A/B bass segments, oscillator scheduler. Prism is A minor / 156 BPM / 256 steps, with a different motif, stab grid, instrumental colors and single-buffer transport.
- Flappy Bird, “Skyline Skip”: C major / 148 BPM / eighth-note 32-step melody, opening 72/76/79/76/74/77/81/77, triangle lead and sine bass, no equivalent wide chord/percussion arrangement. Prism has a rest-led ascending/descending A-minor hook and substantially denser syncopated harmony.

The other newly assigned tracks are reserved to separate workers: puzzle D major / 142 BPM and Pong F minor / 112 BPM. Their final source was not supplied; no claim of exhaustive comparison with unpublished tracks is made.

Limits: source-level comparison is not an exhaustive plagiarism detector, legal clearance, physical-speaker loudness assessment or listening-panel judgment. Shared synthesizer primitives and common musical intervals are expected. The musical material and implementation here were authored independently after comparison. Browser RMS/peak and continuity evidence are recorded in verification.md and the delivery report; no real-device audio claim is made.
