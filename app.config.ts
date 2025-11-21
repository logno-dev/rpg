import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "vercel"
  },
  ssr: true,
  extensions: ["tsx", "ts"]
});
