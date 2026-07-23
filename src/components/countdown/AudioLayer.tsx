import { useEffect, useRef, useState } from "react";
import bgmAsset from "@/assets/another_witch.mp3.asset.json";

const STORAGE_KEY = "countdown_volume";

/**
 * Gapless BGM using the Web Audio API (AudioBufferSourceNode.loop = true).
 * Falls back to the uploaded ANOTHER_WITCH.mp3 asset if no admin URL is set.
 */
export function AudioLayer({
  url,
  defaultVolume,
}: {
  url: string | null;
  defaultVolume: number;
}) {
  const src = url && url.length > 0 ? url : bgmAsset.url;

  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const startedRef = useRef(false);

  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return defaultVolume / 100;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored != null) {
      const n = Number(stored);
      if (!Number.isNaN(n)) return Math.max(0, Math.min(1, n));
    }
    return Math.max(0, Math.min(1, defaultVolume / 100));
  });

  // Load + decode the audio buffer
  useEffect(() => {
    if (!src) return;
    let cancelled = false;

    const AC: typeof AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;

    const ctx = new AC();
    ctxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    (async () => {
      try {
        const res = await fetch(src);
        const arr = await res.arrayBuffer();
        const buf = await ctx.decodeAudioData(arr);
        if (cancelled) return;
        bufferRef.current = buf;
        tryStart();
      } catch {
        /* ignore */
      }
    })();

    const tryStart = () => {
      if (startedRef.current) return;
      if (!ctxRef.current || !bufferRef.current || !gainRef.current) return;
      const source = ctxRef.current.createBufferSource();
      source.buffer = bufferRef.current;
      source.loop = true;
      source.connect(gainRef.current);
      try {
        source.start(0);
        sourceRef.current = source;
        startedRef.current = true;
      } catch {
        /* ignore */
      }
    };

    const unlock = () => {
      ctx.resume().catch(() => {});
      tryStart();
    };
    // Try immediately; if autoplay is blocked, first gesture will unlock.
    ctx.resume().catch(() => {});
    tryStart();

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      try {
        sourceRef.current?.stop();
      } catch {
        /* ignore */
      }
      sourceRef.current?.disconnect();
      gainRef.current?.disconnect();
      ctx.close().catch(() => {});
      ctxRef.current = null;
      gainRef.current = null;
      sourceRef.current = null;
      bufferRef.current = null;
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Apply volume
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(volume));
    }
  }, [volume]);

  // Volume via arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

  return null;
}
