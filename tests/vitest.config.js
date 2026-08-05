import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    // The rules emulator is a single shared process; parallel files would race
    // on the same documents via clearFirestore().
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000
  }
});
