export function BackgroundLayer({ url, kind }: { url: string | null; kind: string }) {
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
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={url}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 z-0 bg-cover bg-center"
      style={{ backgroundImage: `url("${url}")` }}
    />
  );
}
