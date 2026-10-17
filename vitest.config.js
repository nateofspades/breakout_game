import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/*.test.js"],
    maxWorkers: 1,
    isolate: false,
    testTimeout: 20000,
  },
});
