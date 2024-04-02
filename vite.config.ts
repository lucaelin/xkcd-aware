import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
// import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

const crossOriginIsolation = () => ({
  name: "configure-server",

  configureServer(server: any) {
    server.middlewares.use((_req: any, res: any, next: any) => {
      res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), crossOriginIsolation()],
  server: {
    hmr: false,
  },
  optimizeDeps: {
    exclude: ["voice2text"],
  },
});
