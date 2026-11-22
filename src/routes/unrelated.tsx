import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/unrelated")({
  head: () => ({
    meta: [
      { title: "Unrelated — OJAMAJO DOREMI." },
      { name: "description", content: "Not related to this experiment at all." },
      { property: "og:title", content: "Unrelated — OJAMAJO DOREMI." },
      { property: "og:description", content: "Not related to this experiment at all." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <main className="flex min-h-svh items-center justify-center bg-experiment-background px-6 text-center font-sans text-2xl font-medium text-experiment-foreground sm:text-4xl">
      <p>Not related to this experiment at all.</p>
    </main>
  ),
});