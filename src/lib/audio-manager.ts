// Tracks Audio elements created by secret pages so they can all be stopped
// (e.g. when the user is redirected back to the countdown site).

const active = new Set<HTMLAudioElement>();

export function playSecret(
  url: string,
  opts: { loop?: boolean; volume?: number; onEnded?: () => void } = {},
) {
  const a = new Audio(url);
  a.loop = !!opts.loop;
  a.volume = opts.volume ?? 1;
  a.crossOrigin = "anonymous";
  const cleanup = () => {
    active.delete(a);
  };
  a.addEventListener("ended", () => {
    cleanup();
    opts.onEnded?.();
  });
  active.add(a);
  a.play().catch(() => {});
  return a;
}

export function stopSecret(a: HTMLAudioElement | null | undefined) {
  if (!a) return;
  try {
    a.pause();
  } catch {
    /* ignore */
  }
  a.src = "";
  active.delete(a);
}

export function stopAllSecrets() {
  for (const a of Array.from(active)) {
    try {
      a.pause();
    } catch {
      /* ignore */
    }
    a.src = "";
  }
  active.clear();
}
