import { createFileRoute } from "@tanstack/react-router";
import { CountdownPage } from "@/components/countdown/CountdownPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIGNAL LOST // COUNTDOWN" },
      { name: "description", content: "Something is about to arrive. Wait for the transmission." },
      { property: "og:title", content: "SIGNAL LOST // COUNTDOWN" },
      { property: "og:description", content: "Something is about to arrive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CountdownPage,
});
