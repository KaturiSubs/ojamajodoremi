import { useEffect, useState } from "react";

export function Splash() {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setGone(true), 600);
    return () => clearTimeout(t);
  }, [leaving]);

  if (gone) return null;

  return (
    <div
      className={
        "absolute inset-0 z-40 flex items-center justify-center backdrop-blur-2xl transition-opacity duration-500 " +
        (leaving ? "opacity-0 pointer-events-none" : "opacity-100")
      }
      style={{ background: "rgba(0,0,0,0.55)" }}
    >
      <button
        type="button"
        onClick={() => setLeaving(true)}
        className="group relative px-14 py-6 font-sans text-3xl font-light tracking-[0.6em] text-white transition-transform duration-200 hover:scale-105"
        style={{
          textShadow:
            "0 0 24px rgba(255,255,255,0.7), 0 0 60px rgba(255,255,255,0.35)",
        }}
      >
        <span className="absolute inset-0 rounded-sm border border-white/40 transition-colors group-hover:border-white/80" />
        <span className="absolute inset-0 rounded-sm bg-white/0 transition-colors group-hover:bg-white/5" />
        <span className="relative">PRESS</span>
      </button>
    </div>
  );
}
