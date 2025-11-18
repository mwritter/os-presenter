import { CanvasSize } from "@/components/presenter/types";
import { CSSProperties } from "react";

// Mask overlay style - shows grayed area outside the slide bounds in edit mode
export const getSlideMaskOverlay = ({
  canvasSize,
  scale,
  isReady,
}: {
  canvasSize: CanvasSize;
  scale: number;
  isReady: boolean;
}): CSSProperties => {
  return {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: "center center",
    pointerEvents: "none",
    zIndex: 20,
    boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.4)`, // Gray overlay outside bounds
    opacity: isReady ? 1 : 0,
    transition: "opacity 200ms ease-in",
  };
};
