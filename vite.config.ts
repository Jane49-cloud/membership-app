import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // This lets us use @/ as a shortcut to the src/ folder in imports
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Vitest needs a browser-like environment to test React components
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
  },
});
