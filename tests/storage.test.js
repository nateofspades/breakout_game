import { it, expect } from "vitest";
import { read, write, record } from "../src/storage.js";
it("persists highscores monotonically", () => {
  const m = new Map();
  const s = { getItem: (k) => m.get(k), setItem: (k, v) => m.set(k, v) };
  expect(record(s, 100)).toBe(100);
  expect(record(s, 50)).toBe(100);
  expect(read(s, "best", 0)).toBe(100);
});
it("storage denial and malformed values are nonfatal", () => {
  const s = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
  };
  expect(read(s, "best", 0)).toBe(0);
  expect(write(s, "best", 2)).toBe(false);
  expect(record(s, 23)).toBe(23);
  expect(read({ getItem: () => "{oops" }, "best", 0)).toBe(0);
});
