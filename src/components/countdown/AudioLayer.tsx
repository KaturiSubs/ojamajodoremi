import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "countdown_volume";

export function AudioLayer({ url, defaultVolume }: { url: string | null; defaultVolume: number }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return defaultVolume / 100;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored != null) {
      const n = Number(stored);
      if (!Number.isNaN(n)) return Math.max(0, Math.min(1, n));
    }
    return Math.max(0, Math.min(1, defaultVolume / 100));
  });
  const [unlocked, setUnlocked] = useState(false);

  // Apply volume
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = volume;
    window.localStorage.setItem(STORAGE_KEY, String(volume));
  }, [volume]);

  // Try autoplay muted; unmute on first user gesture
  useEffect(() => {
    const el = ref.current;
    if (!el || !url) return;
    el.muted = true;
    el.play().catch(() => {});
    const unlock = () => {
      if (unlocked) return;
      el.muted = false;
      el.volume = volume;
      el.play().catch(() => {});
      setUnlocked(true);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [url, unlocked, volume]);

  // Volume via arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setVolume((v) => Math.min(1, Math.round((v + 0.05) * 100) / 100));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setVolume((v) => Math.max(0, Math.round((v - 0.05) * 100) / 100));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!url) return null;
  return <audio ref={ref} src={url} loop preload="auto" />;
}
