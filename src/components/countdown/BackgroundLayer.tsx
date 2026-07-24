import { useEffect, useRef } from "react";

export function BackgroundLayer({ url, kind }: { url: string | null; kind: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Single looping <video>. Uses native `loop` so only one decoder pipeline is
  // alive at a time. Only recovers on real errors — `stalled`/`suspend` fire
  // during normal buffering and reloading on them causes flicker.
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
      if (disposed || recoverTimer) return;
      recoverTimer = setTimeout(() => {
        recoverTimer = null;
        if (disposed) return;
        try {
          v.load();
          tryPlay();
        } catch {
          /* ignore */
        }
      }, 800);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") tryPlay();
      else v.pause();
    };

    v.addEventListener("error", recover);
    document.addEventListener("visibilitychange", onVisibility);
    tryPlay();

    return () => {
      disposed = true;
      if (recoverTimer) clearTimeout(recoverTimer);
      v.removeEventListener("error", recover);
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
