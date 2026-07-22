function extractId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "embed" || p === "live" || p === "shorts");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return null;
  } catch {
    return null;
  }
}

export function YouTubeEmbed({ url }: { url: string }) {
  const id = extractId(url);
  if (!id) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="rounded-md border border-[color:var(--retro-accent)] px-6 py-3 font-mono uppercase tracking-widest text-[color:var(--retro-accent)] hover:bg-[color:var(--retro-accent)]/10"
      >
        Watch now →
      </a>
    );
  }
  return (
    <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-md border border-[color:var(--retro-accent)]/40 shadow-[0_0_60px_var(--retro-accent-glow)]">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title="Premiere"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
