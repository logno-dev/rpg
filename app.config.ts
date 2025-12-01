import { defineConfig } from "@solidjs/start/config";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default defineConfig({
  server: {
    preset: "vercel"
  },
  ssr: true,
  extensions: ["tsx", "ts", "mdx"],
  vite: {
    plugins: [
      mdx({
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
      }),
    ],
  },
});
