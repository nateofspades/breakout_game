import { it, expect } from "vitest";
import { Game } from "../src/rules.js";
const play = () => {
  const g = new Game();
  g.start();
  g.launch();
  return g;
};
it("only last ball costs exactly one life", () => {
  const g = play();
  g.balls.push({ ...g.balls[0], x: 600 });
  g.balls[0].y = 920;
  g.update(0.02);
  expect(g.lives).toBe(3);
  expect(g.balls).toHaveLength(1);
  g.balls[0].y = 920;
  g.update(0.02);
  expect(g.lives).toBe(2);
  expect(g.mode).toBe("ready");
  g.update(0.1);
  expect(g.lives).toBe(2);
  g.launch();
  g.power("multi");
  for (const ball of g.balls) ball.y = 920;
  g.update(0.02);
  expect(g.lives).toBe(1);
  expect(g.mode).toBe("ready");
  expect(g.balls).toHaveLength(1);
});
it("last life gameover and clean restart", () => {
  const g = play();
  g.lives = 1;
  g.balls[0].y = 920;
  g.update(0.02);
  expect(g.mode).toBe("gameover");
  g.start();
  expect(g.lives).toBe(3);
  expect(g.score).toBe(0);
  expect(g.level).toBe(0);
});
it("pause freezes physics/effects, explicit resume", () => {
  const g = play();
  g.power("wide");
  g.pause();
  const before = JSON.stringify(g);
  g.update(0.1);
  expect(JSON.stringify(g)).toBe(before);
  g.pause();
  expect(g.mode).toBe("playing");
});
it("five levels increase speed, completion ignores drops, final victory", () => {
  const g = play();
  let s = g.speed;
  for (let l = 0; l < 5; l++) {
    g.bricks = [];
    g.drops = [{ x: 10, y: 300, type: "wide" }];
    g.update(0.01);
    expect(g.mode).toBe(l === 4 ? "victory" : "complete");
    if (l < 4) {
      g.next();
      expect(g.level).toBe(l + 1);
      expect(g.speed).toBeGreaterThan(s);
      s = g.speed;
      g.launch();
    }
  }
});
it("widen expires and restores/clamps width", () => {
  const g = play();
  g.power("wide");
  expect(g.paddle.w).toBe(168);
  g.move(720);
  g.effects.wide = 0.01;
  g.update(0.02);
  expect(g.paddle.w).toBe(112);
  expect(g.effects.wide).toBe(0);
});
it("slow expires restoring nominal speed without compounding", () => {
  const g = play();
  const s = g.speed;
  g.power("slow");
  g.power("slow");
  expect(g.speed).toBeCloseTo(s * 0.68);
  g.effects.slow = 0.01;
  g.update(0.02);
  expect(g.speed).toBe(s);
  expect(Math.hypot(g.balls[0].vx, g.balls[0].vy)).toBeCloseTo(s);
});
it("multiball uses independent vectors, bounded count", () => {
  const g = play();
  g.power("multi");
  expect(g.balls).toHaveLength(3);
  expect(new Set(g.balls.map((b) => b.vx)).size).toBe(3);
  g.balls[0].x = 100;
  expect(g.balls[1].x).not.toBe(100);
  g.power("multi");
  g.power("multi");
  expect(g.balls.length).toBeLessThanOrEqual(5);
  expect(
    new Set(g.balls.map((b) => [b.vx.toFixed(4), b.vy.toFixed(4)].join(":")))
      .size,
  ).toBe(g.balls.length);
});
it("life cap and effects reset between levels/restarts", () => {
  const g = play();
  for (let i = 0; i < 20; i++) g.power("life");
  expect(g.lives).toBe(5);
  g.power("slow");
  g.power("wide");
  g.mode = "complete";
  g.next();
  expect(g.effects).toEqual({ wide: 0, slow: 0 });
  expect(g.paddle.w).toBe(112);
  expect(g.balls).toHaveLength(1);
});
it("falling pickups collect, missed pickups disappear", () => {
  const g = play();
  g.drops = [
    { x: 360, y: 832, type: "life" },
    { x: 0, y: 910, type: "wide" },
  ];
  g.update(0.01);
  expect(g.lives).toBe(4);
  expect(g.drops).toHaveLength(0);
});
it("deterministic occasional drops cycle four types", () => {
  const g = play();
  for (let i = 0; i < 20; i++) g.destroyed({ x: 200, y: 200, w: 60 });
  expect(g.drops.map((d) => d.type)).toEqual(["wide", "slow", "multi", "life"]);
});
