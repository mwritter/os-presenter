import { CanvasSize } from "@/components/presenter/types";
import { useEffect, useState } from "react";

/**
 * Computes the uniform "contain" scale factor that fits a fixed design canvas
 * (e.g. 1920x1080) into its container, recomputed on container/window resize.
 *
 * The canvas is rendered with opacity 0 until `isReady`, so there is no need for a
 * cross-instance scale cache (a previous cache keyed only by canvas size produced wrong
 * initial scales when the same canvas size was rendered at very different container sizes,
 * e.g. a thumbnail vs. the audience window).
 */
export const useSlideScale = ({
  canvasSize,
  containerRef,
}: {
  canvasSize: CanvasSize;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [scale, setScale] = useState<{
    scale: number;
    isReady: boolean;
  }>({
    scale: 0.1,
    isReady: false,
  });

  useEffect(() => {
    let rafId: number | null = null;

    const updateScale = () => {
      if (!containerRef.current) return;

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Batch with rAF to avoid layout thrash / flicker.
      rafId = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const scaleX = containerWidth / canvasSize.width;
        const scaleY = containerHeight / canvasSize.height;
        const newScale = Math.min(scaleX, scaleY);

        // Skip the state update (and the resulting object-tree re-render) when nothing changed.
        setScale((prev) => {
          if (prev.isReady && Math.abs(prev.scale - newScale) < 0.0001) {
            return prev;
          }
          return { scale: newScale, isReady: true };
        });
      });
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", updateScale);
      resizeObserver.disconnect();
    };
  }, [canvasSize.width, canvasSize.height, containerRef]);

  return scale;
};
