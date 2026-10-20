// SOURCE-PHASE DRAFT: deliberately unexecuted. Observe RED before branding edits.
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
const text = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
it("publishes the exact BrikaVolt browser and accessible home identity", () => {
  const html = text("index.html");
  expect(html).toMatch(/<title>BrikaVolt(?:\s*[—|·-][^<]*)?<\/title>/);
  expect(html).toMatch(/<h1>BrikaVolt<\/h1>/);
  expect(html).toContain('aria-label="BrikaVolt home"');
  expect(html).toMatch(/content="BrikaVolt:/);
  expect(html).not.toMatch(/Prism Break|Brick Blitz|private study/i);
});
it("starts README with exact title and approved case-sensitive live URL", () => {
  const readme = text("README.md");
  expect(readme.split("\n")[0]).toBe("# BrikaVolt");
  expect(readme.split("\n").slice(1, 5).join("\n")).toContain("https://nateofspades.github.io/BrikaVolt_Game/");
  expect(readme).toMatch(/!\[[^\]]+\]\(assets\/screenshots\/gameplay\.png\)/);
});
it("uses the final package identity consistently without replacing music or license", () => {
  const pkg = JSON.parse(text("package.json"));
  const lock = JSON.parse(text("package-lock.json"));
  expect(pkg.name).toBe("brikavolt");
  expect(lock.name).toBe(pkg.name);
  expect(lock.packages[""].name).toBe(pkg.name);
  expect(text("LICENSE")).toContain("Copyright (c) 2026 Nathan Burns");
  expect(text("src/music.js")).toContain('title: "Prism Velocity"');
});
it("keeps historical storage namespace instead of silently losing existing records", () => {
  const storage = text("src/storage.js");
  expect(storage).toContain('"prism-break." + key');
  expect(storage).not.toMatch(/brikavolt\.(best|music)/i);
});
