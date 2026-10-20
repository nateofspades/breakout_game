// SOURCE-PHASE DRAFT: unexecuted characterization, not an observed RED/GREEN.
import { it, expect } from "vitest";
import { Game, layouts, W, H } from "../src/rules.js";
import { read, record } from "../src/storage.js";
import { Music } from "../src/music.js";
const play = () => { const g = new Game(); g.start(); g.launch(); return g; };
for (const type of ["wide", "slow", "multi", "life"]) {
  it(`collects a falling ${type} pickup through real collision logic`, () => {
    const g = play();
    const speed = g.speed;
    g.balls = [{ x: 100, y: 500, r: 8, vx: 100, vy: -300 }];
    g.drops = [{ x: g.paddle.x, y: g.paddle.y - 13, type }];
    g.update(0.02);
    expect(g.drops).toHaveLength(0);
    if (type === "wide") { expect(g.paddle.w).toBe(168); expect(g.effects.wide).toBeGreaterThan(11); }
    if (type === "slow") { expect(g.speed).toBeCloseTo(speed * 0.68); expect(g.effects.slow).toBeGreaterThan(9); }
    if (type === "multi") {
      expect(g.balls).toHaveLength(3);
      expect(new Set(g.balls).size).toBe(3);
      expect(new Set(g.balls.map(b => `${b.vx.toFixed(4)}:${b.vy.toFixed(4)}`)).size).toBe(3);
    }
    if (type === "life") expect(g.lives).toBe(4);
  });
}
it("refreshes timers without compounding and restores every multiball velocity", () => {
  const g = play(); const normal = g.speed;
  g.power("multi"); g.power("wide"); g.power("slow");
  g.update(0.1); g.power("wide"); g.power("slow");
  expect(g.effects).toEqual({wide: 12, slow: 10});
  expect(g.paddle.w).toBe(168);
  for (const b of g.balls) expect(Math.hypot(b.vx,b.vy)).toBeCloseTo(normal * 0.68);
  g.effects.slow = 0.001; g.effects.wide = 0.001; g.update(0.01);
  expect(g.paddle.w).toBe(112);
  for (const b of g.balls) expect(Math.hypot(b.vx,b.vy)).toBeCloseTo(normal);
});
it("losing all multiballs resets drops/effects but preserves sector and earned score", () => {
  const g = play(); g.level = 2; g.loadLevel(); g.launch(); g.score = 725;
  g.power("multi"); g.power("wide"); g.power("slow");
  g.drops = [{x: 50, y: 400, type: "life"}];
  for (const b of g.balls) b.y = H + 30;
  g.update(0.02);
  expect(g.lives).toBe(2); expect(g.level).toBe(2); expect(g.score).toBe(725);
  expect(g.effects).toEqual({wide: 0, slow: 0}); expect(g.drops).toEqual([]);
  expect(g.balls).toHaveLength(1); expect(g.mode).toBe("ready");
});
it("three-hit brick scores each real impact only once and then completes", () => {
  const g = play(); g.bricks = [{x: 200,y: 200,w: 68,h: 26,hp: 3,max: 3,row: 0}];
  for (const [hp,score] of [[2,25],[1,50],[0,150]]) {
    g.balls = [{x:230,y:245,r:8,vx:70,vy:-400}]; g.update(0.04);
    expect(g.score).toBe(score);
    if (hp) expect(g.bricks[0].hp).toBe(hp); else expect(g.bricks).toEqual([]);
  }
  expect(g.destroyCount).toBe(1); expect(g.mode).toBe("complete");
  g.update(0.1); expect(g.score).toBe(150);
});
it("loads every complete level map with strengths, bounds and cumulative campaign state", () => {
  const g = play(); g.score = 1234; g.lives = 4;
  for (let level = 0; level < layouts.length; level++) {
    expect(g.level).toBe(level);
    const strengths = layouts[level].join("").split("").map(Number).filter(Boolean);
    expect(g.bricks.map(b => b.hp)).toEqual(strengths);
    for (const b of g.bricks) { expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x+b.w).toBeLessThanOrEqual(W); expect(b.y+b.h).toBeLessThan(g.paddle.y); }
    g.power("wide"); g.power("slow"); g.power("multi");
    g.bricks = []; g.update(0.01);
    expect(g.mode).toBe(level === 4 ? "victory" : "complete");
    if (level < 4) {
      g.next(); expect(g.mode).toBe("ready"); expect(g.effects).toEqual({wide:0,slow:0});
      expect(g.balls).toHaveLength(1); expect(g.paddle.w).toBe(112); g.launch();
    }
    expect(g.score).toBe(1234); expect(g.lives).toBe(4);
  }
  g.next(); expect(g.level).toBe(4); expect(g.mode).toBe("victory");
});
it("reads literal legacy score/audio keys and retains unrelated origin data", () => {
  const map = new Map([["prism-break.best","9876"],["prism-break.music.enabled","false"],["prism-break.music.volume","0.31"],["another-game.best","42"]]);
  const storage = {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
  expect(read(storage,"best",0)).toBe(9876);
  expect(new Music({storage}).snapshot()).toMatchObject({enabled:false,volume:0.31,contextCount:0});
  expect(record(storage,100)).toBe(9876); expect(map.get("another-game.best")).toBe("42");
  expect([...map.keys()].some(k=>k.startsWith("brikavolt"))).toBe(false);
});
