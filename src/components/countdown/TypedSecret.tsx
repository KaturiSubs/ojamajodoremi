import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkSecret } from "@/lib/secrets.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SFX } from "@/lib/asset-urls";

export function TypedSecret() {
  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState("");
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const check = useServerFn(checkSecret);

  useEffect(() => {
    if (revealed) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, [role='button']"))
        return;
      setRevealed(true);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [revealed]);

  useEffect(() => {
    if (revealed) setTimeout(() => inputRef.current?.focus(), 50);
  }, [revealed]);

  function playSfx(url: string, volume = 0.7) {
    try {
      sfxRef.current?.pause();
    } catch {
      /* ignore */
    }
    const a = new Audio(url);
    a.volume = volume;
    sfxRef.current = a;
    a.play().catch(() => {});
    return a;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!guess.trim() || busy) return;
    setBusy(true);
    setWrong(false);
    try {
      const res = await check({
        data: {
          guess,
          userAgent:
            typeof navigator !== "undefined"
              ? navigator.userAgent.slice(0, 500)
              : undefined,
        },
      });
      if (res.correct) {
        playSfx(SFX.ominousCorrect, 0.7);
        const dest = res.redirect;
        setTimeout(() => {
          try {
            sfxRef.current?.pause();
          } catch {
            /* ignore */
          }
          if (dest && /^https?:\/\//i.test(dest)) window.location.href = dest;
          else if (dest && dest.startsWith("/")) window.location.href = dest;
          else window.location.href = "/";
        }, 900);
      } else if (res.forbidden) {
        playSfx(SFX.ominousForbidden, 0.7);
        // Notify countdown page to trigger white-flash / spam escalation.
        window.dispatchEvent(new CustomEvent("ominous-hit"));
        setWrong(true);
        setTimeout(() => setWrong(false), 900);
      } else {
        playSfx(SFX.ominousWrong, 0.7);
        setWrong(true);
        setTimeout(() => setWrong(false), 900);
      }
    } finally {
      setBusy(false);
    }
  }

  if (!revealed) return null;

  return (
    <form
      onSubmit={submit}
      className="mt-6 flex w-full max-w-md flex-col items-center gap-3"
    >
      <p className="font-sans text-sm font-light uppercase tracking-[0.35em] text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
        INPUT.
      </p>
      <Input
        ref={inputRef}
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        disabled={busy}
        placeholder="…"
        className={
          "h-12 border-2 bg-black/40 text-center font-sans text-base tracking-wide text-white placeholder:text-white/30 " +
          (wrong
            ? "shake border-red-500 text-red-300 shadow-[0_0_30px_rgba(255,0,60,0.7)]"
            : "border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)]")
        }
      />
      {wrong && (
        <div className="font-sans text-sm uppercase tracking-[0.35em] text-red-400">
          Unrelated. Try again.
        </div>
      )}
      <Button
        type="submit"
        disabled={busy}
        variant="outline"
        className="font-sans uppercase tracking-widest"
      >
        submit
      </Button>
    </form>
  );
}
