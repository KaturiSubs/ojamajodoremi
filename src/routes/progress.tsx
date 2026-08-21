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
    <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap leading-none">
      <div className="flex w-7 items-center justify-center text-xl sm:w-8 sm:text-2xl">
        {emoji}
      </div>
      <span className="text-sm tracking-tight sm:text-base">
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
      className="flex min-h-screen cursor-default flex-col items-center justify-center gap-2 bg-black px-6 text-white sm:gap-3"
      style={{ fontFamily: "'Determination Mono', monospace" }}
    >
      <div className="flex flex-col gap-2 text-sm sm:text-base">
        <Bar emoji="📝" pct={100} />
        <Bar emoji="🗣️" pct={45} />
        <Bar emoji="🎬" pct={0} />
        <Bar emoji="🇯🇵" pct={0} />
        <Bar emoji="🎨" pct={0} />
      </div>
      <div className="mt-4 h-8 text-2xl sm:text-3xl">{shown ? "8" : ""}</div>
    </div>
  );
}
