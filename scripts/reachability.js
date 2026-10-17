// Deterministic reachability experiment, not a human-skill or frame-rate claim.
// Uses the same rules and public start/launch/move/next controls, never deletes bricks.
import { Game } from "../src/rules.js";
import assert from "node:assert/strict";
const game = new Game();
game.start();
const sectors = [];
let steps = 0;
for (
  ;
  steps < 500000 && !["victory", "gameover"].includes(game.mode);
  steps++
) {
  if (game.mode === "complete") {
    sectors.push({
      sector: game.level + 1,
      score: game.score,
      lives: game.lives,
      seconds: steps / 120,
    });
    game.next();
  }
  if (game.mode === "ready") game.launch();
  const target = [...game.balls].sort(
    (a, b) => (b.vy > 0 ? b.y : 0) - (a.vy > 0 ? a.y : 0),
  )[0];
  if (target) game.move(target.x + Math.sin(steps / 731) * 31);
  game.update(1 / 120);
}
sectors.push({
  sector: game.level + 1,
  score: game.score,
  lives: game.lives,
  seconds: steps / 120,
  mode: game.mode,
});
console.log(
  JSON.stringify(
    {
      method:
        "Automated instant mouse-style paddle tracking; no brick/score/life mutation",
      steps,
      sectors,
    },
    null,
    2,
  ),
);
assert.equal(
  game.mode,
  "victory",
  "Tracking experiment did not clear the campaign within the limit",
);
