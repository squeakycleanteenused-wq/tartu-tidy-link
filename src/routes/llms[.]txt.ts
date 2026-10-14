import { createFileRoute } from "@tanstack/react-router";
import { buildLlmsTxt } from "@/lib/llms";

/* /llms.txt – ülevaade AI-assistentidele, koostatakse lehe enda andmetest (src/lib/llms.ts). */
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildLlmsTxt(), {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
