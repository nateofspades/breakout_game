import { it, expect } from "vitest";
import { compose } from "../src/music.js";
it("musical tails wrap over loop boundary without a cutoff click", () => {
  const channels = compose(24000);
  for (const ch of channels)
    expect(Math.abs(ch[0] - ch.at(-1))).toBeLessThan(0.01);
});
