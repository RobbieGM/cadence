import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    solidPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: { sourcemap: true },
      manifest: {
        short_name: "Cadence",
        name: "Cadence",
        icons: [
          {
            src: "/icon-192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "/icon-512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
        start_url: "/",
        background_color: "white",
        display: "standalone",
        scope: "/",
        description: "Discover harmonic inspiration",
      },
    }),
    visualizer({ sourcemap: true }),
  ],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
    target: "esnext",
    polyfillDynamicImport: false,
    sourcemap: true,
  },
});
