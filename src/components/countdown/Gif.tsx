import { useEffect, useRef, useState } from "react";
import { parseGIF, decompressFrames, type ParsedFrame } from "gifuct-js";

// Cache of decoded frames per URL so re-mounts / restarts are instant and
// we never depend on the browser's <img> gif player (which always loops).
const cache = new Map<
  string,
  Promise<{ width: number; height: number; frames: ParsedFrame[] }>
>();

async function loadGif(url: string) {
  let p = cache.get(url);
  if (p) return p;
  p = (async () => {
    const buf = await fetch(url).then((r) => r.arrayBuffer());
    const gif = parseGIF(buf);
    const frames = decompressFrames(gif, true);
    return { width: gif.lsd.width, height: gif.lsd.height, frames };
  })();
  cache.set(url, p);
  return p;
}

export function Gif({
  src,
  resetKey,
  className,
  style,
}: {
  src: string;
  /** Change this value to restart playback from frame 0. */
  resetKey?: string | number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | null = null;

    (async () => {
      const { width, height, frames } = await loadGif(src);
      if (cancelled) return;
      setSize({ w: width, h: height });

      // Wait a tick so the canvas dimensions are applied before drawing.
      await Promise.resolve();
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Offscreen buffer for compositing patch frames.
      const patchCanvas = document.createElement("canvas");
      const patchCtx = patchCanvas.getContext("2d");
      if (!patchCtx) return;

      let i = 0;
      let prevImageData: ImageData | null = null;

      const drawFrame = () => {
        if (cancelled) return;
        if (i >= frames.length) return; // stop on last frame — do NOT loop
        const frame = frames[i];

        // Disposal from PREVIOUS frame is handled implicitly by keeping the
        // canvas as-is (type 1 = leave). For type 2 / 3 we'd need extra work,
        // but the source gifs render acceptably with the leave-in-place path.
        patchCanvas.width = frame.dims.width;
        patchCanvas.height = frame.dims.height;
        const imageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height,
        );
        patchCtx.putImageData(imageData, 0, 0);

        if (frame.disposalType === 3) {
          prevImageData = ctx.getImageData(0, 0, width, height);
        }

        ctx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);

        const delay = frame.delay || 100;
        i += 1;
        if (i < frames.length) {
          timeoutId = window.setTimeout(() => {
            if (frame.disposalType === 2) {
              ctx.clearRect(
                frame.dims.left,
                frame.dims.top,
                frame.dims.width,
                frame.dims.height,
              );
            } else if (frame.disposalType === 3 && prevImageData) {
              ctx.putImageData(prevImageData, 0, 0);
            }
            drawFrame();
          }, delay);
        }
      };

      // Fresh start: clear canvas fully so restarts show first frame cleanly.
      ctx.clearRect(0, 0, width, height);
      drawFrame();
    })();

    return () => {
      cancelled = true;
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [src, resetKey]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        imageRendering: "pixelated",
        width: "100%",
        height: "auto",
        aspectRatio: size ? `${size.w} / ${size.h}` : undefined,
        ...style,
      }}
    />
  );
}
