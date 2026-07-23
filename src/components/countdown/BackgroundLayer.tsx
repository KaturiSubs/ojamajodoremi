import { useEffect, useRef } from "react";

export function BackgroundLayer({ url, kind }: { url: string | null; kind: string }) {
  const aRef = useRef<HTMLVideoElement | null>(null);
  const bRef = useRef<HTMLVideoElement | null>(null);

  // Gapless video loop: two overlapping <video> elements, swap visibility just
  // before one ends so playback never pauses on the loop boundary.
  useEffect(() => {
    if (kind !== "video" || !url) return;
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    let active: HTMLVideoElement = a;
    let standby: HTMLVideoElement = b;
    active.style.opacity = "1";
    standby.style.opacity = "0";
    active.currentTime = 0;
    standby.currentTime = 0;
    active.play().catch(() => {});

    const onTime = () => {
      const d = active.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      if (d - active.currentTime <= 0.25 && standby.paused) {
        standby.currentTime = 0;
        standby.play().catch(() => {});
      }
    };
    const onEnded = () => {
      standby.style.opacity = "1";
      active.style.opacity = "0";
      active.pause();
      active.currentTime = 0;
      const tmp = active;
      active = standby;
      standby = tmp;
      // rebind listeners to the new active element
      bindActive();
    };
    const bindActive = () => {
      a.removeEventListener("timeupdate", onTime);
      b.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
      b.removeEventListener("ended", onEnded);
      active.addEventListener("timeupdate", onTime);
      active.addEventListener("ended", onEnded);
    };
    bindActive();

    return () => {
      a.removeEventListener("timeupdate", onTime);
      b.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
      b.removeEventListener("ended", onEnded);
    };
  }, [url, kind]);

  if (!url) {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.18 0.06 300) 0%, oklch(0.06 0.03 280) 60%, #000 100%)",
        }}
      />
    );
  }

  if (kind === "video") {
    return (
      <div className="absolute inset-0 z-0">
        <video
          ref={aRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-75"
          src={url}
        />
        <video
          ref={bRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-75"
          src={url}
        />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-0 bg-cover bg-center"
      style={{ backgroundImage: `url("${url}")` }}
    />
  );
}
