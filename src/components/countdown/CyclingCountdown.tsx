import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import sfxAsset from "@/assets/computer_loading.mp3.asset.json";

type DigitState = { value: number; manual: boolean; adjusting?: boolean };

const makeInitial = (): DigitState[] =>
  Array.from({ length: 8 }, () => ({
    value: Math.floor(Math.random() * 10),
    manual: false,
    adjusting: false,
  }));

function Digit({
  state,
  customizable,
  onChange,
}: {
  state: DigitState;
  customizable: boolean;
  onChange: (delta: number) => void;
}) {
  const touchY = useRef<number | null>(null);
  return (
    <span
      onWheel={
        customizable
          ? (e) => {
              e.preventDefault();
              onChange(e.deltaY > 0 ? -1 : 1);
            }
          : undefined
      }
      onTouchStart={
        customizable
          ? (e) => {
              touchY.current = e.touches[0].clientY;
            }
          : undefined
      }
      onTouchMove={
        customizable
          ? (e) => {
              if (touchY.current == null) return;
              const dy = e.touches[0].clientY - touchY.current;
              if (Math.abs(dy) > 20) {
                onChange(dy > 0 ? -1 : 1);
                touchY.current = e.touches[0].clientY;
              }
              e.preventDefault();
            }
          : undefined
      }
      className="inline-block select-none tabular-nums"
      style={{
        filter: state.manual && !state.adjusting ? "none" : "blur(1.2px)",
        textShadow: "0 0 12px rgba(233,228,255,0.7)",
        touchAction: customizable ? "none" : "auto",
        cursor: customizable ? "ns-resize" : "default",
      }}
    >
      {state.value}
    </span>
  );
}

export function CyclingCountdown({
  customizable = false,
}: {
  customizable?: boolean;
}) {
  const [digits, setDigits] = useState<DigitState[]>(makeInitial);
  const idleRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Looping SFX
  useEffect(() => {
    const a = new Audio(sfxAsset.url);
    a.loop = true;
    a.volume = 0.15;
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

  // Auto-shuffle non-manual digits
  useEffect(() => {
    const t = setInterval(() => {
      setDigits((ds) =>
        ds.map((d) =>
          d.manual ? d : { ...d, value: Math.floor(Math.random() * 10) },
        ),
      );
    }, 80);
    return () => clearInterval(t);
  }, []);

  // Idle reset: after 20s of no manual change, all revert to auto
  const bumpIdle = () => {
    if (idleRef.current) window.clearTimeout(idleRef.current);
    idleRef.current = window.setTimeout(() => {
      setDigits((ds) => ds.map((d) => ({ ...d, manual: false })));
    }, 20000);
  };

  // All 8 digits = 6 -> sakura secret
  useEffect(() => {
    if (!customizable) return;
    if (digits.every((d) => d.manual && d.value === 6)) {
      navigate({ to: "/reveal/$slug", params: { slug: "sakura" } });
    }
  }, [digits, customizable, navigate]);

  const changeDigit = (i: number, delta: number) => {
    setDigits((ds) =>
      ds.map((d, idx) =>
        idx === i
          ? { manual: true, value: (d.value + delta + 10) % 10 }
          : d,
      ),
    );
    bumpIdle();
  };

  const Cell = ({ label, start }: { label: string; start: number }) => (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center border-2 border-white/70 bg-black/40 px-3 py-2 font-sans text-5xl font-black text-[#E9E4FF] sm:px-6 sm:py-4 sm:text-7xl md:text-8xl"
        style={{
          boxShadow:
            "0 0 24px rgba(210,200,255,0.35), inset 0 0 20px rgba(210,200,255,0.15)",
          minWidth: "1.6em",
        }}
      >
        <Digit
          state={digits[start]}
          customizable={customizable}
          onChange={(d) => changeDigit(start, d)}
        />
        <Digit
          state={digits[start + 1]}
          customizable={customizable}
          onChange={(d) => changeDigit(start + 1, d)}
        />
      </div>
      <div className="mt-2 font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-white/70">
        {label}
      </div>
    </div>
  );

  const Colon = () => (
    <span className="pb-6 font-sans text-4xl font-black text-white/50 sm:text-6xl">
      :
    </span>
  );

  return (
    <div className="flex items-end gap-2 sm:gap-4">
      <Cell label="days" start={0} />
      <Colon />
      <Cell label="hrs" start={2} />
      <Colon />
      <Cell label="min" start={4} />
      <Colon />
      <Cell label="sec" start={6} />
    </div>
  );
}
