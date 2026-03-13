import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function missingAssetPlugin() {
  return {
    name: "missing-asset-fallback",
    load(id: string) {
      if (/\.(png|jpg|jpeg|gif|webp)$/.test(id) && !fs.existsSync(id)) {
        return `export default "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='60'%3E%3Crect width='200' height='60' fill='%231a1a2e' rx='8'/%3E%3Ctext x='100' y='38' font-family='Arial' font-size='24' font-weight='bold' fill='%23e94560' text-anchor='middle'%3ECopikonUSA%3C/text%3E%3C/svg%3E";`;
      }
    },
  };
}

export default defineConfig({
  plugins: [missingAssetPlugin(), react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  base: "./",
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: false,
      deny: ["**/.*"],
    },
  },
});
