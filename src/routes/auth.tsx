import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. You are the admin now.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message ?? "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-[color:var(--retro-fg)]">
      <div className="scanlines pointer-events-none absolute inset-0" />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-sm space-y-5 rounded-md border border-[color:var(--retro-accent)]/40 bg-black/80 p-8 shadow-[0_0_60px_var(--retro-accent-glow)]"
      >
        <h1 className="retro-title text-center text-2xl uppercase tracking-[0.4em] text-[color:var(--retro-accent)]">
          {mode === "signup" ? "claim admin" : "admin access"}
        </h1>
        <div className="space-y-2">
          <Label className="font-mono text-xs uppercase tracking-widest">email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-xs uppercase tracking-widest">password</Label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full font-mono uppercase tracking-widest">
          {loading ? "..." : mode === "signup" ? "create" : "enter"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="block w-full text-center font-mono text-[10px] uppercase tracking-widest text-[color:var(--retro-muted)] hover:text-[color:var(--retro-accent)]"
        >
          {mode === "signup" ? "have an account? sign in" : "first time? claim admin"}
        </button>
      </form>
    </div>
  );
}
