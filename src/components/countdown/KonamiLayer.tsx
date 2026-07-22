import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";

// key_sequence is stored as a comma-separated list of KeyboardEvent.key values,
// e.g. "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a"
function parseSeq(s: string): string[] {
  return s
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export function KonamiLayer({
  secrets,
}: {
  secrets: Array<{ slug: string; key_sequence: string }>;
}) {
  const navigate = useNavigate();
  const buffers = useRef<Map<string, string[]>>(new Map());

  useEffect(() => {
    const parsed = secrets.map((s) => ({ slug: s.slug, seq: parseSeq(s.key_sequence) }));
    parsed.forEach((p) => buffers.current.set(p.slug, []));

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      for (const p of parsed) {
        const buf = buffers.current.get(p.slug) ?? [];
        buf.push(key);
        if (buf.length > p.seq.length) buf.shift();
        buffers.current.set(p.slug, buf);
        const expected = p.seq.map((k) => (k.length === 1 ? k.toLowerCase() : k));
        if (buf.length === expected.length && buf.every((v, i) => v === expected[i])) {
          buffers.current.set(p.slug, []);
          navigate({ to: "/secret/$slug", params: { slug: p.slug } });
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [secrets, navigate]);

  return null;
}
