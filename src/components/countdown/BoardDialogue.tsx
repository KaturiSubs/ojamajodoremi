import { useEffect, useRef, useState } from "react";
import textMain from "@/assets/snd_board_text_main.wav.asset.json";
import textEnd from "@/assets/snd_board_text_main_end.wav.asset.json";

const LINES = [
  "Incorrect and unrelated.",
  "This experiment is not related to that game.",
  "But I'll direct you to where is most logical and what you expect.",
];

const CHAR_MS = 45;

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
  }, [index, line.length]);

  // Chained text blips while typing: each blip plays to completion, then the
  // next starts immediately. When typing finishes, the current blip is allowed
  // to play out instead of being cut off.
  useEffect(() => {
    if (complete) {
      typingRef.current?.stop();
      typingRef.current = null;
      return;
    }
    let stopped = false;
    let current: HTMLAudioElement | null = null;
    const playNext = () => {
      if (stopped) return;
      const a = new Audio(textMain.url);
      a.volume = 0.6;
      a.playbackRate = 1.3;
      current = a;
      a.addEventListener("ended", playNext);
      a.play().catch(() => {});
    };
    playNext();
    typingRef.current = {
      // Stop chaining new blips, but let the current one finish playing.
      stop: () => {
        stopped = true;
      },
    };
    return () => {
      stopped = true;
      current?.pause();
      if (current) current.src = "";
    };
  }, [complete, index]);

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
          {line.slice(0, shown)}
        </p>
        {complete && (
          <span className="absolute bottom-2 right-4 text-white board-arrow">▼</span>
        )}
      </div>
    </div>
  );
}
