import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        // Firebase is large, stable, and changes far less often than app code.
        // Splitting it means a normal deploy only invalidates the small app
        // chunk instead of forcing every user to re-download the SDK.
        //
        // app-check and analytics are deliberately absent: they are imported
        // dynamically in firebase.js, so listing them here would pull them
        // back into the critical path.
        manualChunks: {
          firebase: [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/functions"
          ]
        }
      }
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.js"],
    css: false
  }
});
