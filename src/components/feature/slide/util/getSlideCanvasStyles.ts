import { CanvasSize } from "@/components/presenter/types";
import { CSSProperties } from "react";
import { getEmptyBackgroundStyle } from "./getBackgroundStyle";

// Canvas style - fixed size that gets scaled
export const getSlideCanvasStyles = ({
  backgroundColor,
  canvasSize,
  scale = 1,
  isEditable = false,
  isReady = true,
}: {
  backgroundColor?: string;
  canvasSize: CanvasSize;
  scale?: number;
  isEditable?: boolean;
  isReady?: boolean;
}): CSSProperties => {
  const background = backgroundColor
    ? { backgroundColor }
    : getEmptyBackgroundStyle(canvasSize);

  return {
    ...background,
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: "center center",
    overflow: isEditable ? "visible" : "hidden", // Allow overflow in edit mode
    willChange: "transform",
    backfaceVisibility: "hidden",
    opacity: isReady ? 1 : 0,
  };
};
