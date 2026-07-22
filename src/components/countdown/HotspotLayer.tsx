import { useNavigate } from "@tanstack/react-router";

export function HotspotLayer({
  hotspots,
}: {
  hotspots: Array<{ id: string; x_pct: number; y_pct: number; width_pct: number; height_pct: number; slug: string }>;
}) {
  const navigate = useNavigate();
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {hotspots.map((h) => (
        <button
          key={h.id}
          type="button"
          aria-label=""
          className="pointer-events-auto absolute cursor-help opacity-0 hover:opacity-[0.02]"
          style={{
            left: `${h.x_pct}%`,
            top: `${h.y_pct}%`,
            width: `${h.width_pct}%`,
            height: `${h.height_pct}%`,
          }}
          onClick={() => navigate({ to: "/secret/$slug", params: { slug: h.slug } })}
        />
      ))}
    </div>
  );
}
