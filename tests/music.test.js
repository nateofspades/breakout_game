import { it, expect } from "vitest";
import { Music, compose, SCORE } from "../src/music.js";
function factory() {
  let contexts = 0,
    sources = 0;
  return {
    get contexts() {
      return contexts;
    },
    get sources() {
      return sources;
    },
    make() {
      contexts++;
      return {
        sampleRate: 8000,
        currentTime: 1,
        state: "suspended",
        destination: {},
        createBuffer: (n, l) => ({ getChannelData: () => new Float32Array(l) }),
        createBufferSource: () => {
          sources++;
          return { connect() {}, start() {}, loop: false };
        },
        createGain: () => ({
          gain: { value: 0, setTargetAtTime() {} },
          connect() {},
        }),
        createAnalyser: () => ({ connect() {} }),
        async resume() {
          this.state = "running";
        },
        async suspend() {
          this.state = "suspended";
        },
      };
    },
  };
}
it("original score key, tempo, finite stereo and safe headroom", () => {
  expect(SCORE.bpm).toBe(156);
  expect(SCORE.key).toBe("A minor");
  const [l, r] = compose(8000);
  expect(l.length).toBeGreaterThan(100000);
  let energy = 0,
    peak = 0;
  expect(l.every(Number.isFinite)).toBe(true);
  for (const v of l) {
    energy += v * v;
    peak = Math.max(peak, Math.abs(v));
  }
  expect(Math.sqrt(energy / l.length)).toBeGreaterThan(0.02);
  expect(peak).toBeLessThan(0.95);
  expect(l.some((v, i) => v !== r[i])).toBe(true);
});
it("one context and one seamless source through repeated activation/mute/volume", async () => {
  const f = factory();
  const m = new Music({ createContext: () => f.make() });
  expect(m.snapshot().contextCount).toBe(0);
  await m.activate();
  const at = m.snapshot().startedAt;
  await Promise.all([m.activate(), m.activate()]);
  m.setEnabled(false);
  m.setEnabled(true);
  m.setVolume(0.4);
  expect(m.snapshot()).toMatchObject({
    contextCount: 1,
    sourceCount: 1,
    startedAt: at,
    enabled: true,
    volume: 0.4,
  });
  expect(f.contexts).toBe(1);
  expect(f.sources).toBe(1);
});
it("preferences and failures are safe, volume bounded", async () => {
  const map = new Map();
  const storage = {
    getItem: (k) => map.get(k),
    setItem: (k, v) => map.set(k, v),
  };
  const m = new Music({ storage });
  m.setEnabled(false);
  m.setVolume(0.63);
  expect(new Music({ storage }).snapshot()).toMatchObject({
    enabled: false,
    volume: 0.63,
  });
  m.setVolume(3);
  expect(m.volume).toBe(1);
  const n = new Music({
    storage: {
      getItem() {
        throw Error();
      },
      setItem() {
        throw Error();
      },
    },
    createContext() {
      throw Error();
    },
  });
  expect(await n.activate()).toBe(false);
  expect(n.enabled).toBe(true);
});
it("visibility suspends/resumes same source, no game event API or SFX", async () => {
  const f = factory(),
    m = new Music({ createContext: () => f.make() });
  await m.activate();
  const before = m.snapshot();
  await m.visibility(true);
  expect(m.snapshot().state).toBe("suspended");
  await m.visibility(false);
  expect(m.snapshot().state).toBe("running");
  expect(m.snapshot().startedAt).toBe(before.startedAt);
  expect(m.snapshot().sourceCount).toBe(1);
  expect(m.sfx).toBeUndefined();
});
