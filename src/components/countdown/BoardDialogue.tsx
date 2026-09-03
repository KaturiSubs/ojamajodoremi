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
  const line = LINES[index] ?? "";
  const complete = shown >= line.length;
  const typingRef = useRef<HTMLAudioElement | null>(null);

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

  // Looping text blip while typing; stops the moment the line finishes.
  useEffect(() => {
    if (complete) {
      typingRef.current?.pause();
      return;
    }
    const a = new Audio(textMain.url);
    a.loop = true;
    a.volume = 0.6;
    typingRef.current = a;
    a.play().catch(() => {});
    return () => {
      a.pause();
      a.src = "";
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
