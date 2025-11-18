import { CSSProperties } from "react";
import { CanvasSize } from "@/components/presenter/types";

const checkerboardPattern = `
  linear-gradient(45deg, var(--shade-3) 25%, transparent 25%),
  linear-gradient(-45deg, var(--shade-3) 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, var(--shade-3) 75%),
  linear-gradient(-45deg, transparent 75%, var(--shade-3) 75%)
`;

export const getEmptyBackgroundStyle = (
  canvasSize: CanvasSize = { width: 1920, height: 1080 }
): CSSProperties => {
  // Calculate checkerboard size as 5% of canvas width for proportional sizing
  const squareSize = Math.round(canvasSize.width * 0.05);
  const halfSquareSize = squareSize / 2;
  const checkerboardSize = `${squareSize}px ${squareSize}px`;
  const checkerboardPosition = `0 0, 0 ${halfSquareSize}px, ${halfSquareSize}px -${halfSquareSize}px, -${halfSquareSize}px 0px`;

  return {
    background: checkerboardPattern,
    backgroundColor: "black",
    backgroundSize: checkerboardSize,
    backgroundPosition: checkerboardPosition,
  };
};
