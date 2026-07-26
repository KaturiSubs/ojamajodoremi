import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/chapters")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    fromwhite: s.fromwhite === 1 || s.fromwhite === "1" ? 1 : undefined,
  }),
  head: () => ({
    meta: [
      { title: "//" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChaptersPage,
});

const CHAPTERS = [
  { n: 1, label: "CHAPTER 1 - HISTORY RETOLD" },
  { n: 2, label: "CHAPTER 2 - HISTORY REPEATS" },
  { n: 3, label: "CHAPTER 3 - HISTORY REVOLUTION" },
  { n: 4, label: "CHAPTER 4 - HISTORY REVISIONISM" },
];

function ChaptersPage() {
  const { fromwhite } = Route.useSearch();
  const [white, setWhite] = useState(fromwhite === 1 ? 1 : 0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!fromwhite) return;
    const t = setTimeout(() => setWhite(0), 50);
    return () => clearTimeout(t);
  }, [fromwhite]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      {/* 4:3 CRT frame */}
      <div
        className="relative overflow-hidden bg-black"
        style={{
          aspectRatio: "4 / 3",
          width: "min(100vw, calc(100vh * 4 / 3))",
          height: "min(100vh, calc(100vw * 3 / 4))",
        }}
      >
        <div className="relative z-0 flex h-full w-full flex-col items-start justify-center gap-4 px-[8%] py-[8%]">
          {CHAPTERS.map((c) => (
            <button
              key={c.n}
              onClick={() =>
                navigate({ to: "/reveal/$slug", params: { slug: `chapter-${c.n}` } })
              }
              className="crt-chapter-link block text-left"
            >
              {`> ${c.label}`}
            </button>
          ))}
        </div>

        {/* CRT scanlines + vignette scoped to the 4:3 frame */}
        <div className="scanlines pointer-events-none absolute inset-0 z-10 opacity-60" />
        <div className="vignette pointer-events-none absolute inset-0 z-10" />
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.75) 100%)",
          }}
        />
      </div>

      {/* White fade-in transition from the countdown page */}
      <div
        className="pointer-events-none fixed inset-0 z-50 bg-white"
        style={{
          opacity: white,
          transition: "opacity 1400ms ease-out",
        }}
      />

      <style>{`
        .crt-chapter-link {
          font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: clamp(14px, 2.6vh, 26px);
          color: #b6ffcc;
          letter-spacing: 0.08em;
          text-shadow:
            0 0 6px rgba(120, 255, 170, 0.7),
            0 0 14px rgba(120, 255, 170, 0.35);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 120ms, text-shadow 120ms, transform 120ms;
        }
        .crt-chapter-link:hover {
          color: #ffffff;
          text-shadow:
            0 0 8px rgba(255,255,255,0.9),
            0 0 22px rgba(180,255,210,0.7);
          transform: translateX(6px);
        }
      `}</style>
    </div>
  );
}
