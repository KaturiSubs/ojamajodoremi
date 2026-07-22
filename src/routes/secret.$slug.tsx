import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkSecret } from "@/lib/secrets.functions";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/secret/$slug")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "…" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SecretPage,
});

function SecretPage() {
  const { slug } = useParams({ from: "/secret/$slug" });
  const navigate = useNavigate();
  const check = useServerFn(checkSecret);
  const [prompt, setPrompt] = useState("What is their secret?");
  const [notFound, setNotFound] = useState(false);
  const [guess, setGuess] = useState("");
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("secrets")
      .select("prompt")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else if (data.prompt) setPrompt(data.prompt);
      });
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!guess.trim() || busy) return;
    setBusy(true);
    setWrong(false);
    try {
      const res = await check({
        data: { slug, guess, userAgent: navigator.userAgent.slice(0, 500) },
      });
      if (res.correct) {
        const dest = res.redirect;
        if (dest && /^https?:\/\//i.test(dest)) {
          window.location.href = dest;
        } else if (dest && dest.startsWith("/")) {
          navigate({ to: dest });
        } else {
          navigate({ to: "/" });
        }
      } else {
        setWrong(true);
        setTimeout(() => setWrong(false), 900);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 text-[color:var(--retro-fg)]">
      <div className="scanlines pointer-events-none absolute inset-0" />
      <div className="vignette pointer-events-none absolute inset-0" />
      <form onSubmit={submit} className="relative z-10 w-full max-w-md space-y-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-[color:var(--retro-muted)]">
          ///&nbsp;{slug}&nbsp;///
        </div>
        <h1 className="retro-title text-2xl uppercase tracking-[0.25em] text-[color:var(--retro-accent)] drop-shadow-[0_0_16px_var(--retro-accent-glow)] sm:text-3xl">
          {notFound ? "the void answers nothing" : prompt}
        </h1>
        {!notFound && (
          <>
            <Input
              autoFocus
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={busy}
              className={
                "h-14 border-2 bg-black/60 text-center font-mono text-lg tracking-widest text-[color:var(--retro-accent)] " +
                (wrong
                  ? "shake border-red-500 text-red-400 shadow-[0_0_30px_rgba(255,0,60,0.6)]"
                  : "border-[color:var(--retro-accent)]/50")
              }
              placeholder="_"
            />
            {wrong && (
              <div className="font-mono text-sm uppercase tracking-[0.4em] text-red-500">
                you are wrong.
              </div>
            )}
            <Button
              type="submit"
              disabled={busy}
              className="w-full font-mono uppercase tracking-widest"
            >
              submit
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
