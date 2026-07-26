import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { supabase } from "@/integrations/supabase/client";
import { BackgroundLayer } from "./BackgroundLayer";
import { AudioLayer } from "./AudioLayer";
import { CyclingCountdown } from "./CyclingCountdown";
import { HotspotLayer } from "./HotspotLayer";
import { KonamiLayer } from "./KonamiLayer";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { TypedSecret } from "./TypedSecret";

export function CountdownPage() {
  const { settings, loading } = useSiteSettings();
  const [now, setNow] = useState(() => Date.now());
  const [hotspots, setHotspots] = useState<
    Array<{ id: string; x_pct: number; y_pct: number; width_pct: number; height_pct: number; slug: string }>
  >([]);
  const [keySecrets, setKeySecrets] = useState<Array<{ slug: string; key_sequence: string }>>([]);
  const [whiteOpacity, setWhiteOpacity] = useState(0);
  const hitsRef = useRef<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  // Ominous spam escalation: whiten screen with each hit within 5s window,
  // decay when idle, redirect to /chapters at 12 hits.
  useEffect(() => {
    const WINDOW_MS = 5000;
    const THRESHOLD = 12;

    const onHit = () => {
      const now = Date.now();
      hitsRef.current = hitsRef.current.filter((t) => now - t < WINDOW_MS);
      hitsRef.current.push(now);
      const count = hitsRef.current.length;
      setWhiteOpacity(Math.min(1, count / THRESHOLD));
      if (count >= THRESHOLD) {
        setWhiteOpacity(1);
        setTimeout(() => {
          navigate({ to: "/chapters", search: { fromwhite: 1 } as any });
        }, 500);
      }
    };
    window.addEventListener("ominous-hit", onHit);

    // Decay every 250ms based on age of hits
    const decay = setInterval(() => {
      const now = Date.now();
      hitsRef.current = hitsRef.current.filter((t) => now - t < WINDOW_MS);
      const count = hitsRef.current.length;
      setWhiteOpacity((prev) => {
        const target = Math.min(1, count / THRESHOLD);
        // ease down toward target
        if (prev <= target) return prev;
        return Math.max(target, prev - 0.05);
      });
    }, 250);

    return () => {
      window.removeEventListener("ominous-hit", onHit);
      clearInterval(decay);
    };
  }, [navigate]);

  useEffect(() => {
    supabase
      .from("hotspots")
      .select("id, x_pct, y_pct, width_pct, height_pct, secrets(slug)")
      .then(({ data }) => {
        if (!data) return;
        setHotspots(
          data
            .filter((h: any) => h.secrets?.slug)
            .map((h: any) => ({
              id: h.id,
              x_pct: Number(h.x_pct),
              y_pct: Number(h.y_pct),
              width_pct: Number(h.width_pct),
              height_pct: Number(h.height_pct),
              slug: h.secrets.slug,
            })),
        );
      });

    supabase
      .from("secrets")
      .select("slug, key_sequence, discovery_type")
      .eq("discovery_type", "key_sequence")
      .then(({ data }) => {
        if (!data) return;
        setKeySecrets(
          data
            .filter((s: any) => s.key_sequence)
            .map((s: any) => ({ slug: s.slug, key_sequence: s.key_sequence as string })),
        );
      });
  }, []);

  const target = settings?.countdown_target_at ? new Date(settings.countdown_target_at).getTime() : null;
  const finished = useMemo(() => (target ? now >= target : false), [target, now]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <BackgroundLayer url={settings?.background_url ?? null} kind={settings?.background_kind ?? "image"} />
      <div className="scanlines pointer-events-none absolute inset-0 z-10 opacity-40" />
      <div className="vignette pointer-events-none absolute inset-0 z-10" />

      <HotspotLayer hotspots={hotspots} />
      <KonamiLayer secrets={keySecrets} />

      <AudioLayer url={settings?.music_url ?? null} defaultVolume={settings?.default_volume ?? 60} />

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-16">
        {loading ? null : finished && settings?.youtube_url ? (
          <YouTubeEmbed url={settings.youtube_url} />
        ) : (
          <CyclingCountdown customizable={!target} />
        )}

        <TypedSecret />
      </main>

      {/* Ominous white-flash overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 bg-white transition-opacity duration-300"
        style={{ opacity: whiteOpacity }}
      />
    </div>
  );
}
