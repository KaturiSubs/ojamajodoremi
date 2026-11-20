import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CountdownPage } from "@/components/countdown/CountdownPage";
import { IntroSplash } from "@/components/countdown/IntroSplash";

const INTRO_KEY = "intro_seen_v1";

function Home() {
  const [phase, setPhase] = useState<"checking" | "intro" | "done">("checking");
  useEffect(() => {
    setPhase(localStorage.getItem(INTRO_KEY) ? "done" : "intro");
  }, []);
  const finish = useCallback(() => {
    localStorage.setItem(INTRO_KEY, "1");
    setPhase("done");
  }, []);
  if (phase === "checking") return <div className="min-h-screen bg-black" />;
  if (phase === "intro") return <IntroSplash onDone={finish} />;
  return <CountdownPage />;
}

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
  component: Home,
});
