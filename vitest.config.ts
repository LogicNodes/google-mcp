import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/index.ts", // Entry point, just starts server
        "src/server.ts", // MCP integration code, tested via e2e
        "src/types/**/*.ts", // Type definitions only
      ],
      thresholds: {
        statements: 79,
        branches: 65,
        functions: 85,
        lines: 79,
      },
    },
  },
});

