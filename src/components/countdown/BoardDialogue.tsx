import { useEffect, useRef, useState } from "react";
import textMain from "@/assets/snd_board_text_main.wav.asset.json";
import textEnd from "@/assets/snd_board_text_main_end.wav.asset.json";

const LINES = [
  "Incorrect and unrelated.",
  "This experiment is not related to that game.",
  "But I'll direct you to where is most logical and what you expect.",
];

const CHAR_MS = 45;
// Blip is played exactly as-is: native speed/pitch, full length, back-to-back.
const BLIP_RATE = 1;

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
  const typingRef = useRef<{ stop: () => void } | null>(null);

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
    // Safety: never hang the dialogue on font loading.
    const t = setTimeout(() => alive && setFontReady(true), 1500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  // Typewriter
  useEffect(() => {
    if (!fontReady) return;
    setShown(0);
    const t = setInterval(() => {
      setShown((s) => {
        if (s >= line.length) {
          clearInterval(t);
          return s;
        }
        return s + 1;
      });
    }, CHAR_MS);
    return () => clearInterval(t);
  }, [index, line.length, fontReady]);

  // Chained text blips while typing (Web Audio, sample-accurate): each blip is
  // scheduled to start exactly when the previous one ends, so every blip plays
  // in full with no gap. When typing finishes we only cancel blips that have
  // not started yet — the one currently playing always finishes.
  useEffect(() => {
    if (!fontReady) return;
    let cancelled = false;
    let stoppedChaining = false;
    let ctx: AudioContext | null = null;
    const active: { src: AudioBufferSourceNode; startAt: number }[] = [];

    const run = async () => {
      const buffer = await loadBlipBuffer();
      if (cancelled || !buffer) return;
      ctx = getBlipContext();
      if (!ctx) return;
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});
      if (cancelled) return;

      const gain = ctx.createGain();
      gain.gain.value = 0.6;
      gain.connect(ctx.destination);

      const rate = BLIP_RATE;
      const dur = buffer.duration / rate;
      let nextTime = ctx.currentTime + 0.01;

      const schedule = () => {
        if (cancelled || stoppedChaining || !ctx) return;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.playbackRate.value = rate;
        src.connect(gain);
        const startAt = nextTime;
        src.start(startAt);
        active.push({ src, startAt });
        nextTime = startAt + dur;
        src.onended = () => {
          const i = active.findIndex((a) => a.src === src);
          if (i >= 0) active.splice(i, 1);
          // Keep exactly one blip queued behind the playing one.
          if (active.length < 1) schedule();
        };
        // Queue the following blip right away so there is never a gap.
        if (active.length < 2) schedule();
      };
      schedule();
    };
    run();

    typingRef.current = {
      // Stop chaining; cancel only blips that haven't begun yet.
      stop: () => {
        stoppedChaining = true;
        if (!ctx) return;
        const now = ctx.currentTime;
        for (const a of active) {
          if (a.startAt > now + 0.005) {
            try {
              a.src.stop();
            } catch {
              /* ignore */
            }
          }
        }
      },
    };

    return () => {
      cancelled = true;
      stoppedChaining = true;
      // Unmount / line change: silence everything.
      for (const a of active) {
        try {
          a.src.stop();
        } catch {
          /* ignore */
        }
      }
    };
  }, [index, fontReady]);

  // When the line finishes typing, stop chaining but let the current blip end.
  useEffect(() => {
    if (complete) {
      typingRef.current?.stop();
    }
  }, [complete]);

  const advance = () => {
    if (!complete) {
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
