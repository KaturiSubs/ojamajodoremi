import { createFileRoute } from "@tanstack/react-router";
import { CountdownPage } from "@/components/countdown/CountdownPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OJAMAJO DOREMI." },
      { name: "description", content: "Ojamajo Doremi is about to get a lot more, interesting." },
      { property: "og:title", content: "OJAMAJO DOREMI." },
      { property: "og:description", content: "Ojamajo Doremi is about to get a lot more, interesting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CountdownPage,
});
