import { test, expect } from "@playwright/test";
const sizes = [
  [1920, 1080],
  [1366, 768],
  [768, 1024],
  [390, 844],
  [320, 568],
  [844, 390],
];
async function start(page, url = "./") {
  await page.goto(url);
  await page.getByRole("button", { name: "Start run" }).click();
}
async function geometry(page, w, h) {
  // A viewport change can resolve before ResizeObserver has applied the new
  // high-DPI canvas size. Wait for the actual bounds, never a fixed delay.
  await expect
    .poll(() =>
      page.evaluate(
        ({ w, h }) => {
          const c = document.querySelector("canvas").getBoundingClientRect();
          const d = document.querySelector("#drag").getBoundingClientRect();
          return (
            innerWidth === w &&
            innerHeight === h &&
            c.bottom <= h &&
            d.bottom <= h
          );
        },
        { w, h },
      ),
    )
    .toBe(true);
  const info = await page.evaluate(() => {
    const r = document.querySelector("canvas").getBoundingClientRect(),
      d = document.querySelector("#drag").getBoundingClientRect();
    return {
      x: r.x,
      y: r.y,
      w: r.width,
      h: r.height,
      b: r.bottom,
      strip: d.bottom,
      doc: document.documentElement.scrollWidth,
      viewport: innerWidth,
      hud: [...document.querySelectorAll(".hud>div")].map((e) => {
        const r = e.getBoundingClientRect();
        return { left: r.left, right: r.right };
      }),
      controls: [...document.querySelectorAll("button,input")]
        .filter((e) => e.offsetParent)
        .map((e) => e.getBoundingClientRect().height),
    };
  });
  expect(info.doc).toBeLessThanOrEqual(w);
  expect(info.x).toBeGreaterThanOrEqual(0);
  expect(info.b).toBeLessThanOrEqual(h);
  expect(info.strip).toBeLessThanOrEqual(h);
  expect(info.w / info.h).toBeCloseTo(0.8, 1);
  expect(info.h).toBeGreaterThan(h < 500 ? h * 0.74 : 250);
  for (let i = 1; i < info.hud.length; i++)
    expect(info.hud[i].left).toBeGreaterThanOrEqual(info.hud[i - 1].right + 2);
  expect(Math.min(...info.controls)).toBeGreaterThanOrEqual(44);
}
for (const [w, h] of sizes)
  test(`full board and controls ${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    const errors = [],
      failed = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(r.url());
    });
    await start(page);
    await geometry(page, w, h);
    await page.getByRole("button", { name: "Launch ball" }).click();
    await expect(page.locator("#status")).toHaveText("IN PLAY");
    expect(errors).toEqual([]);
    expect(failed).toEqual([]);
  });
test("keyboard actually moves, Space launches and mouse maps correctly", async ({
  page,
}) => {
  await start(page);
  const before = await page.evaluate(() => prismState().paddle.x);
  await page.keyboard.down("d");
  await expect
    .poll(() => page.evaluate(() => prismState().paddle.x))
    .toBeGreaterThan(before + 20);
  await page.keyboard.up("d");
  await page.keyboard.down("a");
  await expect
    .poll(() => page.evaluate(() => prismState().paddle.x))
    .toBeLessThan(before);
  await page.keyboard.up("a");
  await page.locator("#status").click();
  await page.keyboard.press("Space");
  await expect(page.locator("#status")).toHaveText("IN PLAY");
  const r = await page.locator("canvas").boundingBox();
  await page.locator("canvas").evaluate((el) =>
    el.addEventListener(
      "pointermove",
      (e) => {
        window.__prismPointerX = e.clientX;
      },
      { once: true },
    ),
  );
  await page.mouse.move(r.x + r.width * 0.25, r.y + r.height * 0.8);
  const target = await page.evaluate(() => {
    const r = document.querySelector("canvas").getBoundingClientRect();
    return ((window.__prismPointerX - r.left) / r.width) * 720;
  });
  expect(Math.abs(target - 180)).toBeLessThan(3);
  await expect
    .poll(() => page.evaluate(() => prismState().paddle.x))
    .toBeCloseTo(target, 6);
});
test("real mobile touch strip below action, accurate mapping and orientation continuity", async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName === "firefox",
    "Firefox Playwright does not support isMobile emulation",
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  try {
    await start(page);
    const s = await page.locator("#drag").boundingBox(),
      c = await page.locator("canvas").boundingBox();
    expect(s.y).toBeGreaterThanOrEqual(c.y + c.height);
    await page.locator("#drag").evaluate((el) => {
      for (const type of ["pointerdown", "pointermove"])
        el.addEventListener(type, (e) => {
          window.__dragX = e.clientX;
        });
    });
    await page.touchscreen.tap(s.x + s.width * 0.7, s.y + s.height / 2);
    let target = await page.evaluate(() => {
      const r = document.querySelector("#drag").getBoundingClientRect();
      return ((window.__dragX - r.left) / r.width) * 720;
    });
    expect(Math.abs(target - 504)).toBeLessThan(3);
    await expect
      .poll(() => page.evaluate(() => prismState().paddle.x))
      .toBeCloseTo(target, 6);
    if (browserName === "chromium") {
      const cdp = await context.newCDPSession(page);
      for (const [type, x] of [
        ["touchStart", 0.3],
        ["touchMove", 0.55],
        ["touchMove", 0.8],
        ["touchEnd", 0.8],
      ])
        await cdp.send("Input.dispatchTouchEvent", {
          type,
          touchPoints:
            type === "touchEnd" ? [] : [{ x: s.x + s.width * x, y: s.y + 20 }],
        });
      await cdp.detach();
    } else {
      await page.touchscreen.tap(s.x + s.width * 0.8, s.y + 20);
    }
    target = await page.evaluate(() => {
      const r = document.querySelector("#drag").getBoundingClientRect();
      return ((window.__dragX - r.left) / r.width) * 720;
    });
    expect(Math.abs(target - 576)).toBeLessThan(3);
    await expect
      .poll(() => page.evaluate(() => prismState().paddle.x))
      .toBeCloseTo(target, 6);
    const before = await page.evaluate(() => ({
      g: prismState(),
      a: prismAudio.snapshot(),
    }));
    await page.setViewportSize({ width: 844, height: 390 });
    await geometry(page, 844, 390);
    const after = await page.evaluate(() => ({
      g: prismState(),
      a: prismAudio.snapshot(),
    }));
    expect(after.g.score).toBe(before.g.score);
    expect(after.g.lives).toBe(before.g.lives);
    expect(after.g.paddle.x).toBe(before.g.paddle.x);
    expect(after.a.startedAt).toBe(before.a.startedAt);
    expect(after.a.sourceCount).toBe(1);
    await page.locator("#launch").click();
    await page.setViewportSize({ width: 390, height: 844 });
    // Some browser orientation implementations blur the window: a safe pause is
    // allowed, but a reset to ready/menu is not.
    expect(["playing", "paused"]).toContain(
      await page.evaluate(() => prismState().mode),
    );
    expect(await page.evaluate(() => prismAudio.snapshot())).toMatchObject({
      startedAt: before.a.startedAt,
      contextCount: 1,
      sourceCount: 1,
    });
  } finally {
    await context.close();
  }
});
test("scoring, continue, gameover, victory and record persistence with real rules", async ({
  page,
}) => {
  test.skip(Boolean(process.env.LIVE_URL), "Mutation hooks are localhost-only");
  await start(page, "./?test=1");
  await page.locator("#launch").click();
  await page.evaluate(() => {
    prismTest.scenario("power");
    prismTest.scenario("power");
  });
  const powered = await page.evaluate(() => prismState());
  expect(powered.balls).toHaveLength(5);
  expect(
    new Set(
      powered.balls.map((b) => [b.vx.toFixed(4), b.vy.toFixed(4)].join(":")),
    ).size,
  ).toBe(5);
  expect(powered.effects.wide).toBeGreaterThan(0);
  expect(powered.effects.slow).toBeGreaterThan(0);
  const at = await page.evaluate(() => prismAudio.snapshot().startedAt);
  await page.evaluate(() => prismTest.scenario("score"));
  await expect(page.locator("#status")).toHaveText("SECTOR CLEAR");
  await expect(page.locator("#score")).toHaveText("000100");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("#level")).toHaveText("02 / 05");
  await page.evaluate(() => prismTest.scenario("last"));
  await expect(
    page.getByRole("heading", { name: "Game Over", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await page.evaluate(() => prismTest.scenario("victory"));
  await expect(page.locator("#status")).toHaveText("VICTORY");
  expect(await page.evaluate(() => prismAudio.snapshot().startedAt)).toBe(at);
  await page.reload();
  await expect(page.locator("#best")).toHaveText("000100");
});
test("visibility pauses game without unexpected resume or duplicate audio", async ({
  page,
}) => {
  test.skip(
    Boolean(process.env.LIVE_URL),
    "Visibility control hook localhost-only",
  );
  await start(page, "./?test=1");
  await page.locator("#launch").click();
  const before = await page.evaluate(() => prismAudio.snapshot());
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      get: () => true,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("#status")).toHaveText("PAUSED");
  await expect
    .poll(() => page.evaluate(() => prismAudio.snapshot().state))
    .toBe("suspended");
  const pos = await page.evaluate(() => prismState().balls);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => prismState().balls)).toEqual(pos);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      get: () => false,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(await page.evaluate(() => prismState().mode)).toBe("paused");
  await expect
    .poll(() => page.evaluate(() => prismAudio.snapshot().state))
    .toBe("running");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  expect(await page.evaluate(() => prismAudio.snapshot())).toMatchObject({
    startedAt: before.startedAt,
    contextCount: 1,
    sourceCount: 1,
  });
});
test("actual browser OfflineAudioContext RMS, peak and stereo headroom", async ({
  page,
}) => {
  await page.goto("./");
  const data = await page.evaluate(async () => {
    const { compose } = await import("./src/music.js");
    const rate = 24000,
      channels = compose(rate),
      off = new OfflineAudioContext(2, channels[0].length, rate),
      buffer = off.createBuffer(2, channels[0].length, rate);
    channels.forEach((d, i) => buffer.getChannelData(i).set(d));
    const src = off.createBufferSource(),
      gain = off.createGain();
    gain.gain.value = 0.65;
    src.buffer = buffer;
    src.connect(gain).connect(off.destination);
    src.start();
    const rendered = await off.startRendering();
    return [0, 1].map((n) => {
      const d = rendered.getChannelData(n);
      let sum = 0,
        peak = 0;
      for (const v of d) {
        sum += v * v;
        peak = Math.max(peak, Math.abs(v));
      }
      return { rms: Math.sqrt(sum / d.length), peak };
    });
  });
  for (const ch of data) {
    expect(ch.rms).toBeGreaterThan(0.025);
    expect(ch.peak).toBeLessThan(0.85);
  }
  test.info().annotations.push({
    type: "audio-measurement",
    description: JSON.stringify(data),
  });
});
test("analyser proves audible music, mute/unmute volume prefs and seamless loop", async ({
  page,
}) => {
  await start(page);
  await expect
    .poll(() => page.evaluate(() => prismAudio.snapshot().state), {
      timeout: 15000,
    })
    .toBe("running");
  await expect
    .poll(() => page.evaluate(() => prismAudio.measure().rms), {
      timeout: 15000,
    })
    .toBeGreaterThan(0.005);
  const original = await page.evaluate(() => prismAudio.snapshot());
  await page.locator("#music").click();
  await expect
    .poll(() => page.evaluate(() => prismAudio.measure().rms))
    .toBeLessThan(0.001);
  const muted = await page.evaluate(() => prismAudio.snapshot());
  expect(muted.enabled).toBe(false);
  await page.locator("#music").click();
  await page.locator("#volume").fill("45");
  await expect
    .poll(() => page.evaluate(() => prismAudio.measure().rms))
    .toBeGreaterThan(0.003);
  const later = await page.evaluate(() => prismAudio.snapshot());
  expect(later).toMatchObject({
    contextCount: 1,
    sourceCount: 1,
    startedAt: original.startedAt,
    volume: 0.45,
  });
  await page.locator("#restart").click();
  await page.locator("#pause").click();
  await page.setViewportSize({ width: 844, height: 390 });
  expect(await page.evaluate(() => prismAudio.snapshot())).toMatchObject({
    contextCount: 1,
    sourceCount: 1,
    startedAt: original.startedAt,
  });
  await page.locator("#music").click();
  await page.reload();
  expect(await page.evaluate(() => prismAudio.snapshot())).toMatchObject({
    enabled: false,
    volume: 0.45,
    contextCount: 0,
  });
});
