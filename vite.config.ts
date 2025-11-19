import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const host = process.env.TAURI_DEV_HOST;

const ReactCompilerConfig = {
  /* ... */
};

// https://vite.dev/config/
export default defineConfig(async () => ({
  base: "./",
  build: {
    outDir: "build/client",
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
      },
    }),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: [
      "tauri-plugin-system-fonts-api",
      "zustand",
      "@tauri-apps/api/core",
      "lucide-react",
      "react-resizable-panels",
      "clsx",
      "tailwind-merge",
      "@radix-ui/react-slot",
      "class-variance-authority",
      "@radix-ui/react-dialog",
      "@tauri-apps/plugin-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-context-menu",
      "react-moveable",
      "motion/react",
      "@radix-ui/react-tabs",
      "@radix-ui/react-label",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-accordion",
      "@radix-ui/react-popover",
      "cmdk",
      "@uiw/react-color",
      "@radix-ui/react-slider",
    ],
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
