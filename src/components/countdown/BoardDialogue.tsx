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
  const typingRef = useRef<{ sources: AudioBufferSourceNode[] } | null>(null);

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

  // One blip per typed letter: each character typed schedules one full,
  // untouched play of the sound byte (original speed/pitch). Blips are
  // scheduled back-to-back in Web Audio so a playing blip always finishes
  // completely before the next one starts — never cut off.
  const blipRef = useRef<{ ctx: AudioContext; buffer: AudioBuffer; nextTime: number; lastStart: number } | null>(null);

  useEffect(() => {
    if (!fontReady) return;
    let alive = true;
    loadBlipBuffer().then(async (buffer) => {
      if (!alive || !buffer) return;
      const ctx = getBlipContext();
      if (!ctx) return;
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});
      if (!alive) return;
      if (!blipRef.current) blipRef.current = { ctx, buffer, nextTime: 0, lastStart: 0 };
    });
    return () => {
      alive = false;
    };
  }, [fontReady]);

  const playBlip = () => {
    const b = blipRef.current;
    if (!b) return;
    const { ctx, buffer } = b;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = BLIP_RATE;
    src.connect(ctx.destination);
    // Chain blips: a playing blip always finishes, but the next one starts
    // at most ~0.25s after the previous one started, so letters stay snappy.
    const now = ctx.currentTime;
    const earliest = Math.max(now + 0.005, b.lastStart + 0.25);
    const startAt = Math.max(earliest, Math.min(b.nextTime, earliest));
    src.start(startAt);
    b.lastStart = startAt;
    b.nextTime = startAt + buffer.duration / BLIP_RATE;
    if (!typingRef.current) typingRef.current = { sources: [] };
    typingRef.current.sources.push(src);
  };

  // Typewriter — one blip per letter.
  useEffect(() => {
    if (!fontReady) return;
    setShown(0);
    const t = setInterval(() => {
      setShown((s) => {
        if (s >= line.length) {
          clearInterval(t);
          return s;
        }
        const next = s + 1;
        if (next >= line.length) {
          // Final letter: play its blip, then cancel anything still queued so
          // the blips end with the typing instead of overstaying.
          playBlip();
          const b = blipRef.current;
          const rec = typingRef.current;
          if (b && rec) {
            for (const src of rec.sources) {
              try {
                src.stop(b.lastStart + bufferTail(b.buffer));
              } catch {
                /* ignore */
              }
            }
            rec.sources = [];
          }
          return next;
        }
        playBlip();
        return next;
      });
    }, CHAR_MS);
    return () => {
      clearInterval(t);
      // Silence any blips still sounding when the line changes / unmounts.
      if (typingRef.current) {
        for (const src of typingRef.current.sources) {
          try {
            src.stop();
          } catch {
            /* ignore */
          }
        }
        typingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, line.length, fontReady]);

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
