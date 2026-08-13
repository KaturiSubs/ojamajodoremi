import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/progress")({
  ssr: false,
  head: () => ({
    meta: [{ title: "…" }, { name: "robots", content: "noindex" }],
  }),
  component: ProgressPage,
});

const WIDTH = 20;

function Bar({ emoji, pct }: { emoji: string; pct: number }) {
  const filled = Math.round((pct / 100) * WIDTH);
  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <span className="text-2xl sm:text-3xl">{emoji}</span>
      <span className="tracking-tight">
        {"▓".repeat(filled)}
        {"░".repeat(WIDTH - filled)}
      </span>
    </div>
  );
}

function ProgressPage() {
  const [shown, setShown] = useState(false);

  return (
    <div
      onClick={() => setShown(true)}
      className="flex min-h-screen cursor-default flex-col items-center justify-center gap-4 bg-black px-6 text-white"
      style={{ fontFamily: "'Determination Mono', monospace" }}
    >
      <div className="flex flex-col gap-3 text-lg sm:text-2xl">
        <Bar emoji="📝" pct={100} />
        <Bar emoji="🗣️" pct={30} />
        <Bar emoji="🎬" pct={0} />
        <Bar emoji="🇯🇵" pct={0} />
      </div>
      <div className="mt-6 h-10 text-3xl sm:text-4xl">{shown ? "6" : ""}</div>
    </div>
  );
}
