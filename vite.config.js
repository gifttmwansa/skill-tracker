import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the built app works on Vercel, Netlify and
  // GitHub Pages (including project sub-paths) without extra configuration.
  base: "./",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
  },
});
