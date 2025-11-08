import { CSSProperties } from "react";
import { SlideData } from "../types";
import { CanvasSize } from "../../../presenter/types";

const checkerboardPattern = `
  linear-gradient(45deg, var(--shade-3) 25%, transparent 25%),
  linear-gradient(-45deg, var(--shade-3) 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, var(--shade-3) 75%),
  linear-gradient(-45deg, transparent 75%, var(--shade-3) 75%)
`;

export const getBackgroundStyle = (
  data: SlideData, 
  canvasSize: CanvasSize = { width: 1920, height: 1080 }
): CSSProperties => {
    let backgroundStyle = checkerboardPattern;
    
    // Calculate checkerboard size as 5% of canvas width for proportional sizing
    const squareSize = Math.round(canvasSize.width * 0.05);
    const halfSquareSize = squareSize / 2;
    const checkerboardSize = `${squareSize}px ${squareSize}px`;
    const checkerboardPosition = `0 0, 0 ${halfSquareSize}px, ${halfSquareSize}px -${halfSquareSize}px, -${halfSquareSize}px 0px`;


    switch (data.background?.type) {
      case "color":
        backgroundStyle = data.background.value;
        break;
      case "image":
        backgroundStyle = `url(${data.background.value})`;
        break;
      // For now, videos will be handled separately in the component
      case "video":
      default:
        backgroundStyle = checkerboardPattern;
    }

    return {
        background: backgroundStyle,
        backgroundColor: data.background?.type === 'color' ? data.background.value : "black",
        backgroundSize:
          data.background?.type === "image"
            ? "cover"
            : data.background
              ? undefined
              : checkerboardSize,
        backgroundPosition:
          data.background?.type === "image"
            ? "center"
            : data.background
              ? undefined
              : checkerboardPosition,
      };
  };