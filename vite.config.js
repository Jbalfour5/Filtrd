import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const ngrokHost = env.VITE_REDIRECT_HOST;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5175,
      strictPort: true,
      hmr: {
        host: ngrokHost,
        protocol: "wss",
      },
      allowedHosts: ngrokHost ? [ngrokHost] : [],
    },
  };
});
