import { useEffect, useState } from "react";
import drone from "@/assets/audio_drone.wav.asset.json";

const LINES = [
  "I KNOW YOU HAVE BEEN WAITING.",
  "AND I KNOW IT HAS BEEN LONG.",
  "BUT PLEASE...",
  "ACCEPT MY SINCEREST APOLOGIES...",
  "AS YOU MIGHT HAVE TO WAIT A LITTLE LONGER.",
  "EVEN MORE LONGER THAN USUAL.",
  "I AM GRATEFUL",
  "FOR YOUR PATIENCE.",
  "UNTIL THEN...",
];
const FADE = 1000;
const HOLD = 1500;
const GAP = 500;

export function IntroSplash({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const audio = new Audio(drone.url);
    audio.loop = true;
    audio.volume = 0.7;
    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();
    window.addEventListener("pointerdown", tryPlay);
    window.addEventListener("keydown", tryPlay);

    const timers: number[] = [];
    let t = 1000;
    LINES.forEach((_, i) => {
      timers.push(window.setTimeout(() => { setIndex(i); setVisible(true); }, t));
      timers.push(window.setTimeout(() => setVisible(false), t + FADE + HOLD));
      t += FADE * 2 + HOLD + GAP;
    });
    timers.push(
      window.setTimeout(() => {
        const start = audio.volume;
        let step = 0;
        const fade = window.setInterval(() => {
          step++;
          audio.volume = Math.max(0, start * (1 - step / 10));
          if (step >= 10) {
            clearInterval(fade);
            audio.pause();
            onDone();
          }
        }, 80);
      }, t + 500),
    );

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
      audio.pause();
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black px-6">
      <p
        className="text-center text-xl tracking-[0.2em] text-white sm:text-3xl"
        style={{
          fontFamily: '"Determination Mono", monospace',
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE}ms ease-in-out`,
        }}
      >
        {index >= 0 ? LINES[index] : ""}
      </p>
    </div>
  );
}
