import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
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

const TITLE = "Final Note";

const LINES = [
  "It's a bit silly, but I've always wanted something crazy and nonsensical like a convincing conspiracy theory out of this show.",
  "I just never expected it to be myself to make it happen. Crazy huh?",
  "It only just took 2 years though, haha.",
  "I think this is where this ends now though.",
  "I couldn't get to do everything I wanted.",
  "But still, I'm glad I was able to share this inexplainable moment with you.",
  "It feels so, beautiful that you were able to witness this last piece of mine here.",
];

function DreamPage() {
  const { settings } = useSiteSettings();
  const { isAdmin, loading } = useIsAdmin();
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  if (loading) return <div className="min-h-screen bg-black" />;
  if (!isAdmin)
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-mono text-xs uppercase tracking-widest text-white/50">
        not found
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <BackgroundLayer
        url={settings?.background_url ?? null}
        kind={settings?.background_kind ?? "image"}
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div
          className="max-w-2xl space-y-5 rounded-lg bg-black/60 px-6 py-8 text-center text-base leading-relaxed text-white sm:px-10 sm:py-12 sm:text-lg"
          style={{ fontFamily: "'Determination Mono', monospace" }}
        >
          <h1
            className="dream-line text-xl font-semibold uppercase tracking-widest text-white/90 sm:text-2xl"
            style={{ animationDelay: "0.6s" }}
          >
            {TITLE}
          </h1>
          {LINES.map((line, i) => (
            <p
              key={i}
              className="dream-line"
              style={{ animationDelay: `${1.7 + i * 1.1}s` }}
            >
              {line}
            </p>
          ))}
          <p
            className="dream-line text-xl text-white/90 sm:text-2xl"
            style={{ animationDelay: `${1.7 + LINES.length * 1.1}s` }}
          >
            Thank you.
          </p>
          <p
            className="dream-line dream-gradient text-2xl font-bold sm:text-3xl"
            style={{ animationDelay: `${1.7 + (LINES.length + 1) * 1.1}s` }}
          >
            For watching my dream.
          </p>
        </div>
      </div>
    </div>
  );
}
