import { CSSProperties } from "react";
import { SlideData } from "../types";

const checkerboardPattern = `
  linear-gradient(45deg, var(--shade-3) 25%, transparent 25%),
  linear-gradient(-45deg, var(--shade-3) 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, var(--shade-3) 75%),
  linear-gradient(-45deg, transparent 75%, var(--shade-3) 75%)
`;

const checkerboardSize = "16px 16px";
const checkerboardPosition = "0 0, 0 8px, 8px -8px, -8px 0px";

export const getBackgroundStyle = (data: SlideData): CSSProperties => {
    let backgroundStyle = checkerboardPattern;


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
        backgroundColor: data.background ? undefined : "black",
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