import { it, expect } from "vitest";
import * as music from "../src/music.js";
it("publishes an original fourth-led rising/falling hook, not the Snake arpeggio opening", () => {
  expect(music.HOOK).toBeDefined();
  const notes = music.HOOK.filter((n) => n !== null);
  expect(notes.slice(0, 5)).toEqual([69, 74, 76, 81, 79]);
  expect(notes.slice(0, 5)).not.toEqual([69, 72, 76, 79, 76]);
  expect(Object.isFrozen(music.HOOK)).toBe(true);
});
