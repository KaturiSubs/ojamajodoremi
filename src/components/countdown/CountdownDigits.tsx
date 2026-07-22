function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownDigits({ target, now }: { target: number; now: number }) {
  const diff = Math.max(0, target - now);
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const Cell = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="glitch retro-digit rounded-md border border-[color:var(--retro-accent)]/40 bg-black/60 px-4 py-3 font-mono text-5xl tabular-nums text-[color:var(--retro-accent)] shadow-[0_0_30px_var(--retro-accent-glow)] sm:px-6 sm:py-4 sm:text-7xl">
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[color:var(--retro-muted)]">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex items-end gap-2 sm:gap-4">
      <Cell value={pad(days)} label="days" />
      <span className="pb-8 font-mono text-4xl text-[color:var(--retro-accent)]/60">:</span>
      <Cell value={pad(hours)} label="hrs" />
      <span className="pb-8 font-mono text-4xl text-[color:var(--retro-accent)]/60">:</span>
      <Cell value={pad(mins)} label="min" />
      <span className="pb-8 font-mono text-4xl text-[color:var(--retro-accent)]/60">:</span>
      <Cell value={pad(secs)} label="sec" />
    </div>
  );
}
