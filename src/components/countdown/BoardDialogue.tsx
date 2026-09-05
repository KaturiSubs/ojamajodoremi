import { useEffect, useRef, useState } from "react";
import textMain from "@/assets/snd_board_text_main.wav.asset.json";
import textEnd from "@/assets/snd_board_text_main_end.wav.asset.json";

const LINES = [
  "Incorrect and unrelated.",
  "This experiment is not related to that game.",
  "But I'll direct you to where is most logical and what you expect.",
];

const CHAR_MS = 45;

// Shared Web Audio context + decoded blip buffer (decoded once, reused).
let blipCtx: AudioContext | null = null;
let blipBufferPromise: Promise<AudioBuffer | null> | null = null;

function getBlipContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!blipCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    blipCtx = new Ctor();
  }
  return blipCtx;
}

function loadBlipBuffer(): Promise<AudioBuffer | null> {
  if (!blipBufferPromise) {
    blipBufferPromise = (async () => {
      const ctx = getBlipContext();
      if (!ctx) return null;
      try {
        const res = await fetch(textMain.url);
        const data = await res.arrayBuffer();
        return await ctx.decodeAudioData(data);
      } catch {
        return null;
      }
    })();
  }
  return blipBufferPromise;
}

export function BoardDialogue({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [fontReady, setFontReady] = useState(false);
  const line = LINES[index] ?? "";
  const complete = shown >= line.length;

  // Decoded blip + every source currently sounding.
  const blipRef = useRef<{ ctx: AudioContext; buffer: AudioBuffer } | null>(null);
  const activeRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Wait for the Tenna font before rendering text so it never flashes a fallback.
  useEffect(() => {
    let alive = true;
    document.fonts
      ?.load('24px "Tenna Glyphs"')
      .then(() => {
        if (alive) setFontReady(true);
      })
      .catch(() => {
        if (alive) setFontReady(true);
      });
    const t = setTimeout(() => alive && setFontReady(true), 1500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  // Preload + unlock the blip.
  useEffect(() => {
    if (!fontReady) return;
    let alive = true;
    loadBlipBuffer().then(async (buffer) => {
      if (!alive || !buffer) return;
      const ctx = getBlipContext();
      if (!ctx) return;
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});
      if (alive) blipRef.current = { ctx, buffer };
    });
    return () => {
      alive = false;
    };
  }, [fontReady]);

  // Play the blip right now, as-is. Called the instant a letter appears.
  const playBlip = () => {
    const b = blipRef.current;
    if (!b) return;
    const src = b.ctx.createBufferSource();
    src.buffer = b.buffer;
    src.connect(b.ctx.destination);
    activeRef.current.add(src);
    src.onended = () => {
      activeRef.current.delete(src);
      try {
        src.disconnect();
      } catch {
        /* ignore */
      }
    };
    src.start();
  };

  // Kill every blip immediately.
  const stopAllBlips = () => {
    for (const src of activeRef.current) {
      try {
        src.stop();
      } catch {
        /* ignore */
      }
    }
    activeRef.current.clear();
  };

  // Typewriter: letter appears -> blip plays. Nothing else.
  useEffect(() => {
    if (!fontReady) return;
    setShown(0);
    const t = setInterval(() => {
      setShown((s) => {
        if (s >= line.length) {
          clearInterval(t);
          return s;
        }
        playBlip();
        return s + 1;
      });
    }, CHAR_MS);
    return () => {
      clearInterval(t);
      stopAllBlips();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, line.length, fontReady]);

  // Arrow is up -> no more blips, full stop.
  useEffect(() => {
    if (complete) stopAllBlips();
  }, [complete]);

  const advance = () => {
    if (!complete) {
      stopAllBlips();
      setShown(line.length);
      return;
    }
    try {
      const a = new Audio(textEnd.url);
      a.volume = 0.6;
      a.play().catch(() => {});
    } catch {
      /* ignore */
    }
    if (index >= LINES.length - 1) onDone();
    else setIndex((i) => i + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["z", "Z", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div
        onClick={advance}
        onTouchStart={advance}
        className="relative w-full max-w-2xl cursor-pointer border-2 border-white bg-black px-5 py-4"
        style={{ fontFamily: "'Tenna Glyphs', monospace" }}
      >
        <p className="whitespace-pre-wrap text-xl leading-[1.5] tracking-wide text-white sm:text-2xl">
          {fontReady ? line.slice(0, shown) : ""}
        </p>
        {complete && fontReady && (
          <span className="absolute bottom-1 right-4 text-3xl text-white board-arrow sm:text-4xl">▼</span>
        )}
      </div>
    </div>
  );
}
