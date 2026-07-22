import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type Settings = Tables<"site_settings">;
type Secret = Tables<"secrets">;
type Hotspot = Tables<"hotspots">;
type Submission = Tables<"secret_submissions">;

function AdminPage() {
  const { user, isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) return <div className="p-8 font-mono">::: loading :::</div>;
  if (!isAdmin)
    return (
      <div className="p-8 font-mono">
        Access denied. Only the admin can view this page.
      </div>
    );

  return (
    <div className="min-h-screen bg-black p-6 text-[color:var(--retro-fg)]">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="retro-title text-2xl uppercase tracking-[0.3em] text-[color:var(--retro-accent)]">
          admin console
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="font-mono uppercase tracking-widest"
          >
            view site
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="font-mono uppercase tracking-widest"
          >
            sign out
          </Button>
        </div>
      </header>

      <Tabs defaultValue="settings">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
        <TabsContent value="media"><MediaTab /></TabsContent>
        <TabsContent value="secrets"><SecretsTab /></TabsContent>
        <TabsContent value="hotspots"><HotspotsTab /></TabsContent>
        <TabsContent value="submissions"><SubmissionsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsTab() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setS(data));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!s) return <div className="font-mono">loading…</div>;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));

  async function save() {
    if (!s) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        title: s.title,
        countdown_target_at: s.countdown_target_at,
        youtube_url: s.youtube_url,
        background_url: s.background_url,
        background_kind: s.background_kind,
        music_url: s.music_url,
        default_volume: s.default_volume,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved.");
  }

  const dtLocal = s.countdown_target_at
    ? new Date(s.countdown_target_at).toISOString().slice(0, 16)
    : "";

  return (
    <div className="grid max-w-2xl gap-4">
      <div>
        <Label>Title</Label>
        <Input value={s.title ?? ""} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div>
        <Label>Countdown target (UTC)</Label>
        <Input
          type="datetime-local"
          value={dtLocal}
          onChange={(e) =>
            set("countdown_target_at", e.target.value ? new Date(e.target.value).toISOString() : null)
          }
        />
      </div>
      <div>
        <Label>YouTube URL (shown when countdown ends)</Label>
        <Input value={s.youtube_url ?? ""} onChange={(e) => set("youtube_url", e.target.value)} />
      </div>
      <div>
        <Label>Background URL</Label>
        <Input value={s.background_url ?? ""} onChange={(e) => set("background_url", e.target.value)} />
      </div>
      <div>
        <Label>Background kind</Label>
        <select
          className="h-10 rounded-md border bg-transparent px-3"
          value={s.background_kind ?? "image"}
          onChange={(e) => set("background_kind", e.target.value)}
        >
          <option value="image">image</option>
          <option value="video">video</option>
        </select>
      </div>
      <div>
        <Label>Music URL</Label>
        <Input value={s.music_url ?? ""} onChange={(e) => set("music_url", e.target.value)} />
      </div>
      <div>
        <Label>Default volume (0–100)</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={s.default_volume ?? 60}
          onChange={(e) => set("default_volume", Number(e.target.value))}
        />
      </div>
      <Button onClick={save} disabled={saving} className="font-mono uppercase tracking-widest">
        {saving ? "saving…" : "save"}
      </Button>
    </div>
  );
}

function MediaTab() {
  const [files, setFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase.storage.from("media").list("", { limit: 100 });
    if (!data) return;
    const rows = await Promise.all(
      data
        .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
        .map(async (f) => {
          const { data: signed } = await supabase.storage
            .from("media")
            .createSignedUrl(f.name, 60 * 60 * 24 * 7);
          return { name: f.name, url: signed?.signedUrl ?? "" };
        }),
    );
    setFiles(rows);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
    setUploading(false);
    e.target.value = "";
    if (error) toast.error(error.message);
    else {
      toast.success("Uploaded. Copy the signed URL into Settings.");
      refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Upload file (image / video / audio)</Label>
        <Input type="file" onChange={onUpload} disabled={uploading} />
        <p className="mt-1 font-mono text-xs text-[color:var(--retro-muted)]">
          Signed URLs expire in 7 days. For long-lived backgrounds/music, host on an external CDN
          and paste the URL directly in Settings.
        </p>
      </div>
      <div className="space-y-2">
        {files.map((f) => (
          <div key={f.name} className="rounded border p-2 font-mono text-xs">
            <div className="font-bold">{f.name}</div>
            <input
              readOnly
              className="mt-1 w-full bg-transparent"
              value={f.url}
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="mt-1 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(f.url);
                  toast.success("Copied");
                }}
              >
                copy
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  await supabase.storage.from("media").remove([f.name]);
                  refresh();
                }}
              >
                delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecretsTab() {
  const [items, setItems] = useState<Secret[]>([]);
  const load = useCallback(() => {
    supabase.from("secrets").select("*").order("created_at").then(({ data }) => setItems(data ?? []));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add() {
    const slug = prompt("Slug (e.g. cassette-001):")?.trim();
    if (!slug) return;
    const { error } = await supabase.from("secrets").insert({
      slug,
      prompt: "What is their secret?",
      correct_answers: [],
      discovery_type: "hidden_route",
    });
    if (error) toast.error(error.message);
    else load();
  }

  return (
    <div className="space-y-4">
      <Button onClick={add} className="font-mono uppercase tracking-widest">+ new secret</Button>
      {items.map((it) => (
        <SecretRow key={it.id} secret={it} onChange={load} />
      ))}
    </div>
  );
}

function SecretRow({ secret, onChange }: { secret: Secret; onChange: () => void }) {
  const [s, setS] = useState<Secret>(secret);
  const set = <K extends keyof Secret>(k: K, v: Secret[K]) => setS((p) => ({ ...p, [k]: v }));

  async function save() {
    const { error } = await supabase
      .from("secrets")
      .update({
        slug: s.slug,
        prompt: s.prompt,
        correct_answers: s.correct_answers,
        discovery_type: s.discovery_type,
        key_sequence: s.key_sequence,
        on_correct_redirect: s.on_correct_redirect,
      })
      .eq("id", s.id);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  }

  async function del() {
    if (!confirm("Delete this secret?")) return;
    await supabase.from("secrets").delete().eq("id", s.id);
    onChange();
  }

  const answers = Array.isArray(s.correct_answers) ? s.correct_answers.join("\n") : "";

  return (
    <div className="grid gap-3 rounded border p-4 sm:grid-cols-2">
      <div><Label>Slug</Label><Input value={s.slug} onChange={(e) => set("slug", e.target.value)} /></div>
      <div>
        <Label>Discovery type</Label>
        <select
          className="h-10 w-full rounded-md border bg-transparent px-3"
          value={s.discovery_type ?? "hidden_route"}
          onChange={(e) => set("discovery_type", e.target.value)}
        >
          <option value="hidden_route">hidden_route</option>
          <option value="hotspot">hotspot</option>
          <option value="key_sequence">key_sequence</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <Label>Prompt</Label>
        <Input value={s.prompt ?? ""} onChange={(e) => set("prompt", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Label>Correct answers (one per line, case-insensitive)</Label>
        <Textarea
          value={answers}
          onChange={(e) =>
            set("correct_answers", e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))
          }
        />
      </div>
      <div>
        <Label>Key sequence (comma-separated, for key_sequence type)</Label>
        <Input
          placeholder="ArrowUp,ArrowUp,ArrowDown,ArrowDown,b,a"
          value={s.key_sequence ?? ""}
          onChange={(e) => set("key_sequence", e.target.value)}
        />
      </div>
      <div>
        <Label>On correct: redirect URL (optional)</Label>
        <Input value={s.on_correct_redirect ?? ""} onChange={(e) => set("on_correct_redirect", e.target.value)} />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button onClick={save} className="font-mono uppercase tracking-widest">save</Button>
        <Button variant="destructive" onClick={del} className="font-mono uppercase tracking-widest">delete</Button>
        <a
          className="ml-auto self-center font-mono text-xs underline"
          href={`/secret/${s.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          /secret/{s.slug} ↗
        </a>
      </div>
    </div>
  );
}

function HotspotsTab() {
  const [items, setItems] = useState<(Hotspot & { secrets: { slug: string } | null })[]>([]);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const load = useCallback(() => {
    supabase.from("hotspots").select("*, secrets(slug)").then(({ data }) => setItems((data ?? []) as any));
    supabase.from("secrets").select("*").then(({ data }) => setSecrets(data ?? []));
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add() {
    if (secrets.length === 0) {
      toast.error("Create a secret first");
      return;
    }
    const { error } = await supabase.from("hotspots").insert({
      secret_id: secrets[0].id,
      x_pct: 45,
      y_pct: 45,
      width_pct: 10,
      height_pct: 10,
    });
    if (error) toast.error(error.message);
    else load();
  }

  return (
    <div className="space-y-4">
      <Button onClick={add} className="font-mono uppercase tracking-widest">+ new hotspot</Button>
      <p className="font-mono text-xs text-[color:var(--retro-muted)]">
        Position/size in % of viewport. Hotspots are invisible on the site; clicking one opens
        <code> /secret/&lt;slug&gt;</code>.
      </p>
      {items.map((h) => (
        <HotspotRow key={h.id} hotspot={h} secrets={secrets} onChange={load} />
      ))}
    </div>
  );
}

function HotspotRow({
  hotspot,
  secrets,
  onChange,
}: {
  hotspot: Hotspot & { secrets: { slug: string } | null };
  secrets: Secret[];
  onChange: () => void;
}) {
  const [h, setH] = useState(hotspot);
  const set = <K extends keyof Hotspot>(k: K, v: Hotspot[K]) => setH((p) => ({ ...p, [k]: v }));

  async function save() {
    const { error } = await supabase
      .from("hotspots")
      .update({
        secret_id: h.secret_id,
        x_pct: h.x_pct,
        y_pct: h.y_pct,
        width_pct: h.width_pct,
        height_pct: h.height_pct,
      })
      .eq("id", h.id);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  }
  async function del() {
    await supabase.from("hotspots").delete().eq("id", h.id);
    onChange();
  }

  return (
    <div className="grid gap-3 rounded border p-4 sm:grid-cols-5">
      <div className="sm:col-span-2">
        <Label>Secret</Label>
        <select
          className="h-10 w-full rounded-md border bg-transparent px-3"
          value={h.secret_id ?? ""}
          onChange={(e) => set("secret_id", e.target.value)}
        >
          {secrets.map((s) => (
            <option key={s.id} value={s.id}>{s.slug}</option>
          ))}
        </select>
      </div>
      {(["x_pct", "y_pct", "width_pct", "height_pct"] as const).map((k) => (
        <div key={k}>
          <Label>{k}</Label>
          <Input
            type="number"
            step="0.1"
            value={h[k] as number}
            onChange={(e) => set(k, Number(e.target.value) as any)}
          />
        </div>
      ))}
      <div className="flex gap-2 sm:col-span-5">
        <Button onClick={save} className="font-mono uppercase tracking-widest">save</Button>
        <Button variant="destructive" onClick={del} className="font-mono uppercase tracking-widest">delete</Button>
      </div>
    </div>
  );
}

function SubmissionsTab() {
  const [items, setItems] = useState<Submission[]>([]);
  useEffect(() => {
    supabase
      .from("secret_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => setItems(data ?? []));
  }, []);
  return (
    <div className="space-y-2 font-mono text-xs">
      {items.length === 0 && <div>no submissions yet.</div>}
      {items.map((s) => (
        <div
          key={s.id}
          className={
            "rounded border p-2 " +
            (s.is_correct ? "border-green-500/60" : "border-white/10")
          }
        >
          <div className="flex justify-between">
            <span>[{s.secret_slug}]</span>
            <span className="opacity-60">{new Date(s.created_at as string).toLocaleString()}</span>
          </div>
          <div>guess: <span className="text-[color:var(--retro-accent)]">{s.guess}</span></div>
          <div>correct: {s.is_correct ? "✓" : "✗"}</div>
        </div>
      ))}
    </div>
  );
}
