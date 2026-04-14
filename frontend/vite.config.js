import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const googleClientId = env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || "";

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(googleClientId),
    },
    server: {
      host: "0.0.0.0",
      proxy: {
        "/api": "http://localhost:3001",
        "/uploads": "http://localhost:3001",
      },
    },
  };
});
