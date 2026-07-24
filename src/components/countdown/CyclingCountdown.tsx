import { useEffect, useRef, useState } from "react";
import sfxAsset from "@/assets/computer_loading.mp3.asset.json";

function RandomDigit() {
  const [d, setD] = useState(() => Math.floor(Math.random() * 10));
  useEffect(() => {
    // Vary each digit's shuffle rate slightly for organic feel
    const interval = 55 + Math.floor(Math.random() * 55);
    const t = setInterval(
      () => setD(Math.floor(Math.random() * 10)),
      interval,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <span
      className="inline-block tabular-nums"
      style={{ filter: "blur(1.2px)", textShadow: "0 0 12px rgba(233,228,255,0.7)" }}
    >
      {d}
    </span>
  );
}

function Cell({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center border-2 border-white/70 bg-black/40 px-3 py-2 font-sans text-5xl font-black text-[#E9E4FF] sm:px-6 sm:py-4 sm:text-7xl md:text-8xl"
        style={{
          boxShadow:
            "0 0 24px rgba(210,200,255,0.35), inset 0 0 20px rgba(210,200,255,0.15)",
          minWidth: "1.6em",
        }}
      >
        <RandomDigit />
        <RandomDigit />
      </div>
      <div className="mt-2 font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-white/70">
        {label}
      </div>
    </div>
  );
}

export function CyclingCountdown() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio(sfxAsset.url);
    a.loop = true;
    a.volume = 0.15;
    audioRef.current = a;
    const play = () => a.play().catch(() => {});
    play();
    const onGesture = () => play();
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      a.pause();
      a.src = "";
    };
  }, []);

  const Colon = () => (
    <span className="pb-6 font-sans text-4xl font-black text-white/50 sm:text-6xl">
      :
    </span>
  );

  return (
    <div className="flex items-end gap-2 sm:gap-4">
      <Cell label="days" />
      <Colon />
      <Cell label="hrs" />
      <Colon />
      <Cell label="min" />
      <Colon />
      <Cell label="sec" />
    </div>
  );
}
