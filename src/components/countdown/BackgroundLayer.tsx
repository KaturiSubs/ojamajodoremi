import { useEffect, useRef } from "react";

export function BackgroundLayer({ url, kind }: { url: string | null; kind: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Single looping <video>. Uses native `loop` so only one decoder pipeline is
  // alive at a time (half the memory of a double-buffered setup) and adds
  // lightweight recovery for stalled/errored playback so the BG can't freeze.
  useEffect(() => {
    if (kind !== "video" || !url) return;
    const v = videoRef.current;
    if (!v) return;

    let disposed = false;
    let recoverTimer: ReturnType<typeof setTimeout> | null = null;

    const tryPlay = () => {
      v.play().catch(() => {});
    };

    const recover = () => {
      if (disposed) return;
      if (recoverTimer) return;
      recoverTimer = setTimeout(() => {
        recoverTimer = null;
        if (disposed) return;
        try {
          const t = v.currentTime;
          v.load();
          v.currentTime = Number.isFinite(t) ? t : 0;
          tryPlay();
        } catch {
          /* ignore */
        }
      }, 400);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") tryPlay();
      else v.pause();
    };

    v.addEventListener("stalled", recover);
    v.addEventListener("error", recover);
    v.addEventListener("suspend", recover);
    document.addEventListener("visibilitychange", onVisibility);
    tryPlay();

    return () => {
      disposed = true;
      if (recoverTimer) clearTimeout(recoverTimer);
      v.removeEventListener("stalled", recover);
      v.removeEventListener("error", recover);
      v.removeEventListener("suspend", recover);
      document.removeEventListener("visibilitychange", onVisibility);
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
          ref={videoRef}
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 h-full w-full object-cover"
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
