import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    // Only server actions and utilities are unit tested — no component tests.
    include: ["src/actions/**/*.test.ts", "src/lib/**/*.test.ts"],
    setupFiles: ["dotenv/config"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
