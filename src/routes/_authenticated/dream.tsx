import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import tapIcon from "@/assets/tap-icon.png.asset.json";
import { BackgroundLayer } from "@/components/countdown/BackgroundLayer";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useIsAdmin } from "@/hooks/use-auth";
import dreamAudio from "@/assets/dreamwatching.wav.asset.json";

export const Route = createFileRoute("/_authenticated/dream")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dreamwatching" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "A private closing note." },
      { property: "og:title", content: "Dreamwatching" },
      { property: "og:description", content: "A private closing note." },
    ],
  }),
  component: DreamPage,
});

const STORAGE_ALL = "dream-revealed-all";
const STORAGE_INDEX = "dream-reveal-index";

const CHUNKS = [
  { id: "title", text: "Final Note", kind: "title" as const },
  { text: "It's a bit silly, but I've always wanted something crazy and nonsensical like a convincing conspiracy theory out of this show." },
  { text: "I just never expected it to be myself to make it happen. Crazy huh?" },
  { text: "It only just took 2 years though, haha." },
  { text: "I think this is where this ends now though." },
  { text: "I couldn't get to do everything I wanted." },
  { text: "But still, I'm glad I was able to share this inexplainable moment with you." },
  { text: "It feels so, beautiful that you were able to witness this last piece of mine here." },
  { text: "Thank you.", kind: "large" as const },
  { text: "For watching my dream.", kind: "gradient" as const },
];

const TOTAL = CHUNKS.length;

function getInitialCount() {
  if (typeof window === "undefined") return 1;
  try {
    if (localStorage.getItem(STORAGE_ALL) === "true") return TOTAL;
    const saved = parseInt(localStorage.getItem(STORAGE_INDEX) || "1", 10);
    return Number.isNaN(saved) ? 1 : Math.max(1, Math.min(saved, TOTAL));
  } catch {
    return 1;
  }
}

function DreamPage() {
  const { settings } = useSiteSettings();
  const { isAdmin, loading } = useIsAdmin();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [visibleCount, setVisibleCount] = useState(() => getInitialCount());
  const [hasFinished, setHasFinished] = useState(visibleCount === TOTAL);

  useEffect(() => {
    if (!isAdmin) return;
    const a = new Audio(dreamAudio.url);
    a.loop = true;
    a.volume = 0.7;
    audioRef.current = a;
    a.play().catch(() => {
      const unlock = () => {
        a.play().catch(() => {});
        window.removeEventListener("click", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("click", unlock);
      window.addEventListener("keydown", unlock);
    });
    return () => {
      a.pause();
      a.src = "";
    };
  }, [isAdmin]);

  useEffect(() => {
    if (visibleCount === TOTAL && !hasFinished) {
      setHasFinished(true);
    }
  }, [visibleCount, hasFinished]);

  function advance() {
    if (visibleCount >= TOTAL) return;
    const next = visibleCount + 1;
    setVisibleCount(next);
    try {
      localStorage.setItem(STORAGE_INDEX, String(next));
      if (next === TOTAL) {
        localStorage.setItem(STORAGE_ALL, "true");
      }
    } catch {
      // ignore
    }
  }

  if (loading) return <div className="min-h-screen bg-black" />;
  if (!isAdmin)
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-mono text-xs uppercase tracking-widest text-white/50">
        not found
      </div>
    );

  return (
    <div
      onClick={advance}
      className="relative min-h-screen cursor-pointer overflow-hidden bg-black select-none"
    >
      <BackgroundLayer
        url={settings?.background_url ?? null}
        kind={settings?.background_kind ?? "image"}
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div
          className="max-w-2xl space-y-5 rounded-lg bg-black/60 px-6 py-8 text-center text-base leading-relaxed text-white sm:px-10 sm:py-12 sm:text-lg"
          style={{ fontFamily: "'Determination Mono', monospace" }}
        >
          {CHUNKS.map((chunk, i) => {
            if (i >= visibleCount) return null;
            const isTitle = chunk.kind === "title";
            const isLarge = chunk.kind === "large";
            const isGradient = chunk.kind === "gradient";
            const Tag = isTitle ? "h1" : "p";
            const animClass = hasFinished ? "dream-static" : "dream-line";
            const contentClass = isTitle
              ? "dream-indigo text-xl font-semibold uppercase tracking-widest sm:text-2xl"
              : isLarge
              ? "text-xl text-white/90 sm:text-2xl"
              : isGradient
              ? "dream-gradient text-2xl font-bold sm:text-3xl"
              : "";
            return (
              <Tag
                key={chunk.id ?? i}
                className={`${animClass} ${contentClass}`.trim()}
                style={
                  hasFinished
                    ? undefined
                    : { animationDelay: `${0.1 + i * 0.15}s` }
                }
              >
                {chunk.text}
              </Tag>
            );
          })}

          {!hasFinished && (
            <div className="flex flex-col items-center gap-1 pt-4 tap-hint">
              <img src={tapIcon.url} alt="" className="h-7 w-7 opacity-80" />
              <span className="text-xs text-white/50">Tap</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
