import index from "./index.html";
import path from "path";
import { serve } from "bun";

const server = serve({
  routes: {
    "/logos/*": async (req) => {
      const logoPath = req.url.split("/logos/")[1];
      if (logoPath) {
        const file = Bun.file(path.join(import.meta.dir, "logos", logoPath));
        if (await file.exists()) {
          return new Response(file);
        }
      }
      return new Response("Not found", { status: 404 });
    },

    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
