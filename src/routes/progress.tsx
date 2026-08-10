import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { stopAllSecrets } from "@/lib/audio-manager";

export const Route = createFileRoute("/progress")({
  ssr: false,
  head: () => ({
    meta: [{ title: "//" }, { name: "robots", content: "noindex" }],
  }),
  component: ProgressPage,
});

const BARS = [
  { emoji: "📝", pct: 100 },
  { emoji: "🗣️", pct: 30 },
  { emoji: "🎬", pct: 0 },
];

const SEGMENTS = 20;
const UPDATE_COUNT = 6;

function bar(pct: number) {
  const filled = Math.round((pct / 100) * SEGMENTS);
  return "▓".repeat(filled) + "░".repeat(SEGMENTS - filled);
}

function ProgressPage() {
  const [shown, setShown] = useState(false);
  const [pop, setPop] = useState(0);

  useEffect(() => () => stopAllSecrets(), []);

  useEffect(() => {
    const onClick = () => {
      setShown(true);
      setPop((n) => n + 1);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6">
      <div className="flex flex-col gap-4">
        {BARS.map((b) => (
          <div
            key={b.emoji}
            className="flex items-center gap-3 whitespace-pre text-[#E9E4FF]"
            style={{
              fontFamily: 'ui-monospace, "Courier New", monospace',
              fontSize: "clamp(14px, 3.6vw, 28px)",
              letterSpacing: "-0.05em",
              textShadow: "0 0 12px rgba(210,200,255,0.4)",
            }}
          >
            <span style={{ fontFamily: "system-ui, sans-serif" }}>
              {b.emoji}
            </span>
            <span>{bar(b.pct)}</span>
          </div>
        ))}
      </div>

      {shown && (
        <p
          key={pop}
          className="text-center text-white"
          style={{
            fontFamily: '"Determination Mono", monospace',
            fontSize: "clamp(14px, 3vw, 24px)",
            animation: "pop-in 400ms ease-out",
          }}
        >
          THIS WEBSITE HAS BEEN UPDATED {UPDATE_COUNT} TIMES.
        </p>
      )}
    </div>
  );
}
