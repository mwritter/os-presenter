import { useEffect } from "react";
import { CanvasSize } from "@/components/presenter/types";

// Calculate scale to match the Slide component's scaling
export const useScaleOnResize = ({
  containerRef,
  scaleRef,
  canvasSize,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scaleRef: React.RefObject<number>;
  canvasSize: CanvasSize;
}) => {
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const scaleX = containerWidth / canvasSize.width;
      const scaleY = containerHeight / canvasSize.height;
      const newScale = Math.min(scaleX, scaleY);

      scaleRef.current = newScale;
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateScale);
      resizeObserver.disconnect();
    };
  }, [canvasSize.width, canvasSize.height]);
};
