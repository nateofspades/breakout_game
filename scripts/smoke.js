import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
const live = Boolean(process.env.LIVE_URL),
  base = process.env.LIVE_URL || "http://127.0.0.1:4279/";
const browser = await chromium.launch();
const results = [];
try {
  for (const [width, height] of [
    [1920, 1080],
    [390, 844],
    [844, 390],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      isMobile: width < 900,
      hasTouch: width < 900,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage(),
      errors = [],
      failures = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400)
        failures.push({ url: r.url(), status: r.status() });
    });
    page.on("requestfailed", (r) =>
      failures.push({ url: r.url(), error: r.failure()?.errorText }),
    );
    const response = await page.goto(base);
    assert.equal(response.status(), 200);
    await page.locator("#primary").click();
    await page.waitForFunction(() => prismAudio.snapshot().state === "running");
    await page.locator("#launch").click();
    await page.waitForFunction(() => prismState().mode === "playing");
    const before = await page.evaluate(() => ({
      g: prismState(),
      a: prismAudio.snapshot(),
    }));
    if (width < 900) {
      const r = await page.locator("#drag").boundingBox(),
        cdp = await context.newCDPSession(page);
      for (const [type, x] of [
        ["touchStart", 0.25],
        ["touchMove", 0.5],
        ["touchMove", 0.75],
        ["touchEnd", 0.75],
      ])
        await cdp.send("Input.dispatchTouchEvent", {
          type,
          touchPoints:
            type === "touchEnd" ? [] : [{ x: r.x + r.width * x, y: r.y + 20 }],
        });
      await cdp.detach();
      assert.ok(
        Math.abs((await page.evaluate(() => prismState().paddle.x)) - 540) < 3,
      );
    } else {
      await page.keyboard.down("ArrowRight");
      await page.waitForFunction(() => prismState().paddle.x > 400);
      await page.keyboard.up("ArrowRight");
    }
    const geometry = await page.evaluate(() => {
      const c = document.querySelector("canvas").getBoundingClientRect(),
        d = document.querySelector("#drag").getBoundingClientRect();
      return {
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        bottom: c.bottom,
        stripTop: d.top,
        stripBottom: d.bottom,
        scrollWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
      };
    });
    assert.ok(geometry.bottom <= height);
    assert.ok(geometry.stripBottom <= height);
    assert.ok(geometry.stripTop >= geometry.bottom);
    assert.ok(geometry.scrollWidth <= width);
    await page.locator("#pause").click();
    assert.equal(await page.evaluate(() => prismState().mode), "paused");
    await page.locator("#pause").click();
    await page.locator("#restart").click();
    await page.locator("#launch").click();
    await page.locator("#music").click();
    await page.waitForTimeout(250);
    const mute = await page.evaluate(() => prismAudio.measure());
    assert.ok(mute.rms < 0.001);
    await page.locator("#music").click();
    await page.locator("#volume").fill("60");
    await page.waitForTimeout(250);
    const after = await page.evaluate(() => prismAudio.snapshot());
    assert.equal(after.contextCount, 1);
    assert.equal(after.sourceCount, 1);
    assert.equal(after.startedAt, before.a.startedAt);
    assert.equal(after.volume, 0.6);
    const measures = [];
    for (let n = 0; n < 5; n++) {
      await page.waitForTimeout(100);
      measures.push(await page.evaluate(() => prismAudio.measure()));
    }
    assert.ok(measures.some((m) => m.rms > 0.003));
    assert.ok(measures.every((m) => m.peak < 0.95));
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    if (live)
      assert.equal(
        await page.evaluate(() => typeof window.prismTest),
        "undefined",
      );
    if (!live) {
      await mkdir("assets/screenshots", { recursive: true });
      await page.screenshot({
        path: `assets/screenshots/${width === 1920 ? "gameplay" : width === 390 ? "mobile" : "landscape"}.png`,
      });
    }
    results.push({
      viewport: { width, height },
      status: "passed",
      geometry,
      audio: after,
      measures,
      errors,
      failures,
    });
    await context.close();
  }
  if (live) {
    const response = await fetch(
      new URL("assets/screenshots/gameplay.png", base),
    );
    assert.equal(response.status, 200);
    results.push({ screenshotStatus: response.status });
  }
  const report = {
    url: base,
    mode: live ? "live" : "local",
    browser: "chromium",
    results,
  };
  console.log(JSON.stringify(report, null, 2));
  if (process.env.REPORT_PATH)
    await writeFile(process.env.REPORT_PATH, JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
