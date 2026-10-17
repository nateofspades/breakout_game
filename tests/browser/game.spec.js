import { test, expect } from "@playwright/test";
test("real startup, keyboard, pause and persistent music transport", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "PRISM BREAK" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => window.prismAudio.snapshot().contextCount),
  ).toBe(0);
  await page.getByRole("button", { name: "Start run" }).click();
  await page.getByRole("button", { name: "Launch ball" }).click();
  await expect(page.locator("#status")).toHaveText("IN PLAY");
  await expect
    .poll(() => page.evaluate(() => prismAudio.snapshot().state))
    .toBe("running");
  // AudioContext.state can become running before the output thread advances its
  // first quantum, especially on fast headless CI runners.
  await expect
    .poll(() => page.evaluate(() => prismAudio.snapshot().elapsed))
    .toBeGreaterThan(0.03);
  const before = await page.evaluate(() => window.prismAudio.snapshot());
  expect(before.contextCount).toBe(1);
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator("#status")).toHaveText("PAUSED");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  const after = await page.evaluate(() => window.prismAudio.snapshot());
  expect(after.startedAt).toBe(before.startedAt);
  expect(after.sourceCount).toBe(1);
  await expect
    .poll(() => page.evaluate(() => prismAudio.snapshot().elapsed))
    .toBeGreaterThan(before.elapsed);
  expect(errors).toEqual([]);
});
