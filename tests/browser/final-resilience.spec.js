import { test, expect } from "@playwright/test";
function errorsFor(page) {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("requestfailed", r => errors.push(r.url()));
  page.on("response", r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}
for (const mode of ["denied", "malformed", "wrong-types", "negative"]) {
  test(`storage ${mode} does not prevent startup movement music or scoring`, async ({ page }) => {
    const errors = errorsFor(page);
    await page.addInitScript(mode => {
      if (mode === "denied") Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Denied", "SecurityError"); } });
      else {
        const values = mode === "malformed" ? ["{", "{", "{"] : mode === "wrong-types" ? ['{"best":99}', '"no"', '[]'] : ["-3", "false", "-1"];
        ["best", "music.enabled", "music.volume"].forEach((key, i) => localStorage.setItem(`prism-break.${key}`, values[i]));
      }
    }, mode);
    await page.goto("./?test=1");
    await expect(page.locator("#best")).toHaveText("000000");
    await page.locator("#primary").click();
    const before = await page.evaluate(() => prismState().paddle.x);
    await page.keyboard.down("d");
    await expect.poll(() => page.evaluate(() => prismState().paddle.x)).toBeGreaterThan(before + 10);
    await page.keyboard.up("d");
    await page.locator("#music").click();
    await page.locator("#launch").click();
    if (!process.env.LIVE_URL) {
      await page.evaluate(() => prismTest.scenario("score"));
      await expect(page.locator("#score")).toHaveText("000100");
    }
    expect(errors).toEqual([]);
  });
}
test("stored-muted real signal and zero-volume preserve one advancing transport", async ({ page }) => {
  const errors = errorsFor(page);
  await page.addInitScript(() => { localStorage.setItem("prism-break.music.enabled", "false"); localStorage.setItem("prism-break.music.volume", "0.6"); });
  await page.goto("./");
  expect(await page.evaluate(() => prismAudio.snapshot().contextCount)).toBe(0);
  await page.locator("#primary").click();
  await expect.poll(() => page.evaluate(() => prismAudio.snapshot().elapsed)).toBeGreaterThan(0.15);
  expect(await page.evaluate(() => prismAudio.measure().rms)).toBeLessThan(0.001);
  const before = await page.evaluate(() => prismAudio.snapshot());
  await page.locator("#music").click();
  await expect.poll(() => page.evaluate(() => prismAudio.measure().rms)).toBeGreaterThan(0.003);
  await page.locator("#volume").fill("0");
  await expect.poll(() => page.evaluate(() => prismAudio.measure().rms)).toBeLessThan(0.001);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.locator("#restart").click();
  await page.locator("#volume").fill("60");
  await expect.poll(() => page.evaluate(() => prismAudio.measure().rms)).toBeGreaterThan(0.003);
  expect(await page.evaluate(() => prismAudio.snapshot())).toMatchObject({ startedAt: before.startedAt, contextCount: 1, sourceCount: 1 });
  await expect.poll(() => page.evaluate(() => prismAudio.snapshot().elapsed)).toBeGreaterThan(before.elapsed);
  expect(errors).toEqual([]);
});
test("falling pickup fixture renders and collects all four powers with real rules", async ({ page }) => {
  test.skip(Boolean(process.env.LIVE_URL), "Local deterministic falling-drop fixture only");
  const errors = errorsFor(page);
  await page.goto("./?test=1");
  await page.locator("#primary").click();
  await page.locator("#launch").click();
  for (const type of ["wide", "slow", "multi", "life"]) {
    await page.evaluate(type => prismTest.scenario(`drop-${type}`), type);
    await page.screenshot({path:`${process.env.RELEASE_SCREENSHOTS || 'test-results'}/falling-${type}.png`});
    // Fixture queues a visible drop above the paddle, not a direct power call.
    await expect.poll(() => page.evaluate(() => prismState().effects.wide)).toBeGreaterThan(0);
    if (type === "slow") await expect.poll(() => page.evaluate(() => prismState().effects.slow)).toBeGreaterThan(0);
    if (type === "multi") await expect.poll(() => page.evaluate(() => prismState().balls.length)).toBe(3);
    if (type === "life") await expect.poll(() => page.evaluate(() => prismState().lives)).toBe(4);
  }
  expect(errors).toEqual([]);
});
